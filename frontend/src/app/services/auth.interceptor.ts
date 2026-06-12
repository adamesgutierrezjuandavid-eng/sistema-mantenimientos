import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from './auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = localStorage.getItem('mantenimientos_token');

  const request = token
    ? next(req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      }))
    : next(req);

  return request.pipe(
    catchError((error) => {
      if (error.status === 401) {
        authService.cerrarSesion();
        window.location.reload();
      }
      return throwError(() => error);
    })
  );
};
