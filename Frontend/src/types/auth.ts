// Authentication Types
export interface SignupData {
  firstName: string
  lastName: string
  email: string
  password: string
  phoneNumber: string
  role: UserRoles
  gender: Gender
}

export interface LoginData {
  identifier: string // email or phone
  password: string
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  password: string
  confirmPassword: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

export interface UpdateProfileData {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  gender?: Gender
  bikeModel?: string[]
}

export interface OTPVerificationData {
  email?: string
  phoneNumber?: string
  otp: string
}

export interface ResendOTPData {
  email?: string
  phoneNumber?: string
}

// API Response Types
export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    token: string
    user: UserData
    userId: string
  }
  token?: string
  user?: UserData
}

export interface UserData {
  id?: string
  _id?: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  role: UserRoles
  gender?: Gender
  status?: 'active' | 'inactive' | 'suspended'
  isEmailVerified?: boolean
  profilePicture?: string
  createdAt?: string
  updatedAt?: string
  bikeModel?: string[]
  totalVisits?: number
}

export interface GoogleAuthResponse {
  success: boolean
  message: string
  authUrl?: string
  token?: string
  user?: UserData
}

export interface OTPResponse {
  success: boolean
  message: string
  expiresIn?: number
}

export interface ProfileResponse {
  success: boolean
  message: string
  data: {
    user: UserData
  }
}

// export type UserRoles = "customer" | "mechanic" | "admin";

// export type Gender = "MALE" | "FEMALE" | "OTHER";

export enum UserRoles {
  CUSTOMER = "customer",
  MECHANIC = "mechanic",
  STAFF = "staff",
  ADMIN = "admin",
}
export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}
