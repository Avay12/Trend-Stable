import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideZoneChangeDetection } from '@angular/core';
import { withInterceptors } from '@angular/common/http';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { provideToastr } from 'ngx-toastr';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { SessionInterceptor } from './core/interceptors/session.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([loadingInterceptor])),
    provideAnimations(),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),

    {
      provide: HTTP_INTERCEPTORS,
      useClass: SessionInterceptor,
      multi: true,
    },
  ],
};
