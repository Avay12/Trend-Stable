import { Component, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ProviderServices } from '../../../core/services/provider.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

interface ProviderBalance {
  name: string;
  balance: number;
  currency: string;
}

@Component({
  selector: 'app-provider-balance',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './provider-balance.html',
})
export class ProviderBalanceComponent {
  private providerService = inject(ProviderServices);
  currencyService = inject(CurrencyService);

  isLoading = signal(true);

  providers = signal<ProviderBalance[]>([
    { name: 'MoreThanPanel(VIP)', balance: 0, currency: 'USD' },
    { name: 'CasperSmm(Medium)', balance: 0, currency: 'USD' },
    { name: 'SmmBind(Cheap)', balance: 0, currency: 'USD' },
  ]);

  constructor() {
    this.loadBalances();
  }

  loadBalances() {
    this.isLoading.set(true);

    const reqs = [
      this.providerService.getBalance().pipe(
        catchError(() => of({ balance: 0 }))
      ),
      this.providerService.getMediumBalance().pipe(
        catchError(() => of({ balance: 0 }))
      ),
      this.providerService.getCheapBalance().pipe(
        catchError(() => of({ balance: 0 }))
      )
    ];

    forkJoin(reqs).subscribe({
      next: ([res1, res2, res3]: any[]) => {
        this.updateProviderBalance('CasperSmm(Medium)', Number(res1.balance));
        this.updateProviderBalance('MoreThanPanel(VIP)', Number(res2.balance));
        this.updateProviderBalance('SmmBind(Cheap)', Number(res3.balance));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading balances', err);
        this.isLoading.set(false);
      }
    });
  }

  private updateProviderBalance(name: string, balance: number) {
    this.providers.update((current) =>
      current.map((p) => (p.name === name ? { ...p, balance } : p))
    );
  }

  refresh() {
    this.loadBalances();
  }
}
