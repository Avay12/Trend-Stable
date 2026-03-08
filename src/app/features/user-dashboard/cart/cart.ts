import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CartService } from '../../../core/services/cart.service';
import { CartItem } from '../../../shared/models/cart.model';
import { AuthService } from '../../../core/services/auth.service';
import { RouterLink } from "@angular/router";
import { CurrencyService } from '../../../core/services/currency.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
  animations: [
    trigger('fadeInUp', [
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      state('*', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', animate('600ms cubic-bezier(0.4, 0, 0.2, 1)'))
    ])
  ]
})
export class Cart {
  cartService = inject(CartService);
  authService = inject(AuthService);
  currencyService = inject(CurrencyService);

  // Computed values from cart service
  get cartItems() {
    return this.cartService.items();
  }

  get itemCount() {
    return this.cartService.itemCount();
  }

  get total() {
    return this.cartService.total();
  }

  // Methods
  increaseQuantity(item: CartItem): void {
    this.cartService.increaseQuantity(item.serviceId, 100);
  }

  decreaseQuantity(item: CartItem): void {
    this.cartService.decreaseQuantity(item.serviceId, 100);
  }

  removeItem(serviceId: number): void {
    this.cartService.removeItem(serviceId);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  getItemTotal(item: CartItem): number {
    return this.cartService.getItemTotal(item);
  }

  formatPrice(price: number | any): string {
    const numPrice = typeof price === 'number' ? price : parseFloat(price) || 0;
    return numPrice.toFixed(2);
  }

  platform(name: string) {
    const match = name.match(/\b(Instagram|Facebook|TikTok|YouTube|Telegram|Twitter|Linkedin|Twitch|Kick)\b/i);
    const platform = match ? match[0] : "";
    return platform;
  }
}
