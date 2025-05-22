import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private keycloakService: KeycloakService) {}

  async login(): Promise<void> {
    await this.keycloakService.login();
  }

  async logout(): Promise<void> {
    try {
      await this.keycloakService.logout();
      window.location.href = '/'; 
    } catch (error) {
      console.error('Logout Error:', error);
    }
  }

  async isLoggedIn(): Promise<boolean> {
    return this.keycloakService.isLoggedIn();
  }

  async getUserProfile(): Promise<any> {
    if (await this.isLoggedIn()) {
      return this.keycloakService.loadUserProfile();
    }
    return null;
  }

  async getUser(): Promise<any> {
    if (await this.isLoggedIn()) {
      const userProfile = await this.keycloakService.loadUserProfile();
      return userProfile;
    }
    return null;
  }

  async getUserRoles(): Promise<string[]> {
    return this.keycloakService.getUserRoles();
  }
}
