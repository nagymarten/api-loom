import { Component, OnInit } from '@angular/core';
import { inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  private keycloakService = inject(KeycloakService);

  constructor(private router: Router) {}

  async ngOnInit() {
    const isLoggedIn = await this.keycloakService.isLoggedIn();
    if (isLoggedIn) {
      this.router.navigate(['/']); // Redirect to main page if already logged in
    }
  }

  async login() {
    await this.keycloakService.login();
    this.router.navigate(['/']); // Redirect to main page after successful login
  }
}
