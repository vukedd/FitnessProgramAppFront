import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import CustomMaterialTheme from './theme.config';
import { AuthInterceptorService } from './auth/interceptor/auth-interceptor.service';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(withEventReplay()),provideAnimationsAsync(),
    providePrimeNG({
        theme: {
            preset: CustomMaterialTheme,
            options: {
                // Use class selector for dark mode instead of system preference
                darkModeSelector: '.dark-mode'
            }
        }
    }),
    provideHttpClient(withInterceptorsFromDi()),  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true }
]};