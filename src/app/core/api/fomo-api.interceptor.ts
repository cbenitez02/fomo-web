import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { mapHttpError } from './fomo-api.error';
import { getRuntimeConfig } from './runtime-config';

function isPublicApiRequest(url: string): boolean {
  const base = getRuntimeConfig().apiBaseUrl.replace(/\/$/, '');
  return url.startsWith(base) || url.includes('/api/public/');
}

export const fomoApiInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && isPublicApiRequest(req.url)) {
        return throwError(() => mapHttpError(error));
      }
      return throwError(() => error);
    }),
  );
};
