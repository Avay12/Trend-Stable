import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, ActivatedRoute, Router } from '@angular/router';
import { DashboardHeader } from '../../shared/components/dashboard-header/dashboard-header';
import { Sidebar } from '../../shared/components/sidebar/sidebar';
import { CurrencyService } from '../../core/services/currency.service';
import { LanguageService } from '../../core/services/language.service';
import { NotificationService } from '../../core/services/notification.service';
import { PromotionsService } from '../../core/services/promotions.service';
import { Headline } from '../../shared/models/promotion.model';

@Component({
  selector: 'app-user-dashboard',
  imports: [CommonModule, RouterOutlet, DashboardHeader, Sidebar],  
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css',
})
export class UserDashboard {
  currencyService = inject(CurrencyService);
  languageService = inject(LanguageService);
  notificationService = inject(NotificationService);
  promotionsService = inject(PromotionsService);

  activeHeadlines = signal<Headline[]>([]);

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  constructor() {
     this.route.queryParams.subscribe((params: any) => {
      if (params['payment']) {
        const paymentStatus = params['payment'];
         this.router.navigate(['/dashboard/payment-status'], {
          queryParams: { status: paymentStatus }
        });
      }
    });
  }

  ngOnInit() {
    this.promotionsService.getActiveHeadlines().subscribe({
      next: (headlines: any) => {
        this.activeHeadlines.set(headlines);
      },
      error: (err: any) => {
        console.error('Failed to load active headlines', err);
      }
    });
  }

 isCurrencyDropdownOpen = signal(false);
  isLanguageDropdownOpen = signal(false);
  isNotificationsOpen = signal(false);

  toggleCurrencyDropdown() {
    this.isCurrencyDropdownOpen.update((v) => !v);
    this.isLanguageDropdownOpen.set(false);
    this.isNotificationsOpen.set(false);
  }

  toggleLanguageDropdown() {
    this.isLanguageDropdownOpen.update((v) => !v);
    this.isCurrencyDropdownOpen.set(false);
    this.isNotificationsOpen.set(false);
  }

  toggleNotifications() {
    this.isNotificationsOpen.update((v) => !v);
    this.isLanguageDropdownOpen.set(false);
    this.isCurrencyDropdownOpen.set(false);
  }

  setCurrency(code: string) {
    this.currencyService.setCurrency(code);
    this.isCurrencyDropdownOpen.set(false);
    this.isNotificationsOpen.set(false);
  }

  setLanguage(code: string) {
    this.languageService.setLanguage(code);
    this.isLanguageDropdownOpen.set(false);
    this.isNotificationsOpen.set(false);
  }

}
