import jwt from 'jsonwebtoken';
import { User } from '../../models/User';
import { IUser } from '../../types/user';
import {
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} from '../../middlewares/errorHandler';

const CUSTOMER_JWT_SECRET = process.env.CUSTOMER_JWT_SECRET || process.env.JWT_SECRET!;
const CUSTOMER_JWT_EXPIRES = process.env.CUSTOMER_JWT_EXPIRES_IN || '7d';
const CUSTOMER_REFRESH_EXPIRES = process.env.CUSTOMER_REFRESH_TOKEN_EXPIRES_IN || '30d';

export interface CustomerSignupInput {
  name: string;
  phone: string;
  email?: string;
  password: string;
  bikeModel?: string;
  address?: string;
  loginMethod?: 'phone' | 'email';
}

export interface CustomerLoginInput {
  identifier: string; // phone OR email
  password: string;
}

export class CustomerAuthService {
  // Generate access token
  private generateAccessToken(customerId: string, phone: string): string {
    return jwt.sign(
      { customerId, phone, role: 'customer' },
      CUSTOMER_JWT_SECRET,
      { expiresIn: CUSTOMER_JWT_EXPIRES } as any
    );
  }

  // Generate refresh token
  private generateRefreshToken(customerId: string): string {
    return jwt.sign(
      { customerId, type: 'refresh' },
      CUSTOMER_JWT_SECRET,
      { expiresIn: CUSTOMER_REFRESH_EXPIRES } as any
    );
  }

  // Signup
  async signup(data: CustomerSignupInput) {
    // Check if phone already registered
    const existingByPhone = await User.findOne({ phoneNumber: data.phone });
    if (existingByPhone) {
      if (existingByPhone.password) {
        throw new ConflictError('An account with this phone number already exists.');
      }
      // Existing CRM record without auth — upgrade it
      existingByPhone.firstName = data.name;
      existingByPhone.password = data.password; // pre-save hook will hash
      existingByPhone.address = data.address;
      if (data.email) existingByPhone.email = data.email;
      if (data.bikeModel && !existingByPhone.bikeModel.includes(data.bikeModel)) {
        existingByPhone.bikeModel.push(data.bikeModel);
      }
      existingByPhone.role = 'customer' as any;
      await existingByPhone.save();

      const accessToken = this.generateAccessToken(existingByPhone._id.toString(), existingByPhone.phoneNumber!);
      const refreshToken = this.generateRefreshToken(existingByPhone._id.toString());
      existingByPhone.refreshToken = refreshToken;
      await existingByPhone.save();

      return {
        success: true,
        message: 'Account activated successfully.',
        data: {
          token: accessToken,
          refreshToken,
          user: this.sanitize(existingByPhone),
        }
      };
    }

    // Check if email already used
    if (data.email) {
      const existingByEmail = await User.findOne({ email: data.email, password: { $exists: true } });
      if (existingByEmail) {
        throw new ConflictError('An account with this email already exists.');
      }
    }

    // Create brand-new customer
    const customer = new User({
      firstName: data.name,
      phoneNumber: data.phone,
      email: data.email || `${data.phone}@customer.local`,
      password: data.password, // pre-save hook hashes
      address: data.address,
      bikeModel: data.bikeModel ? [data.bikeModel] : [],
      role: 'customer',
      status: 'active',
    });

    await customer.save();

    const accessToken = this.generateAccessToken(customer._id.toString(), customer.phoneNumber!);
    const refreshToken = this.generateRefreshToken(customer._id.toString());
    customer.refreshToken = refreshToken;
    await customer.save();

    return {
      success: true,
      message: 'Account created successfully.',
      data: {
        token: accessToken,
        refreshToken,
        user: this.sanitize(customer),
      }
    };
  }

  // Login (phone OR email + password)
  async login(data: CustomerLoginInput) {
    const { identifier, password } = data;

    // Find by phone or email, include password field
    const isEmail = identifier.includes('@');
    const query = isEmail ? { email: identifier } : { phoneNumber: identifier };

    const customer = await User.findOne(query).select('+password +refreshToken');

    if (!customer || !customer.password) {
      throw new UnauthorizedError('Invalid credentials. Please check your phone/email and password.');
    }

    if (customer.status !== 'active') {
      throw new UnauthorizedError('Your account has been deactivated. Please contact support.');
    }

    // Check lock
    if (customer.lockUntil && customer.lockUntil > new Date()) {
      const minutesLeft = Math.ceil((customer.lockUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedError(`Account is temporarily locked. Try again in ${minutesLeft} minute(s).`);
    }

    // Verify password
    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
      customer.loginAttempts = (customer.loginAttempts || 0) + 1;
      if (customer.loginAttempts >= 5) {
        customer.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        await customer.save();
        throw new UnauthorizedError('Too many failed attempts. Account locked for 15 minutes.');
      }
      await customer.save();
      throw new UnauthorizedError('Invalid credentials. Please check your phone/email and password.');
    }

    // Reset failed attempts
    customer.loginAttempts = 0;
    customer.lockUntil = undefined;

    const accessToken = this.generateAccessToken(customer._id.toString(), customer.phoneNumber!);
    const refreshToken = this.generateRefreshToken(customer._id.toString());
    customer.refreshToken = refreshToken;
    await customer.save();

    return {
      success: true,
      message: 'Logged in successfully.',
      data: {
        token: accessToken,
        refreshToken,
        user: this.sanitize(customer),
      }
    };
  }

  // Refresh access token
  async refresh(refreshToken: string) {
    let payload: any;
    try {
      payload = jwt.verify(refreshToken, CUSTOMER_JWT_SECRET);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token.');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedError('Invalid token type.');
    }

    const customer = await User.findById(payload.customerId).select('+refreshToken');
    if (!customer || customer.refreshToken !== refreshToken) {
      throw new UnauthorizedError('Refresh token mismatch. Please login again.');
    }

    const newAccessToken = this.generateAccessToken(customer._id.toString(), customer.phoneNumber!);
    const newRefreshToken = this.generateRefreshToken(customer._id.toString());
    customer.refreshToken = newRefreshToken;
    await customer.save();

    return {
      success: true,
      data: {
        token: newAccessToken,
        refreshToken: newRefreshToken,
      }
    };
  }

  // Logout
  async logout(customerId: string) {
    await User.findByIdAndUpdate(customerId, { refreshToken: null });
    return { success: true, message: 'Logged out successfully.' };
  }

  // Get profile
  async getProfile(customerId: string) {
    const customer = await User.findById(customerId).select('-password -refreshToken');
    if (!customer) throw new NotFoundError('Customer not found.');
    return { success: true, data: { customer } };
  }

  // Update profile
  async updateProfile(customerId: string, updates: any) {
    const allowed: any = {};
    if (updates.firstName) allowed.firstName = updates.firstName;
    if (updates.lastName) allowed.lastName = updates.lastName;
    if (updates.address) allowed.address = updates.address;
    if (updates.email) allowed.email = updates.email;
    if (updates.phone) allowed.phoneNumber = updates.phone;
    if (updates.bikeModel) {
      const customer = await User.findById(customerId);
      if (customer && !customer.bikeModel.includes(updates.bikeModel)) {
        customer.bikeModel.push(updates.bikeModel);
        await customer.save();
        return { success: true, customer: this.sanitize(customer) };
      }
    }
    const updated = await User.findByIdAndUpdate(customerId, allowed, { new: true }).select('-password -refreshToken');
    if (!updated) throw new NotFoundError('Customer not found.');
    return { success: true, data: { customer: this.sanitize(updated) } };
  }

  // Change password
  async changePassword(customerId: string, data: any) {
    const { currentPassword, newPassword } = data;
    const customer = await User.findById(customerId).select('+password');
    if (!customer) throw new NotFoundError('Customer not found.');

    const isMatch = await customer.comparePassword(currentPassword);
    if (!isMatch) throw new UnauthorizedError('Current password is incorrect.');

    customer.password = newPassword;
    await customer.save();

    return { success: true, message: 'Password updated successfully.' };
  }

  // Sanitize output (remove sensitive fields)
  private sanitize(customer: IUser) {
    return {
      _id: customer._id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      name: `${customer.firstName} ${customer.lastName || ''}`.trim(),
      phone: customer.phoneNumber,
      email: customer.email,
      bikeModel: customer.bikeModel,
      address: customer.address,
      totalVisits: customer.totalVisits,
      status: customer.status,
      role: customer.role,
      createdAt: (customer as any).createdAt,
    };
  }
}
