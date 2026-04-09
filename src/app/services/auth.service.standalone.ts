import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}

  async login(): Promise<void> {
    console.info('📦 Standalone mode: Authentication disabled');
  }

  async logout(): Promise<void> {
    console.info('📦 Standalone mode: Authentication disabled');
  }

  async isLoggedIn(): Promise<boolean> {
    // Standalone mode: always return false (no auth)
    return false;
  }

  async getUserProfile(): Promise<any> {
    return null;
  }

  async getUser(): Promise<any> {
    return null;
  }

  async getUserRoles(): Promise<string[]> {
    return [];
  }
}
