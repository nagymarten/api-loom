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
import {
  provideKeycloak,
  AutoRefreshTokenService,
  UserActivityService,
  withAutoRefreshToken,
  KeycloakService,
} from 'keycloak-angular';
import {
  ApiLoomApiModule,
  ApiLoomConfiguration,
} from '@ingenimind/apiloom-api-client';
import Keycloak from 'keycloak-js';
import { inject, Injectable } from '@angular/core';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function apiConfigFactory(): ApiLoomConfiguration {
  const keycloak = inject(Keycloak);

  return new ApiLoomConfiguration({
    basePath: '', 
    accessToken: () => {
      const token = keycloak.token;
      // console.log('Access token:', token);
      return token ? token : '';
    },
  });
}


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    provideKeycloak({
      config: {
        url: 'http://localhost:38082',
        realm: 'apiloom',
        clientId: 'apiloom-fe',
      },
      initOptions: {
        onLoad: 'login-required',
        checkLoginIframe: false,
      },
      features: [
        withAutoRefreshToken({
          sessionTimeout: 900000,
        }),
      ],
    }),
    AutoRefreshTokenService,
    UserActivityService,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }).providers!,
    importProvidersFrom(
      ApiLoomApiModule.forRoot(apiConfigFactory)
    ),
  ],
};
