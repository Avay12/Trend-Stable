import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';
import { AuthService } from '../../../core/services/auth.service';

import { CartService } from '../../../core/services/cart.service';
import { CommonModule } from '@angular/common';
import { CurrencyService } from '../../../core/services/currency.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  authService = inject(AuthService);
  cartService = inject(CartService);
  currencyService = inject(CurrencyService);
  
  private router = inject(Router);
  sidebarService = inject(SidebarService);

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

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  constructor() {
    this.router.events.subscribe(() => {
      this.sidebarService.close();
    });
  }

  closeSidebar() {
    this.sidebarService.close();
  }
}
