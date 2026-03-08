import { Component, computed, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../../core/services/payment.service';
import { PaymentOrder } from '../../../shared/models/payment.model';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CurrencyService } from '../../../core/services/currency.service';

@Component({
  selector: 'app-payment-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-orders.html',
})
export class PaymentOrdersComponent {
  private paymentService = inject(PaymentService);
  currencyService = inject(CurrencyService);

  // Signals for state
  payments = signal<PaymentOrder[]>([]);
  total = signal<number>(0);
  totalAmount = signal<string>('');

  // Computed numeric value for template to avoid calling Number() in HTML
  // Also handles conversion from NPR (backend default) to USD for display
  totalAmountValue = computed(() => {
    const amountInNpr = Number(this.totalAmount()) || 0;
    const nprRate = this.currencyService.getCurrency('NPR').rate;
    return amountInNpr / nprRate; 
  });




  page = signal<number>(1);
  limit = signal<number>(10);
  searchQuery = signal<string>('');
  loading = signal<boolean>(true);
  
  // Debounce search
  private searchSubject = new Subject<string>();

  constructor() {
    this.loadPayments();

    // Handle search debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.page.set(1); // Reset to page 1 on search
      this.loadPayments();
    });
  }

  loadPayments() {
    this.loading.set(true);
    this.paymentService.getAllPayments(this.page(), this.limit(), this.searchQuery()).subscribe({
      next: (res) => {
        this.payments.set(res.payments);
        this.total.set(res.total);
          this.totalAmount.set(res.totalAmount);


        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load payments', err);
        this.loading.set(false);
      }
    });
  }

  checkPaid() {
      this.paymentService.checkPaid().subscribe({
        next: (res) => {
          this.loadPayments();
        },
        error: (err) => {
          console.error('Failed to check payments', err);
        }
      });
  }

  updatePaid(identifier: string) {
      this.paymentService.updatePaid(identifier).subscribe({
        next: (res) => {
          this.loadPayments();
        },
        error: (err) => {
          console.error('Failed to update payment', err);
        }
      });
  }

  onSearch(query: string) {
    this.searchSubject.next(query);
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
