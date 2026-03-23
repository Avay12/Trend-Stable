import { Component, inject, signal } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { MarketPlaceModal } from '../../../shared/components/market-place/market-place';
import { AccountOrderService } from '../../../core/services/accountOrder.service';
import { AccountOrder } from '../../../shared/models/acoount-order.model';
import { PlatformIconComponent } from '../../../shared/components/platform-icon/platform-icon.component';
import { CurrencyService } from '../../../core/services/currency.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-market-place',
  imports: [MarketPlaceModal, PlatformIconComponent,CommonModule],
  templateUrl: './market-place.html',
  styleUrl: './market-place.css',
  animations: [
    trigger('fadeInUp', [
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      state('*', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', animate('600ms cubic-bezier(0.4, 0, 0.2, 1)')),
    ]),
  ],
})
export class MarketPlace {
  private accountOrderService = inject(AccountOrderService);
  currencyService = inject(CurrencyService);

  isLoading = signal(true);
  searchTerm = '';
  platform = '';
  allBuyAccounts: AccountOrder[] = [];
  allSellAccounts: AccountOrder[] = [];
  buyAccounts = signal<AccountOrder[]>([]);
  sellAccounts = signal<AccountOrder[]>([]);
  activeTab = signal<'browse' | 'my-listings'>('browse');

  onPlatformChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    this.platform = value === 'All Platforms' ? '' : value;
    this.filterAccounts();
  }

  filterAccounts() {
    const platformFilter = this.platform.toLowerCase();
    if (!platformFilter) {
      this.buyAccounts.set(this.allBuyAccounts);
      this.sellAccounts.set(this.allSellAccounts);
    } else {
      this.buyAccounts.set(
        this.allBuyAccounts.filter(account => account.platform?.toLowerCase() === platformFilter)
      );
      this.sellAccounts.set(
        this.allSellAccounts.filter(account => account.platform?.toLowerCase() === platformFilter)
      );
    }
  }

  setActiveTab(tab: 'browse' | 'my-listings') {
    this.activeTab.set(tab);
  }

  isModalOpen = false;

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  ngOnInit() {
    this.loadBuyingAccounts();
    this.loadSellingAccounts();
  }

  loadBuyingAccounts() {
    this.isLoading.set(true);
    this.accountOrderService.getAllAccountBuying(this.searchTerm, '').subscribe({
      next: (accounts) => {
        this.allBuyAccounts = accounts as any;
        this.filterAccounts();
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading buying accounts:', err);
        this.isLoading.set(false);
      },
    });
  }

  loadSellingAccounts() {
    this.accountOrderService.getAccountOrderById(this.searchTerm, '').subscribe({
      next: (accounts) => {
        this.allSellAccounts = accounts as any;
        this.filterAccounts();
        // We generally rely on loadBuyingAccounts to clear loading for the main view,
        // but if tab switches, this data is already there. 
        // We can just leave isLoading alone here or set it false too as safeguard.
      },
      error: (err: any) => {
        console.error('Error loading selling accounts:', err);
      },
    });
  }

  deleteSellingAccount(id: string) {
    this.accountOrderService.deleteAccountOrder(id).subscribe({
      next: () => {

        this.loadSellingAccounts();
      },
      error: (err: any) => {
        console.error('Error deleting account:', err);

      },
    });
  }

  getPlatformStyle(platform: string): { gradient: string; icon: string } {
    const platformLower = platform.toLowerCase();
    switch (platformLower) {
      case 'facebook':
        return { gradient: 'from-blue-600 to-blue-700', icon: 'facebook' };
      case 'instagram':
        return { gradient: 'from-pink-500 to-purple-500', icon: 'instagram' };
      case 'tiktok':
        return { gradient: 'from-cyan-400 to-pink-500', icon: 'music2' };
      case 'youtube':
        return { gradient: 'from-red-500 to-red-600', icon: 'youtube' };
      case 'twitter':
      case 'twitter / x':
        return { gradient: 'from-gray-700 to-gray-900', icon: 'x' };
      case 'telegram':
        return { gradient: 'from-sky-400 to-blue-500', icon: 'send' };
      case 'twitch':
        return { gradient: 'from-purple-500 to-purple-700', icon: 'twitch' };
      case 'kick':
        return { gradient: 'from-green-400 to-green-600', icon: 'play' };
      case 'linkedin':
        return { gradient: 'from-blue-500 to-blue-700', icon: 'linkedin' };
      default:
        return { gradient: 'from-gray-500 to-gray-600', icon: 'globe' };
    }
  }

  navigateToProfile(platform: string, username: string) {
    let url = '';
    const cleanUsername = username.replace('@', '');
    
    switch (platform.toLowerCase()) {
      case 'tiktok':
        url = `https://www.tiktok.com/@${cleanUsername}`;
        break;
      case 'instagram':
        url = `https://www.instagram.com/${cleanUsername}/`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/${cleanUsername}/`;
        break;
      case 'twitter':
      case 'x':
        url = `https://twitter.com/${cleanUsername}`;
        break;
      case 'telegram':
        url = `https://t.me/${cleanUsername}`;
        break;
      case 'youtube':
        url = `https://www.youtube.com/@${cleanUsername}`;
        break;
      case 'twitch':
        url = `https://www.twitch.tv/${cleanUsername}`;
        break;
      case 'kick':
        url = `https://kick.com/${cleanUsername}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/in/${cleanUsername}`;
        break;
      default:
        // Default or unhandled platform
        return;
    }
    
    window.open(url, '_blank');
  }

  onSubmitListing(listingData: any) {
    console.log('Listing submitted:', listingData);
    // Handle API call here
    // Example:
    this.accountOrderService.createAccountOrder(listingData).subscribe({
      next: (response) => {
        console.log('Listing created:', response);
      },
      error: (error) => {
        console.error('Error creating listing:', error);
      }
    });
  }
}
