// Database types for type safety throughout the application

export type UserRole = 'basic' | 'admin';

export type Priority = 'low' | 'medium' | 'high';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}

export interface FormSubmission {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  message?: string;
  category?: string;
  priority?: Priority;
  created_at: string;
  updated_at: string;
}

// Form input types (what the user submits)
export interface FormSubmissionInput {
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  message?: string;
  category?: string;
  priority?: Priority;
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

// User management types
export interface CreateUserInput {
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateProfileInput {
  role?: UserRole;
  is_banned?: boolean;
}
