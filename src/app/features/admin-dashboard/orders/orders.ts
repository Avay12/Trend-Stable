import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { OrderService } from '../../../core/services/order.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { OrderList, UsersOrder } from '../../../shared/models/order.model';

@Component({
  selector: 'app-admin-orders',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePipe],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class AdminOrders implements OnInit {
  orderService = inject(OrderService);
  currencyService = inject(CurrencyService);
  fb = inject(FormBuilder);

  orders = signal<OrderList[]>([]);
  isLoading = signal(true);
  searchTerm = '';
  selectedStatus = '';
  showEditModal = signal(false);

  // Pagination Removed

  orderForm = this.fb.nonNullable.group({
    id: [''],
    user: ['', Validators.required],
    service: ['', Validators.required],
    quantity: [10, [Validators.required, Validators.min(10)]],
    charge: [0, [Validators.required, Validators.min(0)]],
    link: ['', Validators.required],
    status: ['IN_PROGRESS', Validators.required],
  });

  loadUsers(search?: string) {
    this.orderService.getAllOrders(search, this.selectedStatus).subscribe({
      next: (orders) => {
        this.orders.set(orders.orders);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.isLoading.set(false);
      },
    });
  }

  onSearch() {
    this.isLoading.set(true);
    this.loadUsers(this.searchTerm);
  }

  ngOnInit() {
    this.loadUsers();
  }

  openEditModal(order: OrderList) {
    this.orderForm.patchValue({
      id: order.id,
      user: order.username,
      service: order.service,
      quantity: order.quantity,
      charge: order.charge,
      status: order.status,
      link: order.link,
    });
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.orderForm.reset();
  }

  updateOrderStatus() {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const formValue = this.orderForm.getRawValue();
    const { id, status, ..._ } = formValue;

    this.orderService.updateOrderStatus(id!, status).subscribe({
      next: () => {
        // this.loadUsers(true);

        this.closeEditModal();
      },
      error: (err) => {
        console.error('Error updating order status:', err);
      },
    });
  }

  exportToPDF() {
    // Excel export implementation will be added
  }

  exportToExcel() {}
}
