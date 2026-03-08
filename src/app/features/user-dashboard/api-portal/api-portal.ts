import { Component, inject, signal } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { OrderService } from '../../../core/services/order.service';
import { OrderStats } from '../../../shared/models/order.model';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-api-portal',
  imports: [DatePipe],
  templateUrl: './api-portal.html',
  styleUrl: './api-portal.css',
  animations: [
    trigger('fadeInUp', [
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      state('*', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', animate('600ms cubic-bezier(0.4, 0, 0.2, 1)')),
    ]),
  ],
})
export class ApiPortal {
  authService = inject(AuthService);
  private orderService = inject(OrderService);

  orderStats = signal<OrderStats>({
    byStatus: [
      {
        status: '',
        _count: 0,
        _sum: {
          charge: 0,
          quantity: 0,
        },
      },
    ],
    total: {
      count: 0,
      totalSpent: 0,
      totalQuantity: 0,
    },
  });

  isLoading = signal(true);
  apiKey = signal<string>('');
  isKeyVisible = signal(false);

  ngOnInit() {
    this.loadOrderStats();
  }

  loadOrderStats() {
    this.orderService.getOrderStats().subscribe({
        next: (res) => {
      this.orderStats.set(res);
      this.isLoading.set(false);
    },
    error: () => {
        this.isLoading.set(false);
    }
    });
  }

  toggleKeyVisibility() {
    this.isKeyVisible.update((v) => !v);
  }

  generateApiKey() {
    // In a real app, this would be an API call
    const newKey = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join('');

    this.apiKey.set(newKey);
    this.isKeyVisible.set(true); // Show the key when generated

  }

  copyApiKey() {
    if (!this.apiKey()) {

      return;
    }

    navigator.clipboard.writeText(this.apiKey()).then(() => {

    });
  }
}
