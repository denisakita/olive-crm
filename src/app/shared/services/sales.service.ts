import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService, PaginatedResponse, QueryParams } from './api.service';
import { Sale, SalesSummary } from '../models/sale.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private salesSubject = new BehaviorSubject<Sale[]>([]);
  public sales$ = this.salesSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private api: ApiService) {}

  /**
   * Transform backend sale data to frontend format
   */
  private transformSaleFromBackend(backendSale: any): Sale {
    return {
      id: backendSale.id,
      customerName: backendSale.customer_name || backendSale.customer,
      product: backendSale.product,
      quantity: Number(backendSale.quantity) || 0,
      price: Number(backendSale.price) || 0,
      total: Number(backendSale.total) || 0,
      status: backendSale.status,
      orderDate: new Date(backendSale.order_date),
      deliveryDate: backendSale.delivery_date ? new Date(backendSale.delivery_date) : undefined,
      paymentMethod: backendSale.payment_method,
      notes: backendSale.notes,
      discount: Number(backendSale.discount) || 0,
      tax: Number(backendSale.tax) || 0,
      shippingAddress: backendSale.shipping_address,
      billingAddress: backendSale.billing_address
    };
  }

  /**
   * Transform frontend sale data to backend format
   */
  private transformSaleToBackend(sale: Partial<Sale>): any {
    const backendSale: any = {};

    if (sale.id !== undefined) backendSale.id = sale.id;
    if (sale.customerName !== undefined) backendSale.customer_name = sale.customerName;
    if (sale.product !== undefined) backendSale.product = sale.product;
    if (sale.quantity !== undefined) backendSale.quantity = sale.quantity;
    if (sale.price !== undefined) backendSale.price = sale.price;
    if (sale.total !== undefined) backendSale.total = sale.total;
    if (sale.status !== undefined) backendSale.status = sale.status;
    if (sale.orderDate !== undefined) backendSale.order_date = sale.orderDate instanceof Date ? sale.orderDate.toISOString() : sale.orderDate;
    if (sale.deliveryDate !== undefined) backendSale.delivery_date = sale.deliveryDate instanceof Date ? sale.deliveryDate.toISOString() : sale.deliveryDate;
    if (sale.paymentMethod !== undefined) backendSale.payment_method = sale.paymentMethod;
    if (sale.notes !== undefined) backendSale.notes = sale.notes;
    if (sale.discount !== undefined) backendSale.discount = sale.discount;
    if (sale.tax !== undefined) backendSale.tax = sale.tax;
    if (sale.shippingAddress !== undefined) backendSale.shipping_address = sale.shippingAddress;
    if (sale.billingAddress !== undefined) backendSale.billing_address = sale.billingAddress;

    return backendSale;
  }

  /**
   * Get all sales with optional filters
   */
  getSales(params?: QueryParams): Observable<PaginatedResponse<Sale>> {
    this.loadingSubject.next(true);
    const endpoint = environment.endpoints.sales.list;

    return this.api.getPaginated<any>(endpoint, params).pipe(
      map(response => ({
        ...response,
        results: response.results.map((sale: any) => this.transformSaleFromBackend(sale))
      })),
      tap(response => {
        this.salesSubject.next(response.results);
        this.loadingSubject.next(false);
      })
    );
  }

  /**
   * Get a single sale by ID
   */
  getSale(id: string | number): Observable<Sale> {
    const endpoint = this.api.replaceParams(environment.endpoints.sales.detail, { id });
    return this.api.get<any>(endpoint).pipe(
      map(sale => this.transformSaleFromBackend(sale))
    );
  }

  /**
   * Create a new sale
   */
  createSale(sale: Partial<Sale>): Observable<Sale> {
    const endpoint = environment.endpoints.sales.create;
    const backendSale = this.transformSaleToBackend(sale);

    return this.api.post<any>(endpoint, backendSale).pipe(
      map(response => this.transformSaleFromBackend(response)),
      tap(newSale => {
        const currentSales = this.salesSubject.value;
        this.salesSubject.next([...currentSales, newSale]);
      })
    );
  }

  /**
   * Update an existing sale
   */
  updateSale(id: string | number, sale: Partial<Sale>): Observable<Sale> {
    const endpoint = this.api.replaceParams(environment.endpoints.sales.update, { id });
    const backendSale = this.transformSaleToBackend(sale);

    return this.api.put<any>(endpoint, backendSale).pipe(
      map(response => this.transformSaleFromBackend(response)),
      tap(updatedSale => {
        const currentSales = this.salesSubject.value;
        const index = currentSales.findIndex(s => s.id === id);
        if (index !== -1) {
          currentSales[index] = updatedSale;
          this.salesSubject.next([...currentSales]);
        }
      })
    );
  }

  /**
   * Partially update a sale
   */
  patchSale(id: string | number, changes: Partial<Sale>): Observable<Sale> {
    const endpoint = this.api.replaceParams(environment.endpoints.sales.update, { id });
    const backendChanges = this.transformSaleToBackend(changes);

    return this.api.patch<any>(endpoint, backendChanges).pipe(
      map(response => this.transformSaleFromBackend(response)),
      tap(updatedSale => {
        const currentSales = this.salesSubject.value;
        const index = currentSales.findIndex(s => s.id === id);
        if (index !== -1) {
          currentSales[index] = updatedSale;
          this.salesSubject.next([...currentSales]);
        }
      })
    );
  }

  /**
   * Delete a sale
   */
  deleteSale(id: string | number): Observable<any> {
    const endpoint = this.api.replaceParams(environment.endpoints.sales.delete, { id });
    return this.api.delete(endpoint).pipe(
      tap(() => {
        const currentSales = this.salesSubject.value;
        const filteredSales = currentSales.filter(s => s.id !== id);
        this.salesSubject.next(filteredSales);
      })
    );
  }

  /**
   * Get sales statistics
   */
  getSalesStats(params?: QueryParams): Observable<SalesSummary> {
    const endpoint = environment.endpoints.sales.stats;
    return this.api.get<SalesSummary>(endpoint, params);
  }

  /**
   * Export sales data
   */
  exportSales(format: 'csv' | 'excel' | 'pdf', params?: QueryParams): Observable<Blob> {
    const endpoint = environment.endpoints.sales.export;
    const exportParams = { ...params, format };
    return this.api.download(endpoint, exportParams);
  }

  /**
   * Bulk update sales status
   */
  bulkUpdateStatus(saleIds: (string | number)[], status: string): Observable<any> {
    const endpoint = `${environment.endpoints.sales.base}bulk-update/`;
    return this.api.post(endpoint, { ids: saleIds, status });
  }

  /**
   * Search sales
   */
  searchSales(query: string, params?: QueryParams): Observable<PaginatedResponse<Sale>> {
    const searchParams = { ...params, search: query };
    return this.getSales(searchParams);
  }

  /**
   * Get sales by customer
   */
  getSalesByCustomer(customerId: string | number, params?: QueryParams): Observable<PaginatedResponse<Sale>> {
    const customerParams = { ...params, customer_id: customerId };
    return this.getSales(customerParams);
  }

  /**
   * Get sales by date range
   */
  getSalesByDateRange(startDate: Date, endDate: Date, params?: QueryParams): Observable<PaginatedResponse<Sale>> {
    const dateParams = {
      ...params,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    };
    return this.getSales(dateParams);
  }

  /**
   * Get sales by status
   */
  getSalesByStatus(status: string, params?: QueryParams): Observable<PaginatedResponse<Sale>> {
    const statusParams = { ...params, status };
    return this.getSales(statusParams);
  }

  /**
   * Calculate total revenue
   */
  calculateTotalRevenue(sales: Sale[]): number {
    return sales.reduce((total, sale) => total + sale.total, 0);
  }

  /**
   * Get top selling products
   */
  getTopSellingProducts(limit: number = 10, params?: QueryParams): Observable<any> {
    const endpoint = `${environment.endpoints.sales.base}top-products/`;
    const topParams = { ...params, limit };
    return this.api.get(endpoint, topParams);
  }

  /**
   * Clear cached sales data
   */
  clearCache(): void {
    this.salesSubject.next([]);
  }

  /**
   * Refresh sales data
   */
  refreshSales(params?: QueryParams): Observable<PaginatedResponse<Sale>> {
    this.clearCache();
    return this.getSales(params);
  }

  /**
   * Get dropdown options for sales forms
   */
  getSalesOptions(): Observable<{
    products: string[];
    statuses: Array<{value: string, label: string}>;
    payment_methods: Array<{value: string, label: string}>;
  }> {
    const endpoint = `${environment.endpoints.sales.base}options/`;
    return this.api.get(endpoint);
  }
}
