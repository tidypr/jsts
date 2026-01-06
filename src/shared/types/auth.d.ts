export interface SigninFormData {
  email: string;
  password: string;
  keepLoggedIn?: boolean;
}

export interface SignupFormData {
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

export type SocialProvider = 'google' | 'apple' | 'github';
