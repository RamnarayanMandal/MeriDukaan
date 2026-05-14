import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User';
import { SignupInput, LoginInput, OtpVerificationInput, PhoneOtpVerificationInput, ForgotPasswordInput, ResetPasswordInput, ChangePasswordInput, UpdateProfileInput } from '../validations/authValidation';
import { EmailService } from './emailService';
import { SmsService } from './smsService';
import { GoogleOAuthService } from './googleOAuthService';
import { ValidationError, UnauthorizedError, NotFoundError, ConflictError } from '../middlewares/errorHandler';
import { USER_ROLE } from '../types/enum';


export class AuthService {
  private emailService: EmailService;
  private smsService: SmsService;
  private googleOAuthService: GoogleOAuthService;

  constructor() {
    this.emailService = new EmailService();
    this.smsService = new SmsService();
    this.googleOAuthService = new GoogleOAuthService();
  }

  // Generate JWT token
  private generateToken(userId: string, email: string, role: string): string {
    return jwt.sign(
      { userId, email, role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
  }

  // Generate OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Hash password
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Compare password
  private async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Signup
  async signup(userData: SignupInput) {
    try {
      const isCustomer = !userData.role || userData.role === USER_ROLE.CUSTOMER;

      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      // Check if phone number already exists (only if provided)
      if (userData.phoneNumber) {
        const existingPhone = await User.findOne({ phoneNumber: userData.phoneNumber });
        if (existingPhone) {
          throw new ConflictError('User with this phone number already exists');
        }
      }

      // Hash password (Removed manual hashing to let User model pre-save hook handle it)
      // const hashedPassword = await this.hashPassword(userData.password);

      // Create user — OTP verification is skipped as per request
      const user = new User({
        ...userData,
        // password: hashedPassword,
        role: userData.role || USER_ROLE.CUSTOMER,
        isEmailVerified: true, // Auto-verify all users
        isPhoneVerified: true, // Auto-verify all users
      });

      await user.save();

      // Return success without OTP
      const token = this.generateToken(user._id.toString(), user.email, user.role);

      return {
        success: true,
        message: 'Account created successfully. You can now login.',
        data: {
          token,
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            bikeModel: (user as any).bikeModel,
            address: user.address,
          },
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Login — accepts email OR phone number
  async login(loginData: LoginInput) {
    try {
      const identifier = loginData.identifier.trim();
      const isPhone = /^[6-9]\d{9}$/.test(identifier);

      console.log('Login Attempt - Identifier:', identifier, 'isPhone:', isPhone);

      // Find user by email or phone
      const user = await User.findOne(
        isPhone ? { phoneNumber: identifier } : { email: identifier.toLowerCase() }
      );

      if (!user) {
        console.log('Login Failed - User not found in database');
        throw new UnauthorizedError('Invalid credentials. Please check your email/phone and password.');
      }

      console.log('User Found:', {
        email: user.email,
        phoneNumber: user.phoneNumber,
        hasPassword: !!user.password,
        role: user.role
      });

      // Check if account is locked
      if (user.lockUntil && user.lockUntil > new Date()) {
        console.log('Login Failed - Account Locked until:', user.lockUntil);
        throw new UnauthorizedError('Account is temporarily locked. Please try again later.');
      }

      // Check if user has password
      if (!user.password) {
        throw new UnauthorizedError('Please login with Google or reset your password');
      }

      // Verify password
      const isPasswordValid = await this.comparePassword(loginData.password, user.password);
      console.log('Password Comparison Result:', isPasswordValid);

      if (!isPasswordValid) {
        user.loginAttempts += 1;
        if (user.loginAttempts >= 5) {
          user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        }
        await user.save();
        throw new UnauthorizedError('Invalid credentials. Please check your email/phone and password.');
      }

      // Reset login attempts on successful login
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();

      // Admin users must verify email before logging in
      if (user.role === USER_ROLE.ADMIN && !user.isEmailVerified) {
        await this.resendEmailOTP(user.email);
        throw new UnauthorizedError('Email verification required. A new verification code has been sent to your email.');
      }

      // Generate token
      const token = this.generateToken(user._id.toString(), user.email, user.role);

      return {
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            isPhoneVerified: user.isPhoneVerified,
            bikeModel: (user as any).bikeModel,
            address: user.address,
            totalVisits: (user as any).totalVisits,
            status: user.status,
          },
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Email OTP verification
  async verifyEmailOTP(verificationData: OtpVerificationInput) {
    try {
      console.log('Verifying email OTP for:', verificationData.email);

      const user = await User.findOne({ email: verificationData.email });
      if (!user) {
        throw new NotFoundError('User not found');
      }

      console.log('User found:', user.email);
      console.log('Email verified status:', user.isEmailVerified);
      console.log('Stored OTP:', user.emailVerificationToken);
      console.log('OTP expires:', user.emailVerificationExpires);
      console.log('Provided OTP:', verificationData.otp);

      if (user.isEmailVerified) {
        throw new ValidationError('Email is already verified');
      }

      if (!user.emailVerificationToken || !user.emailVerificationExpires) {
        throw new ValidationError('No verification token found. Please request a new one.');
      }

      if (user.emailVerificationExpires < new Date()) {
        throw new ValidationError('Verification token has expired. Please request a new one.');
      }

      if (user.emailVerificationToken !== verificationData.otp) {
        console.log('OTP mismatch - Expected:', user.emailVerificationToken, 'Got:', verificationData.otp);
        throw new ValidationError('Invalid verification code');
      }

      // Mark email as verified
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      return {
        success: true,
        message: 'Email verified successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  // Phone OTP verification
  async verifyPhoneOTP(verificationData: PhoneOtpVerificationInput) {
    try {
      const user = await User.findOne({ phoneNumber: verificationData.phoneNumber });
      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (user.isPhoneVerified) {
        throw new ValidationError('Phone number is already verified');
      }

      if (!user.phoneVerificationOTP || !user.phoneVerificationExpires) {
        throw new ValidationError('No verification OTP found. Please request a new one.');
      }

      if (user.phoneVerificationExpires < new Date()) {
        throw new ValidationError('Verification OTP has expired. Please request a new one.');
      }

      if (user.phoneVerificationOTP !== verificationData.otp) {
        throw new ValidationError('Invalid verification code');
      }

      // Mark phone as verified
      user.isPhoneVerified = true;
      user.phoneVerificationOTP = undefined;
      user.phoneVerificationExpires = undefined;
      await user.save();

      return {
        success: true,
        message: 'Phone number verified successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  // Resend email verification OTP
  async resendEmailOTP(email: string) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (user.isEmailVerified) {
        throw new ValidationError('Email is already verified');
      }

      // Generate new OTP
      const emailOTP = this.generateOTP();
      user.emailVerificationToken = emailOTP;
      user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save();

      // Send email verification
      await this.emailService.sendVerificationEmail(email, emailOTP);

      return {
        success: true,
        message: 'Email verification OTP sent successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  // Resend phone verification OTP
  async resendPhoneOTP(phoneNumber: string) {
    try {
      const user = await User.findOne({ phoneNumber });
      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (user.isPhoneVerified) {
        throw new ValidationError('Phone number is already verified');
      }

      // Generate new OTP
      const phoneOTP = this.generateOTP();
      user.phoneVerificationOTP = phoneOTP;
      user.phoneVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save();

      // Send SMS verification
      await this.smsService.sendVerificationSMS(phoneNumber, phoneOTP);

      return {
        success: true,
        message: 'Phone verification OTP sent successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  // Forgot password
  async forgotPassword(forgotPasswordData: ForgotPasswordInput) {
    try {
      const user = await User.findOne({ email: forgotPasswordData.email });
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      // Send reset email
      await this.emailService.sendPasswordResetEmail(user.email, resetToken);

      return {
        success: true,
        message: 'Password reset email sent successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  // Validate reset token
  async validateResetToken(token: string): Promise<boolean> {
    try {
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      });

      return !!user;
    } catch (error) {
      return false;
    }
  }

  // Reset password
  async resetPassword(resetPasswordData: ResetPasswordInput) {
    try {
      const user = await User.findOne({
        resetPasswordToken: resetPasswordData.token,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!user) {
        throw new ValidationError('Invalid or expired reset token');
      }

      // Update password and clear reset token (Removed manual hashing, model handles it)
      user.password = resetPasswordData.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();

      return {
        success: true,
        message: 'Password reset successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  // Change password
  async changePassword(userId: string, changePasswordData: ChangePasswordInput) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (!user.password) {
        throw new ValidationError('Cannot change password for Google OAuth users');
      }

      // Verify current password
      const isCurrentPasswordValid = await this.comparePassword(
        changePasswordData.currentPassword,
        user.password
      );

      if (!isCurrentPasswordValid) {
        throw new UnauthorizedError('Current password is incorrect');
      }

      // Update password (Removed manual hashing, model handles it)
      user.password = changePasswordData.newPassword;
      await user.save();

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  // Update profile
  async updateProfile(userId: string, updateData: UpdateProfileInput) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Check if phone number is being changed and if it's already taken
      if (updateData.phoneNumber && updateData.phoneNumber !== user.phoneNumber) {
        const existingPhone = await User.findOne({ phoneNumber: updateData.phoneNumber });
        if (existingPhone) {
          throw new ConflictError('Phone number is already in use');
        }
        // Reset phone verification if phone number changes
        user.isPhoneVerified = false;
        user.phoneVerificationOTP = undefined;
        user.phoneVerificationExpires = undefined;
      }

      // Update user data
      Object.assign(user, updateData);
      await user.save();

      return {
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            isPhoneVerified: user.isPhoneVerified,
            bikeModel: (user as any).bikeModel,
            address: user.address,
            totalVisits: (user as any).totalVisits,
            status: user.status,
          },
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Google OAuth login
  async googleLogin(authorizationCode: string) {
    try {
      // Exchange code for tokens and get user info
      const googleUser = await this.googleOAuthService.getUserInfo(authorizationCode);

      // Check if user exists
      let user = await User.findOne({ googleId: googleUser.id });

      if (!user) {
        // Check if user exists with same email
        user = await User.findOne({ email: googleUser.email });

        if (user) {
          // Link Google account to existing user
          user.googleId = googleUser.id;
          user.isEmailVerified = true; // Google emails are pre-verified
          await user.save();
        } else {
          // Create new user
          user = new User({
            firstName: googleUser.given_name,
            lastName: googleUser.family_name,
            email: googleUser.email,
            googleId: googleUser.id,
            isEmailVerified: true,
            isPhoneVerified: false,
            role: USER_ROLE.CUSTOMER,
            status: 'active',
            gender: 'other',
            phoneNumber: '', // Will need to be updated later
          });
          await user.save();
        }
      }

      // Generate token
      const token = this.generateToken(user._id.toString(), user.email, user.role);

      return {
        success: true,
        message: 'Google login successful',
        data: {
          token,
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            isPhoneVerified: user.isPhoneVerified,
            bikeModel: (user as any).bikeModel,
            address: user.address,
            totalVisits: (user as any).totalVisits,
            status: user.status,
          },
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Get user profile
  async getUserProfile(userId: string) {
    try {
      const user = await User.findById(userId).select('-password -emailVerificationToken -emailVerificationExpires -phoneVerificationOTP -phoneVerificationExpires -resetPasswordToken -resetPasswordExpires');

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return {
        success: true,
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            isPhoneVerified: user.isPhoneVerified,
            bikeModel: (user as any).bikeModel,
            address: user.address,
            totalVisits: (user as any).totalVisits,
            status: user.status,
            createdAt: (user as any).createdAt,
          },
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Get user by email (for verification status check)
  async getUserByEmail(email: string) {
    try {
      const user = await User.findOne({ email }).select('-password -emailVerificationToken -emailVerificationExpires -phoneVerificationOTP -phoneVerificationExpires -resetPasswordToken -resetPasswordExpires');

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  // Get all customers (Admin only)
  async getAllCustomers() {
    try {
      const customers = await User.find({ role: USER_ROLE.CUSTOMER })
        .select('firstName lastName email phoneNumber profilePicture bikeModel createdAt')
        .sort({ firstName: 1 });
      
      return {
        success: true,
        data: customers,
      };
    } catch (error) {
      throw error;
    }
  }

  // Logout (client-side token removal)
  async logout(userId: string) {
    try {
      // In a more advanced implementation, you might want to blacklist the token
      // For now, we'll just return success as token invalidation is handled client-side
      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      throw error;
    }
  }
} 