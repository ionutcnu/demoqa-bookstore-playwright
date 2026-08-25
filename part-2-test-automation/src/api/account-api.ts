import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { Credentials } from '../models/user';

export class AccountApi {
  constructor(private readonly request: APIRequestContext) {}

  createUser(credentials: Credentials): Promise<APIResponse> {
    return this.request.post('/Account/v1/User', {
      data: credentials,
    });
  }

  generateToken(credentials: Credentials): Promise<APIResponse> {
    return this.request.post('/Account/v1/GenerateToken', {
      data: credentials,
    });
  }

  getUser(userId: string, token: string): Promise<APIResponse> {
    return this.request.get(`/Account/v1/User/${userId}`, {
      headers: this.authorizationHeader(token),
    });
  }

  deleteUser(userId: string, token: string): Promise<APIResponse> {
    return this.request.delete(`/Account/v1/User/${userId}`, {
      headers: this.authorizationHeader(token),
    });
  }

  private authorizationHeader(token: string): Record<string, string> {
    return {
      Authorization: `Bearer ${token}`,
    };
  }
}
