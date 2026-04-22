import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(err => {
      if (err.status === 401) {
        this.authService.logout();
        location.reload();
      }
      let errorMsg = err.statusText;
      if (err.error) {
        if (typeof err.error === 'string') {
          errorMsg = err.error;
        } else if (err.error.message) {
          errorMsg = err.error.message;
        }
      }
      if (!errorMsg) {
        errorMsg = `HTTP Error ${err.status}: ${err.message}`;
      }
      return throwError(() => new Error(errorMsg));
    }));
  }
}
