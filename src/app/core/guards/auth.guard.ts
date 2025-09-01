import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {map, take} from 'rxjs/operators';
import {AuthService} from '../../auth/auth.service';
import {UserRole} from '../../shared/models/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (!isAuthenticated) {
          // Store attempted URL for redirecting after login
          if (state.url && state.url !== '/login') {
            sessionStorage.setItem('returnUrl', state.url);
          }
          return this.router.createUrlTree(['/auth/login']);
        }

        // Check role-based access if roles are specified
        const requiredRoles = route.data['roles'] as UserRole[];
        if (requiredRoles && requiredRoles.length > 0) {
          const currentUser = this.authService.getCurrentUser();
          if (currentUser && requiredRoles.includes(currentUser.role as UserRole)) {
            return true;
          }
          // User doesn't have required role - redirect to dashboard
          return this.router.createUrlTree(['/dashboard']);
        }

        return true;
      })
    );
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.canActivate(route, state);
  }

  canLoad(): Observable<boolean | UrlTree> {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true;
        }
        return this.router.createUrlTree(['/auth/login']);
      })
    );
  }
}
