import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';
import { BusyService } from '../services/busy.service';
import { inject } from '@angular/core';
// import { environment } from '../../../environments/environment';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const busyService = inject(BusyService);
  busyService.busy();

  return next(req).pipe(
    finalize(() => busyService.idle())
  );
};
