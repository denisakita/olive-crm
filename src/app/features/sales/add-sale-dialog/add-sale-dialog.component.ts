import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MaterialModule} from '../../../shared/material.module';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {Sale} from '../../../models/sale.interface';


@Component({
  selector: 'app-add-sale-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule
  ],
  templateUrl: './add-sale-dialog.component.html',
  styleUrl: './add-sale-dialog.component.scss'
})
export class AddSaleDialogComponent {
  sale: Partial<Sale> = {
    customerName: '',
    product: '',
    quantity: 1,
    price: 0,
    total: 0,
    status: 'pending',
    orderDate: new Date(),
    paymentMethod: 'cash',
    discount: 0,
    tax: 0,
    notes: ''
  };

  products = [
    'Extra Virgin Olive Oil - 500ml',
    'Extra Virgin Olive Oil - 750ml',
    'Extra Virgin Olive Oil - 1L',
    'Premium Olive Oil - 500ml',
    'Premium Olive Oil - 750ml',
    'Premium Olive Oil - 1L',
    'Organic Olive Oil - 500ml',
    'Organic Olive Oil - 750ml',
    'Organic Olive Oil - 1L'
  ];

  paymentMethods = [
    {value: 'cash', label: 'Cash'},
    {value: 'credit', label: 'Credit Card'},
    {value: 'transfer', label: 'Bank Transfer'},
    {value: 'check', label: 'Check'}
  ];

  statuses = [
    {value: 'pending', label: 'Pending'},
    {value: 'completed', label: 'Completed'},
    {value: 'shipped', label: 'Shipped'},
    {value: 'cancelled', label: 'Cancelled'}
  ];

  constructor(
    public dialogRef: MatDialogRef<AddSaleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data && data.sale) {
      this.sale = {...data.sale};
    }
  }

  calculateTotal(): void {
    const subtotal = (this.sale.quantity || 0) * (this.sale.price || 0);
    const discountAmount = subtotal * ((this.sale.discount || 0) / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * ((this.sale.tax || 0) / 100);
    this.sale.total = afterDiscount + taxAmount;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.isFormValid()) {
      this.dialogRef.close(this.sale);
    }
  }

  isFormValid(): boolean {
    return !!(
      this.sale.customerName &&
      this.sale.product &&
      this.sale.quantity &&
      this.sale.quantity > 0 &&
      this.sale.price &&
      this.sale.price > 0
    );
  }

  getSubtotal(): number {
    return (this.sale.quantity || 0) * (this.sale.price || 0);
  }

  getDiscountAmount(): number {
    const subtotal = this.getSubtotal();
    return subtotal * ((this.sale.discount || 0) / 100);
  }

  getTaxAmount(): number {
    const subtotal = this.getSubtotal();
    const afterDiscount = subtotal - this.getDiscountAmount();
    return afterDiscount * ((this.sale.tax || 0) / 100);
  }
}
