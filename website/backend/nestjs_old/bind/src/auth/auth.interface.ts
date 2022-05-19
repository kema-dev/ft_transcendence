export interface AuthModel {
  code?: string;
  id: number;
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
  scope: string;
  createdAt: Date;
  login: string;
}

export interface AuthResponse {
  login: string;
  success: boolean;
}
