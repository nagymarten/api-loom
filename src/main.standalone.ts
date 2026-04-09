import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config.standalone';
import { AppComponent } from './app/app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { provideHttpClient, withFetch } from '@angular/common/http';
import SkyPreset from './themes/skyPreset';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...appConfig.providers!,
    provideHttpClient(withFetch()),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: SkyPreset,
        options: {
          darkModeSelector: '.my-app-dark',
        },
      },
    }),
  ],
}).catch((err) => console.error(err));
