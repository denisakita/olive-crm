export interface User {
  id?: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone_number?: string;
  phone?: string;
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


