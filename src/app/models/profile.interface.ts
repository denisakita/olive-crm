export interface Profile {
  id?: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
  department?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  preferences?: any;
  permissions?: any;
  createdAt?: Date | string;
  dateJoined?: Date | string;
  lastLogin?: Date | string;
  isActive?: boolean;
}

export interface UserPermission {
  module: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
}


export interface Activity {
  id: string;
  userId: string;
  action: string;
  description: string;
  module: string;
  timestamp: Date;
  metadata?: any;
  icon?: string;
  type: 'success' | 'info' | 'warning' | 'error';
}
