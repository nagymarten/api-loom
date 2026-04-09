import { ApplicationConfig } from "@angular/core";
import { provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";
import {
  provideHttpClient,
  withInterceptorsFromDi,
  withFetch,
} from "@angular/common/http";
import { routes } from "./app.routes";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { HttpClient } from "@angular/common/http";
import { KeycloakService } from "keycloak-angular";
import Keycloak from "keycloak-js";
import { providePrimeNG } from "primeng/config";
import SkyPreset from "../themes/skyPreset";

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

const mockKeycloak = {
  token: "standalone-token",
  tokenParsed: { sub: "standalone-user", preferred_username: "User" },
  authenticated: true,
  init: () => Promise.resolve(true),
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  isLoggedIn: () => true,
  loadUserProfile: () =>
    Promise.resolve({
      username: "User",
      email: "user@localhost",
      firstName: "Open",
      lastName: "Source",
    }),
  getUserRoles: () => [],
  hasRealmRole: () => false,
  hasResourceRole: () => false,
} as unknown as Keycloak;

const mockKeycloakService = {
  isLoggedIn: () => Promise.resolve(true),
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  getToken: () => Promise.resolve("standalone-token"),
  isTokenExpired: () => false,
  updateToken: () => Promise.resolve(true),
  getKeycloakInstance: () => mockKeycloak,
} as unknown as KeycloakService;

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    providePrimeNG({
      theme: {
        preset: SkyPreset,
        options: { darkModeSelector: ".my-app-dark" },
      },
    }),
    { provide: Keycloak, useValue: mockKeycloak },
    { provide: KeycloakService, useValue: mockKeycloakService },
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }).providers!,
  ],
};
