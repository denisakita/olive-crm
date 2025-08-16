export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  location: string;
  joinDate: Date;
  bio: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  permissions?: UserPermission[];
  preferences?: UserPreferences;
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
