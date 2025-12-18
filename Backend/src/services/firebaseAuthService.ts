import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { USER_ROLE, USER_STATUS } from '../types/enum';

// Firebase Admin SDK (you'll need to install: npm install firebase-admin)
import * as admin from 'firebase-admin';

// Initialize Firebase Admin (you'll need to add your service account key)
let firebaseApp: admin.app.App;

try {
  // Check if Firebase is already initialized
  firebaseApp = admin.app();
} catch (error) {
  // Initialize Firebase Admin SDK
  // Properly format the private key - handle both escaped and literal newlines
  let privateKey = config.firebase.privateKey;
  
  // Replace escaped newlines with actual newlines (handles \n in .env files)
  privateKey = privateKey.replace(/\\n/g, '\n');
  
  // Also handle cases where newlines might be stored differently
  privateKey = privateKey.replace(/\\\\n/g, '\n');
  
  // Ensure the private key has proper headers
  if (!privateKey.includes('BEGIN PRIVATE KEY') && !privateKey.includes('BEGIN RSA PRIVATE KEY')) {
    throw new Error(
      'Invalid Firebase private key format: missing BEGIN/END markers. ' +
      'Ensure your FIREBASE_PRIVATE_KEY in .env includes the full key with headers, ' +
      'and use \\n for newlines within quotes.'
    );
  }
  
  // Remove any extra whitespace and ensure proper formatting
  privateKey = privateKey.trim();
  
  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: privateKey,
      }),
    });
  } catch (initError: any) {
    console.error('❌ Firebase initialization error:', initError.message);
    throw new Error(
      `Failed to initialize Firebase: ${initError.message}. ` +
      'Please check your FIREBASE_PRIVATE_KEY format in .env file. ' +
      'It should be wrapped in quotes and use \\n for newlines.'
    );
  }
}

export interface FirebaseUserData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
}

export interface FirebaseAuthResult {
  success: boolean;
  message: string;
  token?: string;
  user?: any;
  userId?: string;
}

export class FirebaseAuthService {
  private auth: admin.auth.Auth;

  constructor() {
    this.auth = firebaseApp.auth();
  }

  // Verify Firebase ID token
  async verifyFirebaseToken(idToken: string): Promise<FirebaseUserData> {
    try {
      const decodedToken = await this.auth.verifyIdToken(idToken);
      
      return {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        displayName: decodedToken.name || decodedToken.display_name,
        photoURL: decodedToken.picture || decodedToken.photo_url,
        emailVerified: decodedToken.email_verified || false,
      };
    } catch (error) {
      throw new Error('Invalid Firebase token');
    }
  }

  // Sign up with Firebase
  async signupWithFirebase(firebaseUserData: FirebaseUserData): Promise<FirebaseAuthResult> {
    try {
      // Check if user already exists
      let user = await User.findOne({ 
        $or: [
          { email: firebaseUserData.email },
          { firebaseUid: firebaseUserData.uid }
        ]
      });

      if (user) {
        // User exists, generate JWT token
        const token = this.generateJWT(user);
        
        return {
          success: true,
          message: 'Login successful',
          token,
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            profilePicture: user.profilePicture,
          },
          userId: user._id.toString(),
        };
      }

      // Create new user
      const newUser = new User({
        firstName: firebaseUserData.displayName?.split(' ')[0] || 'User',
        lastName: firebaseUserData.displayName?.split(' ').slice(1).join(' ') || '',
        email: firebaseUserData.email,
        firebaseUid: firebaseUserData.uid,
        isEmailVerified: firebaseUserData.emailVerified,
        profilePicture: firebaseUserData.photoURL,
        role: USER_ROLE.ADMIN, // Default role
        status: USER_STATUS.ACTIVE,
      });

      await newUser.save();

      // Generate JWT token
      const token = this.generateJWT(newUser);

      return {
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role,
          isEmailVerified: newUser.isEmailVerified,
          profilePicture: newUser.profilePicture,
        },
        userId: newUser._id.toString(),
      };
    } catch (error: any) {
      throw new Error(error.message || 'Firebase signup failed');
    }
  }

  // Login with Firebase
  async loginWithFirebase(firebaseUserData: FirebaseUserData): Promise<FirebaseAuthResult> {
    try {
      // Find user by Firebase UID or email
      const user = await User.findOne({
        $or: [
          { firebaseUid: firebaseUserData.uid },
          { email: firebaseUserData.email }
        ]
      });

      if (!user) {
        throw new Error('User not found. Please sign up first.');
      }

      // Update user's Firebase UID if not set
      if (!user.firebaseUid) {
        user.firebaseUid = firebaseUserData.uid;
        await user.save();
      }

      // Update email verification status if needed
      if (!user.isEmailVerified && firebaseUserData.emailVerified) {
        user.isEmailVerified = true;
        await user.save();
      }

      // Generate JWT token
      const token = this.generateJWT(user);

      return {
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          profilePicture: user.profilePicture,
        },
        userId: user._id.toString(),
      };
    } catch (error: any) {
      throw new Error(error.message || 'Firebase login failed');
    }
  }

  // Generate JWT token
  private generateJWT(user: any): string {
    return jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
  }

  // Get user by Firebase UID
  async getUserByFirebaseUid(firebaseUid: string) {
    return await User.findOne({ firebaseUid });
  }

  // Update user profile from Firebase
  async updateUserFromFirebase(firebaseUid: string, firebaseUserData: FirebaseUserData) {
    const user = await User.findOne({ firebaseUid });
    
    if (!user) {
      throw new Error('User not found');
    }

    // Update user data
    user.firstName = firebaseUserData.displayName?.split(' ')[0] || user.firstName;
    user.lastName = firebaseUserData.displayName?.split(' ').slice(1).join(' ') || user.lastName;
    user.email = firebaseUserData.email;
    user.isEmailVerified = firebaseUserData.emailVerified;
    user.profilePicture = firebaseUserData.photoURL || user.profilePicture;

    await user.save();
    return user;
  }
} 