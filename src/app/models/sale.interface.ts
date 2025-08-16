export interface Sale {
  id: string;
  customerName: string;
  product: string;
  quantity: number;
  price: number;
  total: number;
  status: 'pending' | 'completed' | 'cancelled' | 'shipped';
  orderDate: Date;
  deliveryDate?: Date;
  paymentMethod?: 'cash' | 'credit' | 'transfer' | 'check';
  notes?: string;
  discount?: number;
  tax?: number;
  shippingAddress?: Address;
  billingAddress?: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface SalesSummary {
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
  topProducts: ProductSales[];
  monthlySales: MonthlySales[];
}

export interface ProductSales {
  productName: string;
  quantity: number;
  revenue: number;
}

export interface MonthlySales {
  month: string;
  year: number;
  totalSales: number;
  totalRevenue: number;
}