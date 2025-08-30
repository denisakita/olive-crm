import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {
  AuthState,
  ChangePasswordRequest,
  JwtPayload,
  LoginRequest,
  LoginResponse,
  PasswordResetConfirm,
  PasswordResetRequest,
  RegisterRequest,
  RegisterResponse,
  TokenRefreshResponse,
  User
} from '../shared/models/auth.interface';
import { Profile } from '../shared/models/profile.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    refreshToken: null,
    loading: false,
    error: null
  });

  public authState$ = this.authStateSubject.asObservable();
  public isAuthenticated$ = this.authState$.pipe(map(state => state.isAuthenticated));
  public currentUser$ = this.authState$.pipe(map(state => state.user));
  public loading$ = this.authState$.pipe(map(state => state.loading));

  private refreshTokenTimeout: any;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredAuth();
  }

  /**
   * Load authentication data from localStorage or sessionStorage
   */
  private loadStoredAuth(): void {
    // Check localStorage first (persistent), then sessionStorage (session-only)
    let token = localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
    let refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY) || sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
    let userJson = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        const tokenPayload = this.decodeToken(token);

        if (tokenPayload && !this.isTokenExpired(tokenPayload)) {
          this.updateAuthState({
            isAuthenticated: true,
            user,
            token,
            refreshToken,
            loading: false,
            error: null
          });

          this.scheduleTokenRefresh(tokenPayload);
        } else if (refreshToken) {
          // Token expired, try to refresh
          this.refreshToken().subscribe();
        } else {
          // No valid auth, clear storage
          this.clearAuth();
        }
      } catch (error) {
        console.error('Error loading stored auth:', error);
        this.clearAuth();
      }
    }
  }

  /**
   * Login user
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.updateAuthState({...this.authStateSubject.value, loading: true, error: null});

    const url = `${environment.apiUrl}${environment.endpoints.auth.login}`;

    return this.http.post<LoginResponse>(url, credentials).pipe(
      tap(response => {
        this.handleLoginResponse(response, credentials.rememberMe);
      }),
      catchError(error => {
        this.updateAuthState({
          ...this.authStateSubject.value,
          loading: false,
          error: error.error?.message || 'Login failed'
        });
        return throwError(() => error);
      })
    );
  }

  /**
   * Register new user
   */
  register(data: RegisterRequest): Observable<RegisterResponse> {
    this.updateAuthState({...this.authStateSubject.value, loading: true, error: null});

    const url = `${environment.apiUrl}${environment.endpoints.auth.register}`;

    return this.http.post<RegisterResponse>(url, data).pipe(
      tap(() => {
        this.updateAuthState({...this.authStateSubject.value, loading: false});
      }),
      catchError(error => {
        this.updateAuthState({
          ...this.authStateSubject.value,
          loading: false,
          error: error.error?.message || 'Registration failed'
        });
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout user
   */
  logout(): Observable<any> {
    const url = `${environment.apiUrl}${environment.endpoints.auth.logout}`;
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);

    // Notify server first (while we still have the auth token)
    if (refreshToken) {
      return this.http.post(url, {refresh: refreshToken}).pipe(
        tap(() => {
          // Clear local auth after successful logout
          this.clearAuth();
        }),
        catchError((error) => {
          // Clear auth even if server logout fails
          this.clearAuth();
          // Return success since local logout is complete
          return of(null);
        })
      );
    }

    // If no refresh token, just clear local auth
    this.clearAuth();
    return of(null);
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<TokenRefreshResponse> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      this.clearAuth();
      return throwError(() => new Error('No refresh token available'));
    }

    const url = `${environment.apiUrl}${environment.endpoints.auth.refresh}`;

    return this.http.post<TokenRefreshResponse>(url, {refresh: refreshToken}).pipe(
      tap(response => {
        this.handleTokenRefreshResponse(response);
      }),
      catchError(error => {
        this.clearAuth();
        return throwError(() => error);
      })
    );
  }

  /**
   * Get current user profile
   */
  getProfile(): Observable<User> {
    const url = `${environment.apiUrl}${environment.endpoints.auth.profile}`;

    return this.http.get<User>(url).pipe(
      tap(user => {
        this.updateAuthState({
          ...this.authStateSubject.value,
          user
        });
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      })
    );
  }

  /**
   * Update user profile
   */
  updateProfile(data: Partial<User>): Observable<User> {
    const url = `${environment.apiUrl}${environment.endpoints.auth.profile}`;

    return this.http.patch<User>(url, data).pipe(
      tap(user => {
        this.updateAuthState({
          ...this.authStateSubject.value,
          user
        });
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      })
    );
  }

  /**
   * Request password reset
   */
  requestPasswordReset(data: PasswordResetRequest): Observable<any> {
    const url = `${environment.apiUrl}/auth/password-reset/`;
    return this.http.post(url, data);
  }

  /**
   * Confirm password reset
   */
  confirmPasswordReset(data: PasswordResetConfirm): Observable<any> {
    const url = `${environment.apiUrl}/auth/password-reset-confirm/`;
    return this.http.post(url, data);
  }

  /**
   * Change password
   */
  changePassword(data: ChangePasswordRequest): Observable<any> {
    const url = `${environment.apiUrl}/auth/change-password/`;
    return this.http.post(url, data);
  }

  /**
   * Handle login response
   */
  private handleLoginResponse(response: LoginResponse, rememberMe?: boolean): void {
    // If rememberMe is true, use localStorage (persistent)
    // If rememberMe is false, use sessionStorage (closes with browser)
    if (rememberMe) {
      // Persistent storage - survives browser close
      localStorage.setItem(this.TOKEN_KEY, response.access);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refresh);
      localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    } else {
      // Session storage - cleared when browser closes
      sessionStorage.setItem(this.TOKEN_KEY, response.access);
      sessionStorage.setItem(this.REFRESH_TOKEN_KEY, response.refresh);
      sessionStorage.setItem(this.USER_KEY, JSON.stringify(response.user));

      // Clear any existing localStorage to ensure session-only
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }

    this.updateAuthState({
      isAuthenticated: true,
      user: response.user,
      token: response.access,
      refreshToken: response.refresh,
      loading: false,
      error: null
    });

    const tokenPayload = this.decodeToken(response.access);
    if (tokenPayload) {
      this.scheduleTokenRefresh(tokenPayload);
    }
  }

  /**
   * Handle token refresh response
   */
  private handleTokenRefreshResponse(response: TokenRefreshResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.access);

    if (response.refresh) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refresh);
    }

    this.updateAuthState({
      ...this.authStateSubject.value,
      token: response.access,
      refreshToken: response.refresh || this.authStateSubject.value.refreshToken
    });

    const tokenPayload = this.decodeToken(response.access);
    if (tokenPayload) {
      this.scheduleTokenRefresh(tokenPayload);
    }
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleTokenRefresh(payload: JwtPayload): void {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }

    const expiresAt = payload.exp * 1000;
    const now = Date.now();
    const delay = expiresAt - now - (60 * 1000); // Refresh 1 minute before expiry

    if (delay > 0) {
      this.refreshTokenTimeout = setTimeout(() => {
        this.refreshToken().subscribe({
          error: (error) => {
            console.error('Token refresh failed:', error);
            this.clearAuth();
            this.router.navigate(['/auth/login']);
          }
        });
      }, delay);
    }
  }

  /**
   * Decode JWT token
   */
  private decodeToken(token: string): JwtPayload | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  private isTokenExpired(payload: JwtPayload): boolean {
    const now = Date.now() / 1000;
    return payload.exp < now;
  }

  /**
   * Update authentication state
   */
  private updateAuthState(state: AuthState): void {
    this.authStateSubject.next(state);
  }

  /**
   * Clear authentication data from both storages
   */
  private clearAuth(): void {
    // Clear from both localStorage and sessionStorage
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);

    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }

    this.updateAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
      loading: false,
      error: null
    });
  }

  /**
   * Get current token from state or storage
   */
  getToken(): string | null {
    // First check the current state
    const stateToken = this.authStateSubject.value.token;
    if (stateToken) {
      return stateToken;
    }

    // Otherwise check storages (localStorage first for persistent, then sessionStorage)
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.authStateSubject.value.user;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    return user && user.permissions ? user.permissions.includes(permission) : false;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }
}
