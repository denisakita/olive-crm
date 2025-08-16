import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import {ApiService, PaginatedResponse, QueryParams} from './api.service';
import {Barrel, BarrelStatistics, BarrelTransaction, BottleCoverage} from '../../models/barrel.interface';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BarrelService {
  private barrelsSubject = new BehaviorSubject<Barrel[]>([]);
  public barrels$ = this.barrelsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private statsSubject = new BehaviorSubject<BarrelStatistics | null>(null);
  public stats$ = this.statsSubject.asObservable();

  // Constants for calculations
  private readonly BOTTLE_SIZE = 0.75; // 750ml bottles in liters

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
        this.calculateStatistics(response.results);
      }),
      map(response => response)
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
        this.calculateStatistics([...currentBarrels, newBarrel]);
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
        const index = currentBarrels.findIndex(b => b.id === id);
        if (index !== -1) {
          currentBarrels[index] = updatedBarrel;
          this.barrelsSubject.next([...currentBarrels]);
          this.calculateStatistics(currentBarrels);
        }
      })
    );
  }

  /**
   * Partially update a barrel
   */
  patchBarrel(id: string | number, changes: Partial<Barrel>): Observable<Barrel> {
    const endpoint = this.api.replaceParams(environment.endpoints.barrels.update, {id});
    return this.api.patch<Barrel>(endpoint, changes).pipe(
      tap(updatedBarrel => {
        const currentBarrels = this.barrelsSubject.value;
        const index = currentBarrels.findIndex(b => b.id === id);
        if (index !== -1) {
          currentBarrels[index] = updatedBarrel;
          this.barrelsSubject.next([...currentBarrels]);
          this.calculateStatistics(currentBarrels);
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
        this.calculateStatistics(filteredBarrels);
      })
    );
  }

  /**
   * Get barrel transactions (fill, empty, transfer, sample)
   */
  getBarrelTransactions(barrelId: string | number, params?: QueryParams): Observable<PaginatedResponse<BarrelTransaction>> {
    const endpoint = this.api.replaceParams(environment.endpoints.barrels.transactions, {id: barrelId});
    return this.api.getPaginated<BarrelTransaction>(endpoint, params);
  }

  /**
   * Add a barrel transaction
   */
  addBarrelTransaction(barrelId: string | number, transaction: Partial<BarrelTransaction>): Observable<BarrelTransaction> {
    const endpoint = this.api.replaceParams(environment.endpoints.barrels.transactions, {id: barrelId});
    return this.api.post<BarrelTransaction>(endpoint, transaction).pipe(
      tap(() => {
        // Refresh the barrel data after transaction
        this.getBarrel(barrelId).subscribe(updatedBarrel => {
          const currentBarrels = this.barrelsSubject.value;
          const index = currentBarrels.findIndex(b => b.id === barrelId);
          if (index !== -1) {
            currentBarrels[index] = updatedBarrel;
            this.barrelsSubject.next([...currentBarrels]);
            this.calculateStatistics(currentBarrels);
          }
        });
      })
    );
  }


  /**
   * Fill a barrel with product
   */
  fillBarrel(barrelId: string | number, volume: number, product: string): Observable<Barrel> {
    const transaction: Partial<BarrelTransaction> = {
      type: 'fill',
      volumeChange: volume,
      date: new Date(),
      reason: `Filled with ${product}`
    };

    return this.addBarrelTransaction(barrelId, transaction).pipe(
      switchMap(() => this.getBarrel(barrelId))
    );
  }

  /**
   * Empty a barrel
   */
  emptyBarrel(barrelId: string | number, volume: number, reason?: string): Observable<Barrel> {
    const transaction: Partial<BarrelTransaction> = {
      type: 'empty',
      volumeChange: -volume,
      date: new Date(),
      reason: reason || 'Barrel emptied'
    };

    return this.addBarrelTransaction(barrelId, transaction).pipe(
      switchMap(() => this.getBarrel(barrelId))
    );
  }

  /**
   * Transfer product between barrels
   */
  transferBetweenBarrels(
    fromBarrelId: string | number,
    toBarrelId: string | number,
    volume: number
  ): Observable<{ from: Barrel; to: Barrel }> {
    const fromTransaction: Partial<BarrelTransaction> = {
      type: 'transfer',
      volumeChange: -volume,
      date: new Date(),
      reason: `Transferred to barrel ${toBarrelId}`
    };

    const toTransaction: Partial<BarrelTransaction> = {
      type: 'transfer',
      volumeChange: volume,
      date: new Date(),
      reason: `Received from barrel ${fromBarrelId}`
    };

    return new Observable(observer => {
      this.addBarrelTransaction(fromBarrelId, fromTransaction).subscribe(() => {
        this.addBarrelTransaction(toBarrelId, toTransaction).subscribe(() => {
          this.getBarrel(fromBarrelId).subscribe(fromBarrel => {
            this.getBarrel(toBarrelId).subscribe(toBarrel => {
              observer.next({from: fromBarrel, to: toBarrel});
              observer.complete();
            });
          });
        });
      });
    });
  }

  /**
   * Get barrels by status
   */
  getBarrelsByStatus(status: 'empty' | 'partial' | 'full', params?: QueryParams): Observable<PaginatedResponse<Barrel>> {
    const statusParams = {...params, status};
    return this.getBarrels(statusParams);
  }


  /**
   * Calculate bottle coverage for a barrel
   */
  calculateBottleCoverage(barrel: Barrel): BottleCoverage {
    const currentBottles = Math.floor(barrel.currentVolume / this.BOTTLE_SIZE);
    const maxBottles = Math.floor(barrel.capacity / this.BOTTLE_SIZE);
    const coveragePercentage = (barrel.currentVolume / barrel.capacity) * 100;

    return {
      barrelId: barrel.id,
      currentBottles,
      maxBottles,
      bottleSize: this.BOTTLE_SIZE,
      coveragePercentage
    };
  }

  /**
   * Calculate statistics for barrels
   */
  private calculateStatistics(barrels: Barrel[]): void {
    const stats: BarrelStatistics = {
      totalBarrels: barrels.length,
      emptyBarrels: barrels.filter(b => b.status === 'empty').length,
      partialBarrels: barrels.filter(b => b.status === 'partial').length,
      fullBarrels: barrels.filter(b => b.status === 'full').length,
      totalCapacity: barrels.reduce((sum, b) => sum + b.capacity, 0),
      totalCurrentVolume: barrels.reduce((sum, b) => sum + b.currentVolume, 0),
      utilizationRate: 0,
      bottleCapacity: 0,
      averageAge: 0
    };

    // Calculate utilization rate
    if (stats.totalCapacity > 0) {
      stats.utilizationRate = (stats.totalCurrentVolume / stats.totalCapacity) * 100;
    }

    // Calculate total bottle capacity
    stats.bottleCapacity = Math.floor(stats.totalCurrentVolume / this.BOTTLE_SIZE);

    // Calculate average age (days since filling)
    const barrelsWithFillDate = barrels.filter(b => b.fillingDate);
    if (barrelsWithFillDate.length > 0) {
      const totalDays = barrelsWithFillDate.reduce((sum, b) => {
        const fillDate = new Date(b.fillingDate!);
        const now = new Date();
        const days = Math.floor((now.getTime() - fillDate.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      stats.averageAge = Math.round(totalDays / barrelsWithFillDate.length);
    }

    this.statsSubject.next(stats);
  }

  /**
   * Get barrel statistics
   */
  getStatistics(): Observable<BarrelStatistics> {
    const endpoint = `${environment.endpoints.barrels.base}stats/`;
    return this.api.get<BarrelStatistics>(endpoint).pipe(
      tap(stats => this.statsSubject.next(stats))
    );
  }

  /**
   * Export barrels data
   */
  exportBarrels(format: 'csv' | 'excel' | 'pdf', params?: QueryParams): Observable<Blob> {
    const endpoint = `${environment.endpoints.barrels.base}export/`;
    const exportParams = {...params, format};
    return this.api.download(endpoint, exportParams);
  }


  /**
   * Bulk update barrel status
   */
  bulkUpdateStatus(barrelIds: (string | number)[], status: string): Observable<any> {
    const endpoint = `${environment.endpoints.barrels.base}bulk-update/`;
    return this.api.post(endpoint, {ids: barrelIds, status});
  }

  /**
   * Clear cached barrel data
   */
  clearCache(): void {
    this.barrelsSubject.next([]);
    this.statsSubject.next(null);
  }

  /**
   * Refresh barrel data
   */
  refreshBarrels(params?: QueryParams): Observable<PaginatedResponse<Barrel>> {
    this.clearCache();
    return this.getBarrels(params);
  }
}
