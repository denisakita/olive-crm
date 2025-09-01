import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {ApiService, PaginatedResponse, QueryParams} from './api.service';
import {Barrel, BarrelStatistics} from '../models/barrel.interface';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BarrelsService {
  private barrelsSubject = new BehaviorSubject<Barrel[]>([]);
  public barrels$ = this.barrelsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private api: ApiService) {
  }

  /**
   * Get all barrels with optional filters
   */
  getBarrels(params?: QueryParams): Observable<PaginatedResponse<Barrel>> {
    this.loadingSubject.next(true);
    const endpoint = environment.endpoints.barrels.list;

    return this.api.getPaginated<Barrel>(endpoint, params).pipe(
      tap(response => {
        this.barrelsSubject.next(response.results);
        this.loadingSubject.next(false);
      })
    );
  }

  /**
   * Get a single barrel by ID
   */
  getBarrel(id: string | number): Observable<Barrel> {
    const endpoint = this.api.replaceParams(environment.endpoints.barrels.detail, {id});
    return this.api.get<Barrel>(endpoint);
  }

  /**
   * Create a new barrel
   */
  createBarrel(barrel: Partial<Barrel>): Observable<Barrel> {
    const endpoint = environment.endpoints.barrels.create;

    return this.api.post<Barrel>(endpoint, barrel).pipe(
      tap(newBarrel => {
        const currentBarrels = this.barrelsSubject.value;
        this.barrelsSubject.next([...currentBarrels, newBarrel]);
      })
    );
  }

  /**
   * Update an existing barrel
   */
  updateBarrel(id: string | number, barrel: Partial<Barrel>): Observable<Barrel> {
    const endpoint = this.api.replaceParams(environment.endpoints.barrels.update, {id});

    return this.api.put<Barrel>(endpoint, barrel).pipe(
      tap(updatedBarrel => {
        const currentBarrels = this.barrelsSubject.value;
        const index = currentBarrels.findIndex(b => b.id === updatedBarrel.id);
        if (index !== -1) {
          currentBarrels[index] = updatedBarrel;
          this.barrelsSubject.next([...currentBarrels]);
        }
      })
    );
  }

  /**
   * Delete a barrel
   */
  deleteBarrel(id: string | number): Observable<any> {
    const endpoint = this.api.replaceParams(environment.endpoints.barrels.delete, {id});
    return this.api.delete(endpoint).pipe(
      tap(() => {
        const currentBarrels = this.barrelsSubject.value;
        const filteredBarrels = currentBarrels.filter(b => b.id !== id);
        this.barrelsSubject.next(filteredBarrels);
      })
    );
  }

  /**
   * Get barrel statistics
   */
  getStatistics(): Observable<BarrelStatistics> {
    const endpoint = `${environment.endpoints.barrels.base}statistics/`;
    return this.api.get<BarrelStatistics>(endpoint);
  }


  /**
   * Search barrels
   */
  searchBarrels(query: string, params?: QueryParams): Observable<PaginatedResponse<Barrel>> {
    const searchParams = {...params, search: query};
    return this.getBarrels(searchParams);
  }


  /**
   * Calculate total volume
   */
  calculateTotalVolume(barrels: Barrel[]): number {
    return barrels.reduce((total, barrel) => total + barrel.current_volume, 0);
  }

  /**
   * Calculate total capacity
   */
  calculateTotalCapacity(barrels: Barrel[]): number {
    return barrels.reduce((total, barrel) => total + barrel.capacity, 0);
  }


  /**
   * Clear cached barrels data
   */
  clearCache(): void {
    this.barrelsSubject.next([]);
  }


  /**
   * Export barrels data
   */
  exportBarrels(format: 'csv' | 'excel' | 'pdf', params?: QueryParams): Observable<Blob> {
    const endpoint = `${environment.endpoints.barrels.base}export/`;
    const exportParams = {...params, format};
    return this.api.download(endpoint, exportParams);
  }
}
