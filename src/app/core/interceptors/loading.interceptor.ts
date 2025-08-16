import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private totalRequests = 0;

  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.totalRequests++;
    this.setLoadingStatus(true);

    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          this.decreaseRequests();
        }
      }),
      finalize(() => {
        this.decreaseRequests();
      })
    );
  }

  private decreaseRequests(): void {
    this.totalRequests--;
    if (this.totalRequests === 0) {
      this.setLoadingStatus(false);
    }
  }

  private setLoadingStatus(status: boolean): void {
    // You can inject a loading service here to manage global loading state
    // For now, we'll just dispatch a custom event
    const event = new CustomEvent('loading-status', { detail: status });
    window.dispatchEvent(event);
  }
}