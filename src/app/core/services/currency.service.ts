import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { AuthService } from './auth.service';

export interface Currency {
  code: string;
  symbol: string;
  rate: number; // Rate relative to USD (1 USD = X Currency)
}

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private authService = inject(AuthService);
  private readonly BASE_STORAGE_KEY = 'smm_selected_currency';

  // Available currencies
  private currencies: Record<string, Currency> = {
    NPR: { code: 'NPR', symbol: 'Rs', rate: 150 },
    USD: { code: 'USD', symbol: '$', rate: 1 },
    INR: { code: 'INR', symbol: '₹', rate: 84.0 },
    MYR: { code: 'MYR', symbol: 'RM', rate: 4.72 },
    EUR: { code: 'EUR', symbol: '€', rate: 0.92 },
    GBP: { code: 'GBP', symbol: '£', rate: 0.79 },
    RUB: { code: 'RUB', symbol: '₽', rate: 92.5 },
    SAR: { code: 'SAR', symbol: '﷼', rate: 3.75 },
    KRW: { code: 'KRW', symbol: '₩', rate: 1330 },
    PKR: { code: 'PKR', symbol: 'Rs', rate: 278.5 },
    CAD: { code: 'CAD', symbol: 'C$', rate: 1.36 },
    AED: { code: 'AED', symbol: 'د.إ', rate: 3.67 },
    AUD: { code: 'AUD', symbol: 'A$', rate: 1.52 },
    BDT: { code: 'BDT', symbol: '৳', rate: 109.5 },
    QAR: { code: 'QAR', symbol: '﷼', rate: 3.64 },
    RON: { code: 'RON', symbol: 'lei', rate: 4.58 },
  };

  // Signal for current selected currency code
  currentCurrencyCode = signal<string>(this.authService.currentUser()?.currency || 'USD');

  // Computed signal for the current currency object
  currentCurrency = computed(() => this.currencies[this.currentCurrencyCode()]);

  constructor() {
    // When user changes (login/logout/refresh), reload their currency preference
    effect(
      () => {
        const user = this.authService.currentUser();
        this.loadCurrency();
      },
      { allowSignalWrites: true },
    );

    // Save to local storage whenever currency changes
    effect(() => {
      const userId = this.getUserId();
      if (userId) {
        localStorage.setItem(`${this.BASE_STORAGE_KEY}_${userId}`, this.currentCurrencyCode());
      }
    });
  }

  getAvailableCurrencies(): Currency[] {
    return Object.values(this.currencies);
  }

  getCurrency(code: string): Currency {
    return this.currencies[code] || this.currencies['USD'];
  }

  setCurrency(code: string): void {
    if (this.currencies[code]) {
      this.currentCurrencyCode.set(code);
    }
  }

  /**
   * Convert amount from USD to current currency
   * @param amountInUsd Amount in USD
   */
  convert(amountInUsd: number): number {
    return amountInUsd * this.currentCurrency().rate;
  }

  /**
   * Convert amount from USD to specific currency
   */
  convertTo(amountInUsd: number, currencyCode: string): number {
    const rate = this.currencies[currencyCode]?.rate || 1;
    return amountInUsd * rate;
  }

  private getUserId(): string {
    const user = this.authService.currentUser();
    return user?.id || 'guest';
  }

  private loadCurrency(): void {
    const userId = this.getUserId();
    const saved = localStorage.getItem(`${this.BASE_STORAGE_KEY}_${userId}`);
    if (saved && this.currencies[saved]) {
      this.currentCurrencyCode.set(saved);
    } else {
      // Default to USD
      this.currentCurrencyCode.set(this.authService.currentUser()?.currency || 'USD');
    }
  }
}
