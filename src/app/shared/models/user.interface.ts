export interface User {
  id?: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone_number?: string;
  phone?: string; // alias for phone_number
  role?: string;
  department?: string;
  location?: string;
  bio?: string;
  avatar_url?: string;
  date_of_birth?: Date | string;
  preferences?: any;
  permissions?: any;
  createdAt?: Date | string;
  dateJoined?: Date | string; // alias for createdAt
  lastLogin?: Date | string;
  isActive?: boolean;
  isStaff?: boolean;
  isSuperuser?: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  acceptTerms?: boolean;
}

export interface TokenResponse {
  access: string;
  refresh: string;
  user?: User;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface PasswordChange {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}