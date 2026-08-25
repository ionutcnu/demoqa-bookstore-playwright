import type { Book } from './book';

export interface Credentials {
  userName: string;
  password: string;
}

export interface UserResponse {
  userID: string;
  username: string;
  books: Book[];
}

export interface TokenResponse {
  token: string | null;
  expires: string | null;
  status: string;
  result: string;
}

export interface DisposableUser {
  credentials: Credentials;
  userId: string;
  token: string;
}
