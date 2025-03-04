import { CredentialResponse } from '@react-oauth/google';

export interface userInfo {
  email: string;
  name: string;
  familyName: string;
  isVerified: boolean;
  picture: string;
}

export interface AuthType {
  userInfo: userInfo | null;
  isLogin: boolean;
  isLoading: boolean;
  handleLoginSuccess: (user: CredentialResponse) => void;
  handleLoginFailure: () => void;
  handleLogout: () => void;
}

export interface GoogleAuthUser {
  aud: string;
  azp: string;
  email: string;
  email_verified: boolean;
  exp: number;
  family_name: string;
  given_name: string;
  iat: number;
  iss: string;
  jti: string;
  name: string;
  nbf: number;
  picture: string;
  sub: string;
}
