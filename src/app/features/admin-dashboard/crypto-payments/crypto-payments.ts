import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../../core/services/payment.service';
import { CurrencyService } from '../../../core/services/currency.service';

@Component({
  selector: 'app-crypto-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crypto-payments.html',
})
export class CryptoPaymentsComponent {
  private paymentService = inject(PaymentService);
  currencyService = inject(CurrencyService);

  // Signals for state
  payments = signal<any[]>([]);
  total = signal<number>(0);
  totalAmount = signal<string>('');

  // Computed numeric value for template to avoid calling Number() in HTML
  totalAmountValue = computed(() => {
    const amountInNpr = Number(this.totalAmount()) || 0;
    const nprRate = this.currencyService.getCurrency('NPR').rate;
    return amountInNpr / nprRate; 
  });

  page = signal<number>(1);
  limit = signal<number>(10);
  loading = signal<boolean>(true);

  constructor() {
    this.loadPayments();
  }

  loadPayments() {
    this.loading.set(true);
    // Use the new endpoint
    this.paymentService.getAllOxaPayments(this.page(), this.limit()).subscribe({
      next: (res) => {
        this.payments.set(res.payments);
        this.total.set(res.total);
        this.totalAmount.set(res.totalAmount);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load crypto payments', err);
        this.loading.set(false);
      }
    });
  }

  onPageChange(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages()) {
      this.page.set(newPage);
      this.loadPayments();
    }
  }

  totalPages = computed(() => Math.ceil(this.total() / this.limit()));

  get visiblePages(): (number | string)[] {
    const total = this.totalPages();
    const current = this.page();
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number;

    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
            range.push(i);
        }
    }

    range.forEach(i => {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1);
            } else if (i - l !== 1) {
                rangeWithDots.push('...');
            }
        }
        rangeWithDots.push(i);
        l = i;
    });

    return rangeWithDots;
  }
}
