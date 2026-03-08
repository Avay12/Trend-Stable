import { Component, HostListener, inject, input, output, signal, effect, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { ProviderServices } from '../../../core/services/provider.service';

import { CartService } from '../../../core/services/cart.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-order-model',
  imports: [CommonModule, FormsModule, TranslatePipe, RouterLink],
  templateUrl: './order-model.html',
  styleUrl: './order-model.css',
})
export class OrderModel {
  private orderService = inject(OrderService);
  private cartService = inject(CartService);
  private toastrService = inject(ToastrService);
  providerService = inject(ProviderServices);
  authService = inject(AuthService);

  private sanitizer = inject(DomSanitizer);
  currencyService = inject(CurrencyService);
  loading = signal(false);
  isOpen = input(false);
  closeModal = output<void>();
   

  orderDetails = input({
    serviceId: 0,
    title: 'TikTok Followers | Fast API Work | Bot Account | 20K/Day',
    category: 'TikTok',
    quantity: 10,
    unit: 1000,
    pricePer1000: 0.85,
    subtotal: 0.01,
    min: 1000,
    max: 10000,
    total: 0.01,
    profileUrl: '',
  });

  localDetails = signal({
    serviceId: 0,
    title: '',
    category: '',
    quantity: 0,
    unit: 1000,
    pricePer1000: 0,
    subtotal: 0,
    min: 0,
    max: 0,
    total: 0,
    profileUrl: '',
  });

  // Check if balance is insufficient
  insufficientBalance = computed(() => {
    const total = this.localDetails().total * this.providerService.appRange(); // Apply dynamic multiplier matching UI display
    const balance = this.authService.currentUser()?.balance || 0;
    return total > balance;
  });

  // Calculate amount validation needed
  balanceNeeded = computed(() => {
    const total = this.localDetails().total * this.providerService.appRange();
    const balance = this.authService.currentUser()?.balance || 0;
    return Math.max(0, total - balance);
  });

  constructor() {
    effect(
      () => {
        this.localDetails.set({ ...this.orderDetails() });
      },
      { allowSignalWrites: true },
    );
  }

  // Close modal when Escape key is pressed
  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: Event) {
    if (this.isOpen()) {
      this.close();
    }
  }

  handleDecrement() {
    const current = this.localDetails();
    if (current.quantity <= current.min) return;

    const newQuantity = current.quantity - 100; // Adjust step as needed, maybe based on min?
    const newTotal = (newQuantity * current.pricePer1000) / 1000;

    this.localDetails.update((state) => ({
      ...state,
      quantity: newQuantity,
      subtotal: newTotal,
      total: newTotal,
    }));
  }

  handleIncrement() {
    const current = this.localDetails();
    if (current.quantity >= current.max) return;

    const newQuantity = current.quantity + 100;
    const newTotal = (newQuantity * current.pricePer1000) / 1000;

    this.localDetails.update((state) => ({
      ...state,
      quantity: newQuantity,
      subtotal: newTotal,
      total: newTotal,
    }));
  }

  getQuantity(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let quantity = Number(inputElement.value);
    const current = this.localDetails();

    // Validate range
    if (quantity < current.min) quantity = current.min;
    if (quantity > current.max) quantity = current.max;

    const newTotal = (quantity * current.pricePer1000) / 1000;

    this.localDetails.update((state) => ({
      ...state,
      quantity: quantity,
      subtotal: newTotal,
      total: newTotal,
    }));
  }

  readonly PLATFORM_ICONS: { [key: string]: string } = {
    tiktok: `<div class="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 448 512" fill="white">
        <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
      </svg>
    </div>`,

    instagram: `<div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%);">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
    </div>`,

    facebook: `<div class="w-8 h-8 rounded-lg bg-[#1877F2] flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 320 512" fill="white">
        <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
      </svg>
    </div>`,

    youtube: `<div class="w-8 h-8 rounded-lg bg-[#FF0000] flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 576 512" fill="white">
        <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"/>
      </svg>
    </div>`,

    twitter: `<div class="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 512 512" fill="white">
        <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/>
      </svg>
    </div>`,

    linkedin: `<div class="w-8 h-8 rounded-lg bg-[#0A66C2] flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 448 512" fill="white">
        <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"/>
      </svg>
    </div>`,

    telegram: `<div class="w-8 h-8 rounded-lg bg-[#26A5E4] flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 496 512" fill="white">
        <path d="M248 8C111 8 0 119 0 256S111 504 248 504 496 393 496 256 385 8 248 8zM363 176.7c-3.7 39.2-19.9 134.4-28.1 178.3-3.5 18.6-10.3 24.8-16.9 25.4-14.4 1.3-25.3-9.5-39.3-18.7-21.8-14.3-34.2-23.2-55.3-37.2-24.5-16.1-8.6-25 5.3-39.5 3.7-3.8 67.1-61.5 68.3-66.7 .2-.7 .3-3.1-1.2-4.4s-3.6-.8-5.1-.5q-3.3 .7-104.6 69.1-14.8 10.2-26.9 9.9c-8.9-.2-25.9-5-38.6-9.1-15.5-5-27.9-7.7-26.8-16.3q.8-6.7 18.5-13.7 108.4-47.2 144.6-62.3c68.9-28.6 83.2-33.6 92.5-33.8 2.1 0 6.6 .5 9.6 2.9a10.5 10.5 0 0 1 3.5 6.7A43.8 43.8 0 0 1 363 176.7z"/>
      </svg>
    </div>`,

    twitch: `<div class="w-8 h-8 rounded-lg bg-[#9146FF] flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 512 512" fill="white">
        <path d="M391.17,103.47H352.54v109.7h38.63ZM285,103H246.37V212.75H285ZM120.83,0,24.31,91.42V420.58H140.14V512l96.53-91.42h77.25L487.69,256V0ZM449.07,237.75l-77.22,73.12H294.61l-67.6,64v-64H140.14V36.58H449.07Z"/>
      </svg>
    </div>`,

    kick: `<div class="w-8 h-8 rounded-lg bg-[#53FC18] flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="black">
        <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l7.6 3.8L12 11.78 4.4 7.98 12 4.18zM4 9.48l7 3.5v7.04l-7-3.5V9.48zm16 0v7.04l-7 3.5v-7.04l7-3.5z"/>
      </svg>
    </div>`,
  };

  getPlatformIcon(name: string): SafeHtml {
    const match = name.match(
      /\b(Instagram|Facebook|TikTok|YouTube|Telegram|Twitter|Linkedin|Twitch|Kick)\b/i,
    );
    const platform = match ? match[0] : '';
    const iconHtml = this.PLATFORM_ICONS[platform.toLowerCase()] || '';
    return this.sanitizer.bypassSecurityTrustHtml(iconHtml);
  }

  close() {
    this.closeModal.emit();
  }

  // Fix: Accept Event (not KeyboardEvent) for click events
  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  onConfirm() {
    this.loading.set(true);
    this.orderService
      .createMediumOrder({
        serviceId: this.orderDetails().serviceId,
        quantity: this.orderDetails().quantity || this.localDetails().quantity,
        link: this.orderDetails().profileUrl,
      })
      .subscribe({
        next: (order) => {
          this.toastrService.success('Order Created');
          this.close();
          this.loading.set(false);
        },
        error: (error) => {
          this.toastrService.error(error.message);
          console.error('Error creating order:', error);
          this.loading.set(false);
        },
      });
  }

  addToCart(): void {
    // Extract platform from service name
    const match = this.localDetails().title.match(
      /\b(Instagram|Facebook|TikTok|YouTube|Telegram|Twitter|Linkedin|Twitch|Kick)\b/i,
    );
    const platform = match ? match[0] : 'Unknown';

    this.cartService.addItem({
      serviceId: this.localDetails().serviceId,
      serviceName: this.localDetails().title,
      platform: platform,
      category: this.localDetails().category || 'default',
      rate: this.localDetails().pricePer1000,
      min: this.localDetails().min,
      max: this.localDetails().max,
      quantity: this.localDetails().min,
    });
    this.close();

    // Show toast notification
  }
}
