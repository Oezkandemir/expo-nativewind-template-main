import { User, UserSession } from '@/types/user';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  session?: UserSession;
  error?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string; // Optional - will be derived from email prefix if not provided
}



