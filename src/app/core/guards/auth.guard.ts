import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true;
        }
        
        // Store attempted URL for redirecting after login
        const returnUrl = window.location.pathname;
        if (returnUrl && returnUrl !== '/login') {
          sessionStorage.setItem('returnUrl', returnUrl);
        }
        
        return this.router.createUrlTree(['/login']);
      })
    );
  }

  canActivateChild(): Observable<boolean | UrlTree> {
    return this.canActivate();
  }

  canLoad(): Observable<boolean | UrlTree> {
    return this.canActivate();
  }
}