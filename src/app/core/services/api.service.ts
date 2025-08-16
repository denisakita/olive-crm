import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, retry, timeout} from 'rxjs/operators';
import {environment} from '../../../environments/environment';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any;
  count?: number;
  next?: string;
  previous?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface QueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;

  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;
  private apiVersion = environment.apiVersion;

  constructor(private http: HttpClient) {
  }

  /**
   * Constructs the full API URL
   */
  private getUrl(endpoint: string): string {
    // Remove leading slash if present
    endpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    return `${this.baseUrl}/${this.apiVersion}/${endpoint}`;
  }

  /**
   * Get default headers
   */
  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    // Add auth token if available
    const token = localStorage.getItem('access_token');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Build HTTP params from object
   */
  private buildParams(params?: QueryParams): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(item => {
              httpParams = httpParams.append(key, item.toString());
            });
          } else {
            httpParams = httpParams.set(key, value.toString());
          }
        }
      });
    }

    return httpParams;
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = 'Unable to connect to server. Please check your connection.';
      } else if (error.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
        // Redirect to login or refresh token
        this.handleAuthError();
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (error.status === 404) {
        errorMessage = 'The requested resource was not found.';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = error.error?.message || error.message || errorMessage;
      }
    }

    console.error('API Error:', errorMessage, error);
    return throwError(() => ({message: errorMessage, status: error.status, error: error.error}));
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(): void {
    // Clear token and redirect to login
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // You can inject Router and navigate to login
    window.location.href = '/login';
  }

  /**
   * GET request
   */
  get<T>(endpoint: string, params?: QueryParams): Observable<T> {
    const url = this.getUrl(endpoint);
    const options = {
      headers: this.getHeaders(),
      params: this.buildParams(params)
    };

    return this.http.get<T>(url, options).pipe(
      timeout(environment.timeout),
      retry(environment.retry),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * GET request with pagination
   */
  getPaginated<T>(endpoint: string, params?: QueryParams): Observable<PaginatedResponse<T>> {
    return this.get<PaginatedResponse<T>>(endpoint, params);
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, data: any, params?: QueryParams): Observable<T> {
    const url = this.getUrl(endpoint);
    const options = {
      headers: this.getHeaders(),
      params: this.buildParams(params)
    };

    return this.http.post<T>(url, data, options).pipe(
      timeout(environment.timeout),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, data: any, params?: QueryParams): Observable<T> {
    const url = this.getUrl(endpoint);
    const options = {
      headers: this.getHeaders(),
      params: this.buildParams(params)
    };

    return this.http.put<T>(url, data, options).pipe(
      timeout(environment.timeout),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, data: any, params?: QueryParams): Observable<T> {
    const url = this.getUrl(endpoint);
    const options = {
      headers: this.getHeaders(),
      params: this.buildParams(params)
    };

    return this.http.patch<T>(url, data, options).pipe(
      timeout(environment.timeout),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, params?: QueryParams): Observable<T> {
    const url = this.getUrl(endpoint);
    const options = {
      headers: this.getHeaders(),
      params: this.buildParams(params)
    };

    return this.http.delete<T>(url, options).pipe(
      timeout(environment.timeout),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Upload file
   */
  upload<T>(endpoint: string, formData: FormData): Observable<T> {
    const url = this.getUrl(endpoint);
    let headers = new HttpHeaders();

    // Add auth token but don't set Content-Type (let browser set it for multipart)
    const token = localStorage.getItem('access_token');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post<T>(url, formData, {headers}).pipe(
      timeout(environment.timeout * 2), // Double timeout for uploads
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Download file
   */
  download(endpoint: string, params?: QueryParams): Observable<Blob> {
    const url = this.getUrl(endpoint);
    const options = {
      headers: this.getHeaders(),
      params: this.buildParams(params),
      responseType: 'blob' as 'json'
    };

    return this.http.get<Blob>(url, options).pipe(
      timeout(environment.timeout * 2), // Double timeout for downloads
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Replace URL parameters (e.g., :id)
   */
  replaceParams(endpoint: string, params: { [key: string]: any }): string {
    let url = endpoint;
    Object.keys(params).forEach(key => {
      url = url.replace(`:${key}`, params[key]);
    });
    return url;
  }
}
