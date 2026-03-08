import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

import { SidebarService } from '../../services/sidebar.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ProviderServices } from '../../../core/services/provider.service';

@Component({
  selector: 'app-admin-sidebar',
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './admin-sidebar.html',
})
export class AdminSidebar {
  authService = inject(AuthService);
  currencyService = inject(CurrencyService);
  providerService = inject(ProviderServices);

  private router = inject(Router);
  sidebarService = inject(SidebarService);

  morethanpanelBalance = signal<number>(0);
  JustPannelBalance = signal<number>(0);

  menuItems = [
    {
      label: 'Orders',
      icon: 'shopping-bag',
      route: '/admin/orders',
    },
    {
      label: 'Users',
      icon: 'users',
      route: '/admin/users',
    },
    {
      label: 'Market Accounts',
      icon: 'store',
      route: '/admin/market-accounts',
    },
    {
      label: 'Provider Balance',
      icon: 'percent',
      route: '/admin/provider-balance',
    },
    {
      label: 'Margin',
      icon: 'trending-up',
      route: '/admin/margin',
    },
    {
      label: 'Statistics',
      icon: 'bar-chart-2',
      route: '/admin/statistics',
    },
    {
      label: 'Marketing',
      icon: 'megaphone',
      route: '/admin/marketing',
    },
  ];

  logout() {
    this.authService.logout().subscribe({
      next: () => {

        this.router.navigate(['/']);
      },
      error: (error) => {

        console.error('Logout error:', error);
      },
    });
  }

  ngOnInit() {
    this.providerService.getMediumBalance().subscribe({
      next: (balance:any) => {
        this.morethanpanelBalance.set(balance.balance);
      },
      error: (error) => {
        console.error('Error loading balance:', error);
      },
    });

    this.providerService.getBalance().subscribe({
      next: (balance:any) => {
        this.JustPannelBalance.set(balance.balance);
      },
      error: (error) => {
        console.error('Error loading balance:', error);
      },
    });
  }

  constructor() {
    this.router.events.subscribe(() => {
      this.closeSidebar();
    });
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  closeSidebar() {
    this.sidebarService.close();
  }
}
