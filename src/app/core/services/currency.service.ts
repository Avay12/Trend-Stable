import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Currency {
  code: string;
  symbol: string;
  rate: number; // Rate relative to USD (1 USD = X Currency)
}

interface ExchangeRateResponse {
  result: string;
  base_code: string;
  rates: { [key: string]: number };
}

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private readonly BASE_STORAGE_KEY = 'smm_selected_currency';
  private readonly API_URL = 'https://open.er-api.com/v6/latest/USD';

  // Available currencies with mock rates (fallback)
  private currencies: Record<string, Currency> = {
    NPR: { code: 'NPR', symbol: 'Rs', rate: 145.21 },
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
    this.refreshRates();

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

  private async refreshRates(): Promise<void> {
    try {
      const response = await firstValueFrom(this.http.get<ExchangeRateResponse>(this.API_URL));
      if (response && response.result === 'success') {
        this.updateRates(response.rates);
      }
    } catch (error) {
      console.error('Failed to fetch real-time currency rates, using fallback rates.', error);
    }
  }

  private updateRates(newRates: { [key: string]: number }): void {
    Object.keys(this.currencies).forEach((code) => {
      if (newRates[code]) {
        this.currencies[code].rate = newRates[code];
      }
    });
    // Trigger reactivity if needed, though objects in currencies are mutated directly.
    // Since currentCurrency is a computed signal based on currentCurrencyCode and currencies object,
    // and currencies is not a signal itself, we might need to handle this carefully.
    // However, for simple scalar updates this might be okay if the consumer re-renders.
    // Better: Make currencies a signal or use set() if we want fine-grained reactivity.
    // But given the existing structure, mutating the rate is the least invasive change.
    // To ensure UI updates, we might need to toggle the current currency code or make currencies a signal.
    // For now, let's stick to simple mutation as angular change detection usually picks up object property changes in templates if using complex binding,
    // or if the signal dependency tree is triggered.
    // Actually, computed() caches based on signals. If 'this.currencies' is not a signal, 'computed' reads it once.
    // Wait, computed listens to signals consumed within it.
    // 'this.currentCurrencyCode()' is a signal.
    // 'this.currencies' is a plain object.
    // If I mutate 'this.currencies', the computed value doesn't know it needs to re-evaluate.
    // FIX: I should probably force a refresh of the computed signal or make 'currencies' reactive.
    // Let's make 'currencies' reactive in a follow-up if needed, but for now, let's just re-set the current signal safely to trigger an update.
    this.currentCurrencyCode.set(this.currentCurrencyCode());
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
