import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import Keycloak from 'keycloak-js';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}

// Mock Keycloak instance for standalone mode
const mockKeycloak = {
  token: null,
  tokenParsed: { sub: 'standalone-user', username: 'Standalone User' },
  authenticated: false,
  init: () => Promise.resolve(false),
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  isLoggedIn: () => false,
  loadUserProfile: () => Promise.resolve({
    username: 'Standalone User',
    email: 'standalone@localhost',
    firstName: 'Standalone',
    lastName: 'User',
  }),
  getUserRoles: () => [],
  hasRealmRole: () => false,
  hasResourceRole: () => false,
} as unknown as Keycloak;

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: Keycloak, useValue: mockKeycloak },
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }).providers!,
  ],
};
