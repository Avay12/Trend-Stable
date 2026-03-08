import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarService } from '../../services/sidebar.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationsComponent } from '../notifications/notifications.component';

@Component({
    selector: 'app-admin-header',
    imports: [CommonModule, NotificationsComponent],
    templateUrl: './admin-header.html',
    styleUrl: './admin-header.css'
})
export class AdminHeader {
    authService = inject(AuthService);
    sidebarService = inject(SidebarService);
    currencyService = inject(CurrencyService);
    notificationService = inject(NotificationService);
    
    isCurrencyDropdownOpen = signal(false);
    isNotificationsOpen = signal(false);

    availableCurrencies = this.currencyService.getAvailableCurrencies();

    setCurrency(code: string) {
        this.currencyService.setCurrency(code);
        this.isCurrencyDropdownOpen.set(false);
    }

    toggleCurrencyDropdown() {
        this.isCurrencyDropdownOpen.update((v) => !v);
        this.isNotificationsOpen.set(false);
    }

    toggleNotifications() {
        console.log('Toggling notifications, previous state:', this.isNotificationsOpen());
        this.isNotificationsOpen.update((v) => !v);
        this.isCurrencyDropdownOpen.set(false);
    }

    toggleSidebar() {
        this.sidebarService.toggle();
    }
}
