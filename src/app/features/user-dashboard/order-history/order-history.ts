import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule, DatePipe } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { Orders } from '../../../shared/models/order.model';
import { RouterLink } from "@angular/router";
import { CurrencyService } from '../../../core/services/currency.service';

@Component({
  selector: 'app-order-history',
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './order-history.html',
  styleUrl: './order-history.css',
  animations: [
    trigger('fadeInUp', [
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      state('*', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', animate('600ms cubic-bezier(0.4, 0, 0.2, 1)'))
    ]),
    trigger('slideDown', [
      state('void', style({ height: '0', opacity: '0' })),
      state('*', style({ height: 'auto', opacity: '1' })),
      transition('void <=> *', animate('300ms cubic-bezier(0.4, 0, 0.2, 1)'))
    ])
  ]
})
export class OrderHistory implements OnInit {
  orderService = inject(OrderService);
  currencyService = inject(CurrencyService);
  expandedOrderId: string | null = null;

  selectedStatus = signal('ALL');

  filterStatuses = [
    { label: 'All', value: 'ALL', icon: 'list' },
    { label: 'Pending', value: 'PENDING', icon: 'clock' },
    { label: 'Working', value: 'IN_PROGRESS', icon: 'loader' },
    { label: 'Completed', value: 'COMPLETED', icon: 'check-circle' },
    { label: 'Partial Refunded', value: 'PARTIAL', icon: 'check-check' },
    { label: 'Canceled & Refunded', value: 'CANCELED', icon: 'x-circle' },
  ];

  filteredOrders = computed(() => {
    const allOrders = this.orderService.orders()?.data || [];
    const status = this.selectedStatus();
    if (status === 'ALL') return allOrders;
    // Handle specific mapping if needed, assuming API returns exact matches or we need to normalize
    // Based on standard conventions: 
    if (status === 'IN_PROGRESS') return allOrders.filter(o => o.status === 'IN_PROGRESS' || o.status === 'PROCESSING');
    if (status === 'CANCELED') return allOrders.filter(o => o.status === 'CANCELED' || o.status === 'REFUNDED' || o.status === 'FAILED');
    if (status === 'PARTIAL') return allOrders.filter(o => o.status === 'PARTIAL');
    return allOrders.filter(o => o.status === status);
  });

  loadOrders() {
    this.orderService.getOrders().subscribe((orders: Orders) => {
      this.orderService.orders.set(orders);
    });
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  toggleOrder(orderId: string): void {
    this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
  }

  isOrderExpanded(orderId: string): boolean {
    return this.expandedOrderId === orderId;
  }

  platform(name: string) {
    const match = name.match(/\b(Instagram|Facebook|TikTok|YouTube|Telegram|Twitter|Linkedin|Twitch|Kick)\b/i);
    const platform = match ? match[0] : "";
    return platform;
  }
}
