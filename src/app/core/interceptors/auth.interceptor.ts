import {Injectable} from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {catchError, filter, switchMap, take} from 'rxjs/operators';
import {Router} from '@angular/router';
import {environment} from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip adding token for login and register endpoints
    const isAuthEndpoint = request.url.includes('/auth/login') ||
      request.url.includes('/auth/register') ||
      request.url.includes('/auth/refresh');

    // Add auth token if available and not an auth endpoint
    if (!isAuthEndpoint) {
      const token = this.getToken();
      if (token) {
        request = this.addToken(request, token);
      }
    }

    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401 && !isAuthEndpoint) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private getToken(): string | null {
    // Check localStorage first (persistent), then sessionStorage (session-only)
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');

      if (refreshToken) {
        return this.refreshAccessToken(refreshToken).pipe(
          switchMap((response: any) => {
            this.isRefreshing = false;
            const newToken = response.access;
            this.refreshTokenSubject.next(newToken);

            // Store in the same storage where refresh token was found
            if (localStorage.getItem('refresh_token')) {
              localStorage.setItem('access_token', newToken);
              if (response.refresh) {
                localStorage.setItem('refresh_token', response.refresh);
              }
            } else {
              sessionStorage.setItem('access_token', newToken);
              if (response.refresh) {
                sessionStorage.setItem('refresh_token', response.refresh);
              }
            }

            return next.handle(this.addToken(request, newToken));
          }),
          catchError((err) => {
            this.isRefreshing = false;
            this.logout();
            return throwError(() => err);
          })
        );
      } else {
        this.logout();
        return throwError(() => 'No refresh token available');
      }
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          return next.handle(this.addToken(request, token));
        })
      );
    }
  }

  private refreshAccessToken(refreshToken: string): Observable<any> {
    const url = `${environment.apiUrl}${environment.endpoints.auth.refresh}`;
    return this.http.post(url, { refresh: refreshToken });
  }

  private logout(): void {
    // Clear all auth data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('current_user');

    // Navigate to correct auth route
    this.router.navigate(['/auth/login']);
  }
}
