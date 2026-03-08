import { Component, inject, signal } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { AuthService } from '../../../core/services/auth.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { LanguageService } from '../../../core/services/language.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PromotionsService } from '../../../core/services/promotions.service';
import { Headline } from '../../../shared/models/promotion.model';
import { NotificationsComponent } from '../notifications/notifications.component';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
// import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-dashboard-header',
  imports: [CommonModule, NotificationsComponent, RouterLink],
  templateUrl: './dashboard-header.html',
  styleUrl: './dashboard-header.css',
})
export class DashboardHeader {
  authService = inject(AuthService);
  sidebarService = inject(SidebarService);
  currencyService = inject(CurrencyService);
  languageService = inject(LanguageService);
  notificationService = inject(NotificationService);
  promotionsService = inject(PromotionsService);
  private router = inject(Router);

  activeHeadlines = signal<Headline[]>([]);

  isCurrencyDropdownOpen = signal(false);
  isLanguageDropdownOpen = signal(false);
  isNotificationsOpen = signal(false);
  isProfileMenuOpen = signal(false);

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

  toggleSidebar() {
    this.sidebarService.toggle();
  }

  toggleCurrencyDropdown() {
    this.isCurrencyDropdownOpen.update((v) => !v);
    this.isLanguageDropdownOpen.set(false);
    this.isNotificationsOpen.set(false);
    this.isProfileMenuOpen.set(false);
  }

  toggleLanguageDropdown() {
    this.isLanguageDropdownOpen.update((v) => !v);
    this.isCurrencyDropdownOpen.set(false);
    this.isNotificationsOpen.set(false);
    this.isProfileMenuOpen.set(false);
  }

  toggleNotifications() {
    this.isNotificationsOpen.update((v) => !v);
    this.isCurrencyDropdownOpen.set(false);
    this.isLanguageDropdownOpen.set(false);
    this.isProfileMenuOpen.set(false);
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen.update((v) => !v);
    this.isCurrencyDropdownOpen.set(false);
    this.isLanguageDropdownOpen.set(false);
    this.isNotificationsOpen.set(false);
  }

  setCurrency(code: string) {
    this.currencyService.setCurrency(code);
    this.isCurrencyDropdownOpen.set(false);
  }

  setLanguage(code: string) {
    this.languageService.setLanguage(code);
    this.isLanguageDropdownOpen.set(false);
  }

  logout() {
    this.isProfileMenuOpen.set(false);
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Logout error:', error);
      },
    });
  }
}
