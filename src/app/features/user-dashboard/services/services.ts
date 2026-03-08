import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProviderServices } from '../../../core/services/provider.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CartService } from '../../../core/services/cart.service';
import { OrderModel } from '../../../shared/components/order-model/order-model';
import { FormsModule } from '@angular/forms';
import { CurrencyService } from '../../../core/services/currency.service';

interface Service {
  id: number;
  name: string;
  description: string;
  ratePerK: number;
  min: number;
  max: number;
  platform: string;
  iconGradient: string;
}

@Component({
  selector: 'app-services',
  imports: [CommonModule, FormsModule, OrderModel],
  templateUrl: './services.html',
  styleUrl: './services.css',
  animations: [
    trigger('fadeInUp', [
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      state('*', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', animate('600ms cubic-bezier(0.4, 0, 0.2, 1)')),
    ]),
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scaleY(0.95) translateY(-10px)' }),
        animate(
          '200ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 1, transform: 'scaleY(1) translateY(0)' }),
        ),
      ]),
      transition(':leave', [
        animate(
          '150ms cubic-bezier(0.4, 0, 1, 1)',
          style({ opacity: 0, transform: 'scaleY(0.95) translateY(-10px)' }),
        ),
      ]),
    ]),
  ],
})
export class Services implements OnInit {
  private sanitizer = inject(DomSanitizer);
  providerService = inject(ProviderServices);
  cartService = inject(CartService);
  currencyService = inject(CurrencyService);
  isDropdownOpen = false;
  selectedCategory = 'All Platforms';
  isLoadingServices = signal(true);
  isOrderModalOpen = signal(false);
  quantity = 0;
  readonly USD_TO_NPR = 145.74;

  // Pagination State
  currentPage = 1;
  limit = 20;
  totalPages = 0;
  totalItems = 0;

  currentOrderDetails = signal<{
    serviceId: number;
    category: string;
    title: string;
    quantity: number;
    pricePer1000: number;
    subtotal: number;
    total: number;
    unit: number;
    min: number;
    max: number;
    profileUrl: string;
  }>({
    serviceId: 0,
    title: '',
    category: '',
    quantity: this.quantity,
    pricePer1000: 0,
    subtotal: 0,
    unit: 0,
    min: 0,
    max: 0,
    total: 0,
    profileUrl: '',
  });

  categories = [
    {
      name: 'All Platforms',
      icon: 'globe',
      count: null,
    },
    {
      name: 'Instagram',
      icon: 'instagram',
      count: 300,
    },
    {
      name: 'TikTok',
      icon: 'tiktok',
      count: 151,
    },
    {
      name: 'YouTube',
      icon: 'youtube',
      count: 195,
    },
    {
      name: 'Twitter',
      icon: 'twitter',
      count: 115,
    },
    {
      name: 'Facebook',
      icon: 'facebook',
      count: 201,
    },
    {
      name: 'Twitch',
      icon: 'twitch',
      count: 39,
    },
    {
      name: 'Kick',
      icon: 'kick',
      count: 11,
    },
    {
      name: 'LinkedIn',
      icon: 'linkedin',
      count: 35,
    },
    {
      name: 'Telegram',
      icon: 'telegram',
      count: 94,
    },
  ];

  searchSubject = new Subject<string>();
  searchQuery = '';

  // Filtered services based on selected category
  get filteredServices() {
    const allServices = this.providerService.services()?.data || [];
    const startIndex = (this.currentPage - 1) * this.limit;
    return allServices.slice(startIndex, startIndex + this.limit);
  }

  loadServices() {
    this.isLoadingServices.set(true);
    const platform =
      this.selectedCategory === 'All Platforms' ? '' : this.selectedCategory.toLowerCase();
    
    // Always fetch "all" (large limit) for client-side sorting and pagination
    // primarily to support custom sorting order (TikTok > Facebook > Instagram)
    const limit = 2000;
    
    this.providerService.getPagination(1, limit, platform, this.searchQuery).subscribe((services) => {
      if (services && services.data) {
        // Name replacement logic
        services.data.forEach(service => {
          service.name = service.name
            .replace(/MTP/gi, 'TrendStable')
            .replace(/morethansmm/gi, 'TrendStable')
            .replace(/More\s*Than\s*Panel/gi, 'TrendStable')
            .replace(/More\s*Than/gi, 'TrendStable');
        });

        // Client-side filtering fallback (if backend filtering is insufficient or effectively "all")
        if (this.searchQuery) {
          const query = this.searchQuery.toLowerCase();
          services.data = services.data.filter(s => 
            s.service.toString().includes(query) || 
            s.name.toLowerCase().includes(query)
          );
        }

        // Custom Sort: TikTok > Facebook > Instagram > others
        // Apply this sort if "All Platforms" is selected OR even generally if desired, 
        // but user specifically asked for this order "when loaded".
        if (this.selectedCategory === 'All Platforms' || !this.searchQuery) {
          const platformPriority = ['tiktok', 'facebook', 'instagram'];
          const getPlatform = (name: string) => {
            const match = name.match(/\b(Instagram|Facebook|TikTok|YouTube|Telegram|Twitter|Linkedin|Twitch|Kick)\b/i);
            return match ? match[0].toLowerCase() : '';
          };

          services.data.sort((a, b) => {
            const pA = getPlatform(a.name);
            const pB = getPlatform(b.name);
            const idxA = platformPriority.indexOf(pA);
            const idxB = platformPriority.indexOf(pB);

            // If both are in priority list
            if (idxA !== -1 && idxB !== -1) {
              return idxA - idxB;
            }
            // If only A is in priority list -> A comes first
            if (idxA !== -1) return -1;
            // If only B is in priority list -> B comes first
            if (idxB !== -1) return 1;
            
            // Otherwise maintain relative order (or sort by ID/Name if desired)
             return 0;
          });
        }
      }
      
      this.providerService.services.set(services);
      
      if(services) {
         // Update pagination info based on the full dataset length
         this.totalItems = services.data ? services.data.length : 0;
         this.totalPages = Math.ceil(this.totalItems / this.limit);
         // Reset to page 1 on new load
         if (this.currentPage > this.totalPages) {
             this.currentPage = 1;
         }
      }

      this.isLoadingServices.set(false);
    });
  }

  onSearch(query: string) {
    this.searchSubject.next(query);
  }

  ngOnInit() {
    this.loadServices();
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery = query;
      this.currentPage = 1;
      this.loadServices();
    });
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      // No need to call loadServices(), we have all data client-side
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.onPageChange(this.currentPage + 1);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.onPageChange(this.currentPage - 1);
    }
  }
  
  onLimitChange(newLimit: number) {
      this.limit = newLimit;
      this.currentPage = 1; // Reset to first page
      this.loadServices();
  }



  openOrderModal(service: any) {
    const rate = parseFloat(service.rate);
    const min = parseInt(service.min);
    const initialTotal = (rate * this.quantity) / 1000;

    this.currentOrderDetails.set({
      serviceId: service.service,
      category: service.category || 'default',
      title: service.name,
      quantity: this.quantity,
      pricePer1000: rate,
      subtotal: initialTotal,
      total: initialTotal,
      min: min,
      max: service.max,
      unit: service.min,
      profileUrl: '',
    });

    this.isOrderModalOpen.set(true);
  }

  closeOrderModal() {
    this.isOrderModalOpen.set(false);
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  getQuantity(event: any) {
    this.quantity = parseInt(event.target.value);
  }

  selectCategory(category: any) {
    this.selectedCategory = category.name;
    this.isDropdownOpen = false;
    this.currentPage = 1; // Reset to page 1
    this.loadServices();
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  // Define this at the top of your component
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

  addToCart(service: any): void {
    // Extract platform from service name
    const match = service.name.match(
      /\b(Instagram|Facebook|TikTok|YouTube|Telegram|Twitter|Linkedin|Twitch|Kick)\b/i,
    );
    const platform = match ? match[0] : 'Unknown';

    this.cartService.addItem({
      serviceId: service.service,
      serviceName: service.name,
      platform: platform,
      category: service.category || 'default',
      rate: service.rate,
      min: service.min,
      max: service.max,
      quantity: service.min,
    });

    // Show toast notification
    this.showToast('Service added to cart');
  }

  showToast(message: string): void {
    // Create toast element
    const toast = document.createElement('div');
    toast.className =
      'fixed top-4 right-4 bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg z-50 animate-slide-in-right';
    toast.textContent = message;

    // Add to body
    document.body.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease-out';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
}
