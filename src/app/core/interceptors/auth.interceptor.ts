import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {catchError, filter, switchMap, take} from 'rxjs/operators';
import {Router} from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private router: Router) {
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

    // Don't add CORS headers - let the server handle CORS
    // The browser and server will manage CORS properly

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
          switchMap((token: any) => {
            this.isRefreshing = false;
            this.refreshTokenSubject.next(token.access_token);
            // Store in the same storage where refresh token was found
            if (localStorage.getItem('refresh_token')) {
              localStorage.setItem('access_token', token.access_token);
            } else {
              sessionStorage.setItem('access_token', token.access_token);
            }
            return next.handle(this.addToken(request, token.access_token));
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
    // This should call your auth service to refresh the token
    // For now, returning a mock observable
    return new Observable(observer => {
      // Simulate API call
      setTimeout(() => {
        observer.error('Token refresh not implemented');
      }, 1000);
    });
  }

  private logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['/login']);
  }
}
