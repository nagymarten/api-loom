import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanActivate {
  private keycloakService = inject(KeycloakService);

  constructor(private router: Router) {}

  async canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    const isLoggedIn = await this.keycloakService.isLoggedIn();
    return isLoggedIn ? true : this.router.createUrlTree(['/login']);
  }
}
