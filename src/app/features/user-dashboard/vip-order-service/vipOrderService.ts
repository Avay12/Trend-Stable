import { Component, computed, inject, signal, effect } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ProviderServices } from '../../../core/services/provider.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { OrderService } from '../../../core/services/order.service';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { Order } from '../../../shared/models/order.model';

interface Category {
  id: string;
  name: string;
  icon: string;
  color?: string;
}

@Component({
  selector: 'app-vipOrderService',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, DecimalPipe],
  templateUrl: './vipOrderService.html',
  styleUrl: './vipOrderService.css'
})
export class VipOrderService {
  providerService = inject(ProviderServices);
  currencyService = inject(CurrencyService);
  orderService = inject(OrderService);
  toastrService = inject(ToastrService);
  sanitizer = inject(DomSanitizer);

  authService = inject(AuthService); // Inject AuthService
  cartService = inject(CartService);
  
  // UI State
  activeCategory = signal<string>('everything');
  orderType = signal<'new' | 'favorites'>('new');
  isLoadingServices = signal(false);
  selectedCategory = 'All Platforms';
  isCategoryDropdownOpen = signal(false);
  loading = signal(false);

  // Order Success Display State
  createdOrder = signal<Order | null>(null);
  
  // Form State
  formSelectedCategory = signal<string>('');
  selectedServiceId = signal<number | null>(null);
  link = signal<string>('');
  quantity = signal<number | null>(null);

  // Computed: Unique categories from the fetched services
  uniqueFormCategories = computed(() => {
    const services = this.providerService.services()?.data || [];
    // Replace "More Than Panel" with "SmmStable" in category names
    const categories = new Set(services.map(s => s.category.replace(/(More\s*Than\s*Panel|More\s*Than|MTP)/gi, 'SmmStable')));
    
    return Array.from(categories).sort((a, b) => {
      const aTrimmed = a.trim();
      const bTrimmed = b.trim();
      
      // 1. Primary Sort: Text (No Icon) vs Icon (Emoji/Symbol)
      // Strictly check if starts with alphanumeric char (A-Z, 0-9)
      // This forces "TikTok..." (Text) to be above "🔵 TikTok..." (Icon)
      const aIsText = /^[a-z0-9]/i.test(aTrimmed);
      const bIsText = /^[a-z0-9]/i.test(bTrimmed);
      
      if (aIsText && !bIsText) return -1;
      if (!aIsText && bIsText) return 1;

      // 2. Secondary Sort: Platform Tier Priority
      // SmmStable > TikTok > Facebook > Instagram > Others
      const getTier = (str: string) => {
        const lower = str.toLowerCase();
        if (lower.includes('smmstable')) return 0;
        if (lower.includes('tiktok')) return 1;
        if (lower.includes('facebook')) return 2;
        if (lower.includes('instagram')) return 3;
        return 4;
      };
      
      const tierA = getTier(a);
      const tierB = getTier(b);
      
      if (tierA !== tierB) return tierA - tierB;
      
      // 3. Tertiary Sort: Starts with Platform Name?
      // If both are same tier (e.g. TikTok), prioritize "TikTok..." over "Best TikTok..."
      const getPlatformStartScore = (str: string, tier: number) => {
        const lower = str.toLowerCase();
        if (tier === 1 && lower.startsWith('tiktok')) return 1;
        if (tier === 2 && lower.startsWith('facebook')) return 1;
        if (tier === 3 && lower.startsWith('instagram')) return 1;
        return 0; 
      };

      const scoreA = getPlatformStartScore(aTrimmed, tierA);
      const scoreB = getPlatformStartScore(bTrimmed, tierB);

      if (scoreA !== scoreB) return scoreB - scoreA; // Higher score first
      
      // 4. Quaternary Sort: Alphabetical
      return a.localeCompare(b);
    });
  });

  // Computed: Filter services based on form selected category
  filteredServices = computed(() => {
    let services = this.providerService.services()?.data || [];
    const category = this.formSelectedCategory();
    
    if (category) {
      services = services.filter(s => s.category.replace(/(More\s*Than\s*Panel|More\s*Than|MTP)/gi, 'SmmStable') === category);
    }
    
    // Sort to prioritize TikTok services
    return [...services].sort((a, b) => {
      const aIsTikTok = a.name.toLowerCase().includes('tiktok') || a.category.toLowerCase().includes('tiktok');
      const bIsTikTok = b.name.toLowerCase().includes('tiktok') || b.category.toLowerCase().includes('tiktok');
      
      if (aIsTikTok && !bIsTikTok) return -1;
      if (!aIsTikTok && bIsTikTok) return 1;
      return 0; // Maintain original order otherwise
    });
  });

  selectedService = computed(() => {
    const id = this.selectedServiceId();
    if (!id) return undefined;
    return this.providerService.services()?.data.find(s => s.service == id);
  });



  totalCharge = computed(() => {
    const qty = this.quantity();
    const service = this.selectedService();
    if (!qty || !service) return 0;
    return (service.rate * qty) / 1000;
  });

  // Check if balance is insufficient
  insufficientBalance = computed(() => {
    const total = this.totalCharge();
    const balance = this.authService.currentUser()?.balance || 0;
    return total > balance;
  });

  // Calculate amount validation needed
  balanceNeeded = computed(() => {
    const total = this.totalCharge();
    const balance = this.authService.currentUser()?.balance || 0;
    return Math.max(0, total - balance);
  });

  // Static Categories for the top scroller
  categories = signal<Category[]>([
    { id: 'everything', name: 'All', icon: 'dots-horizontal', color: '#00D1FF' },
    { id: 'instagram', name: 'Instagram', icon: 'instagram', color: '#C13584' },
    { id: 'tiktok', name: 'TikTok', icon: 'tiktok', color: '#00F2EA' },
    { id: 'youtube', name: 'YouTube', icon: 'youtube', color: '#FF0000' },
    { id: 'facebook', name: 'Facebook', icon: 'facebook', color: '#1877F2' },
    { id: 'twitter', name: 'X (Twitter)', icon: 'twitter', color: '#FFFFFF' }, // White X
    { id: 'spotify', name: 'Spotify', icon: 'spotify', color: '#1DB954' },
    { id: 'telegram', name: 'Telegram', icon: 'telegram', color: '#0088CC' },
    { id: 'twitch', name: 'Twitch', icon: 'twitch', color: '#9146FF' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin', color: '#0A66C2' },
    { id: 'discord', name: 'Discord', icon: 'discord', color: '#5865F2' },
    { id: 'snapchat', name: 'Snapchat', icon: 'snapchat', color: '#FFFC00' },
    { id: 'pinterest', name: 'Pinterest', icon: 'pinterest', color: '#BD081C' },
    { id: 'reddit', name: 'Reddit', icon: 'reddit', color: '#FF4500' },
    { id: 'kick', name: 'Kick', icon: 'kick', color: '#53FC18' }
  ]);

  // Store all services separately for counting
  allServices = signal<any[]>([]);

  // Computed: Get counts for each category
  categoryCounts = computed(() => {
    const services = this.allServices();
    const counts: Record<string, number> = {};
    
    // Initialize with 0
    this.categories().forEach(cat => counts[cat.id] = 0);
    counts['everything'] = services.length;

    services.forEach(service => {
      const catName = service.category.toLowerCase();
      const name = service.name.toLowerCase();
      
      this.categories().forEach(cat => {
        if (cat.id !== 'everything') {
           if (catName.includes(cat.id) || name.includes(cat.id)) {
             counts[cat.id] = (counts[cat.id] || 0) + 1;
           }
        }
      });
    });

    return counts;
  });

   bestSelling = signal([
    { name: 'YouTube Subscribers | No Refill | 10-50K/Day | Max 1M | Instant Start | NEW', orders: 4084, rate: 91, type: 'Basic' },
    { name: 'Instagram Video Views | Lifetime Guaranteed | Speed: 5-50K/Day | Max 10M', orders: 6689, rate: 93, type: 'Elite' },
    { name: 'YouTube Real Likes | Lifetime Guaranteed | Speed 10-20K/Day | Max 150K', orders: 6652, rate: 93, type: 'Basic' },
    { name: 'X/Twitter Followers | No Refill | Speed 1-5K/Day | Max 10K', orders: 3517, rate: 93, type: 'Basic' },
    { name: 'Telegram Channel/Group Members | Start: 0-15/Minutes | Speed 5-10K/Day', orders: 6298, rate: 87, type: 'Medium' },
    { name: 'TikTok Video Views | Lifetime Guaranteed | 1-5M/Day | Max 10M', orders: 4795, rate: 97, type: 'Elite' },
    { name: 'US Instagram Followers | USA | Speed 500-1K/Day | Max 40K', orders: 1618, rate: 87, type: 'Medium' }
  ]);

  constructor() {
    this.loadServices();
    
    // Auto-select first service when filtered services change
    effect(() => {
      const services = this.filteredServices();
      if (services.length > 0) {
        this.selectedServiceId.set(services[0].service);
      } else {
        this.selectedServiceId.set(null);
      }
    }, { allowSignalWrites: true });
  }

  loadServices() {
    this.isLoadingServices.set(true);
    const platform =
      this.selectedCategory === 'All Platforms' ? '' : this.selectedCategory.toLowerCase();
    
    this.providerService.getVipServices(platform).subscribe({
      next: (services) => {
        console.log(services);
        this.providerService.services.set(services);
        
        // If we fetched everything, update allServices for counting
        if (platform === '') {
           this.allServices.set(services.data);
        } else if (this.allServices().length === 0) {
           // If we fetched a specific platform but don't have allServices, 
           // we might want to fetch all in background or just live with it.
           // For now, let's trigger a separate fetch for all services if needed,
           // or just assume we start with 'everything' usually.
           this.providerService.getServices('').subscribe(all => {
             this.allServices.set(all.data);
           });
        }

        this.isLoadingServices.set(false);
      },
      error: () => this.isLoadingServices.set(false)
    });
  }

  selectTopCategory(category: Category) {
    this.activeCategory.set(category.id);
    // Logic to filter services based on top category could go here if separate from form category
    // For now we just load everything or specific platform
    this.isLoadingServices.set(true);
    const platform = category.id === 'everything' ? '' : category.id;
    this.providerService.getVipServices(platform).subscribe(services => {
      this.providerService.services.set(services);
      this.isLoadingServices.set(false);
      // Reset form category when switching top platform
      this.formSelectedCategory.set(''); 

      // Scroll to order form on mobile
      setTimeout(() => {
        if (window.innerWidth < 1024) { // Mobile and Tablet
          const element = document.getElementById('order-form-container');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 100);
    });
  }

  setOrderType(type: 'new' | 'favorites') {
    this.orderType.set(type);
  }

  toggleCategoryDropdown() {
    this.isCategoryDropdownOpen.update(v => !v);
  }

  selectFormCategory(category: string) {
    this.formSelectedCategory.set(category);
    this.isCategoryDropdownOpen.set(false);
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'Basic': return 'bg-yellow-400';
      case 'Medium': return 'bg-green-400';
      case 'Elite': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  }

  readonly PLATFORM_ICONS: { [key: string]: string } = {
    tiktok: `<div class="w-6 h-6 rounded bg-black flex items-center justify-center shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 448 512" fill="white">
        <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
      </svg>
    </div>`,

    instagram: `<div class="w-6 h-6 rounded flex items-center justify-center shrink-0" style="background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%);">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
    </div>`,

    facebook: `<div class="w-6 h-6 rounded bg-[#1877F2] flex items-center justify-center shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 320 512" fill="white">
        <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
      </svg>
    </div>`,

    youtube: `<div class="w-6 h-6 rounded bg-[#FF0000] flex items-center justify-center shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 576 512" fill="white">
        <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"/>
      </svg>
    </div>`,

    twitter: `<div class="w-6 h-6 rounded bg-black flex items-center justify-center shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="white">
        <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/>
      </svg>
    </div>`,

    linkedin: `<div class="w-6 h-6 rounded bg-[#0A66C2] flex items-center justify-center shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 448 512" fill="white">
        <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"/>
      </svg>
    </div>`,

    telegram: `<div class="w-6 h-6 rounded bg-[#26A5E4] flex items-center justify-center shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 496 512" fill="white">
        <path d="M248 8C111 8 0 119 0 256S111 504 248 504 496 393 496 256 385 8 248 8zM363 176.7c-3.7 39.2-19.9 134.4-28.1 178.3-3.5 18.6-10.3 24.8-16.9 25.4-14.4 1.3-25.3-9.5-39.3-18.7-21.8-14.3-34.2-23.2-55.3-37.2-24.5-16.1-8.6-25 5.3-39.5 3.7-3.8 67.1-61.5 68.3-66.7 .2-.7 .3-3.1-1.2-4.4s-3.6-.8-5.1-.5q-3.3 .7-104.6 69.1-14.8 10.2-26.9 9.9c-8.9-.2-25.9-5-38.6-9.1-15.5-5-27.9-7.7-26.8-16.3q.8-6.7 18.5-13.7 108.4-47.2 144.6-62.3c68.9-28.6 83.2-33.6 92.5-33.8 2.1 0 6.6 .5 9.6 2.9a10.5 10.5 0 0 1 3.5 6.7A43.8 43.8 0 0 1 363 176.7z"/>
      </svg>
    </div>`,

    twitch: `<div class="w-6 h-6 rounded bg-[#9146FF] flex items-center justify-center shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="white">
        <path d="M391.17,103.47H352.54v109.7h38.63ZM285,103H246.37V212.75H285ZM120.83,0,24.31,91.42V420.58H140.14V512l96.53-91.42h77.25L487.69,256V0ZM449.07,237.75l-77.22,73.12H294.61l-67.6,64v-64H140.14V36.58H449.07Z"/>
      </svg>
    </div>`,

    kick: `<div class="w-6 h-6 rounded bg-[#53FC18] flex items-center justify-center shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="black">
        <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l7.6 3.8L12 11.78 4.4 7.98 12 4.18zM4 9.48l7 3.5v7.04l-7-3.5V9.48zm16 0v7.04l-7 3.5v-7.04l7-3.5z"/>
      </svg>
    </div>`,

    snapchat: `<div class="w-6 h-6 rounded bg-[#FFFC00] flex items-center justify-center shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 448 512" fill="black">
        <path d="M233.2 406.5c-40.6 0-38.2 21.6-67.4 21.6-13.6 0-22.3-13.5-59.6-32.5-35-17.8-19.4-44.1 6.3-51.2 16.5-4.5 35.5 2.1 43.1-2.9 8.2-5.4 3-21.7 1.4-23.9-3.3-4.5-9.2-9.2-11.7-22.7-1.4-7.4 4.5-22.1 4.5-22.1s-10.3-26.6-16-36.9c-10.7-19.1-1.7-77.9 33.6-96 25-12.8 56.4-15 88-1.5 5.9 2.5 33.1 14.8 41.5 45.4 6 21.8 1.1 41.9-4.5 53.5-3.3 6.9-10.2 18.5-10.2 18.5s6.2 14.4 4.7 19.3c-2.8 9.3-15.5 12.8-15.3 22.8.2 6.6 4.7 18.1 14.7 25.4 20.3 14.7 34.6 2.3 56.9 14.7 14.6 8.2 3.1 36.8-6.1 41.9-34.5 19.1-41.9 30.2-56.9 30.2-22.7 0-21.1-21.6-60.6-21.6-28.7 0-28.3 18-9.4 39.4 13.5 15.3 47.9 21.4 75 19.1 53.2-4.5 73.1-40.6 77.2-47.5 7.6-13 18.1-13.8 23.9-12.4 15.2 3.6 15.6 19.5 7.4 32.3-9.5 14.9-52.7 61-125.7 65.6-47.6 3-81.5-12-100.9-24.3-19.6-12.4-17-30-17-30s-10 22.3-45 39c-23.7 11.3-46.1 10-53 8.3-9.3-2.3-17.7-11.1-13-23.2 2.8-7.3 11.3-13.2 23.2-16.1 27.5-6.6 59.9-13.5 68.3-25.1 5.9-8.1 3.5-20.9-12.7-20.9z"/>
      </svg>
    </div>`,

    spotify: `<div class="w-6 h-6 rounded bg-[#1DB954] flex items-center justify-center shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 496 512" fill="white">
        <path d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm113.6 365.4c-4.6 7.6-14.4 10-22 5.4-60.2-36.8-136.1-45.1-225.6-24.6-8.7 2-17.4-3.4-19.4-12.1-2-8.7 3.4-17.4 12.1-19.4 97.9-22.4 182.5-12.7 251.5 29.4 7.6 4.6 10 14.4 5.4 22zm31.4-69.8c-5.8 9.4-18.1 12.3-27.5 6.5-68.9-42.4-173.9-54.7-255.1-30-10.6 3.2-21.8-2.8-25-13.4-3.2-10.6 2.8-21.8 13.4-25 92.7-28.1 207.9-14.5 287.1 34.4 9.4 5.8 12.3 18.1 6.5 27.5zm2.7-72.7c-82.6-49-219.1-53.5-298-29.5-12.7 3.9-26.1-3.3-30-16-3.9-12.7 3.3-26.1 16-30 90.6-27.5 241.2-22.2 336.6 33.6 11.6 6.9 15.4 21.9 8.5 33.5-6.9 11.6-21.9 15.4-33.5 8.5z"/>
      </svg>
    </div>`,

    soundcloud: `<div class="w-6 h-6 rounded bg-[#FF5500] flex items-center justify-center shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 640 512" fill="white">
        <path d="M111.4 256.3c-25.7 0-46.6 20.9-46.6 46.7 0 7.7 2 15 5.4 21.4l1.2 2.2-2.5.1c-38.3 1.2-68.9 33-68.9 71.4 0 39.7 32.2 71.9 71.9 71.9 1.9 0 3.8-.1 5.6-.2l4-.3V258.8c0-1.4-.4-2.5-.5-2.5zm268.3 10c0-1.1-.9-2-2-2-.6 0-1.2.3-1.6.7l-.1.1c-1.3 1.3-4.5 4.3-9.5 9-10 9.4-23.7 21.9-40.4 34.1-33.4 24.3-73.6 42.1-104.9 44.5l-6.2.5V469h134.1c43.1 0 81.3-21.8 104.4-55.2 13.9-20.1 22.2-44.5 22.2-70.9 0-42.3-34.3-76.6-76.6-76.6zM503 226.7c-.5-.1-.9-.1-1.4-.1-2.9 0-5.6.7-8.1 1.7l-.4.2-12.4 5.3c-2.1.8-4.4 1.3-6.7 1.3-2.3 0-4.6-.5-6.7-1.3l-12.4-5.3c-2.5-1-5.2-1.7-8.1-1.7-.5 0-.9 0-1.4.1-10.2 1.4-18.1 10.2-18.1 20.8v10.6c0 11.6 9.4 21 21 21s21-9.4 21-21v-10.6c0-1.7-.3-3.3-.9-4.8l12.4 5.3c1.7.7 3.6 1.1 5.5 1.1s3.8-.4 5.5-1.1l12.4-5.3c-.6 1.5-.9 3.1-.9 4.8v10.6c0 11.6 9.4 21 21 21s21-9.4 21-21v-10.6c0-10.6-7.9-19.4-18.1-20.8z"/>
        <path d="M576.4 226.7c-.5-.1-.9-.1-1.4-.1-2.9 0-5.6.7-8.1 1.7l-.4.2-12.4 5.3c-2.1.8-4.4 1.3-6.7 1.3-2.3 0-4.6-.5-6.7-1.3l-12.4-5.3c-2.5-1-5.2-1.7-8.1-1.7-.5 0-.9 0-1.4.1-10.2 1.4-18.1 10.2-18.1 20.8v10.6c0 11.6 9.4 21 21 21s21-9.4 21-21v-10.6c0-1.7-.3-3.3-.9-4.8l12.4 5.3c1.7.7 3.6 1.1 5.5 1.1s3.8-.4 5.5-1.1l12.4-5.3c-.6 1.5-.9 3.1-.9 4.8v10.6c0 11.6 9.4 21 21 21s21-9.4 21-21v-10.6c0-10.6-7.9-19.4-18.1-20.8z"/>
      </svg>
    </div>`,

    deezer: `<div class="w-6 h-6 rounded bg-black flex items-center justify-center shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="white">
        <path d="M77.4 340.4h42.1V229.7H77.4v110.7zM7.4 340.4h42.1V229.7H7.4v110.7zM147.4 340.4h42.1V180.7h-42.1v159.7zM217.4 340.4h42.1V120.7h-42.1v219.7zM287.4 340.4h42.1V59.7h-42.1v280.7zM357.4 340.4h42.1V180.7h-42.1v159.7zM427.4 340.4h42.1V265.7h-42.1v74.7z"/>
      </svg>
    </div>`,

    applemusic: `<div class="w-6 h-6 rounded bg-[#FA243C] flex items-center justify-center shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="white">
        <path d="M410.6 153.2c-29.2-2.3-54.8 17.5-66.7 41.5-15.1-3.6-24-3.5-24-3.5-31.4-1.2-55 22.3-55 22.3s-26.6-22.3-58.4-23.9c-27.1-1.3-58.9 15.1-70 41.2-8.2 19.3-5.3 47.7 2.1 63.6 12.8 27.6 44.2 92.5 83.1 92.5 35.7 0 25.1-24.3 64-24.3 36.5 0 27.2 24.3 62.7 24.3 32.3 0 69.2-64.4 83.1-92.5 12.6-25.5 11.2-62.7-4.1-84.5-9.3-13.3-25.2-22.1-42.1-26.8 5.7-27.1 27.2-41 38.8-46.7-4.1-8.5-40-19.1-81.8 16.8z"/>
      </svg>
    </div>`,

    audiomack: `<div class="w-6 h-6 rounded bg-[#FFA200] flex items-center justify-center shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white">
        <path d="M8.29 4.67C6.06 6.55 4.61 9.32 4.61 12.44s1.45 5.89 3.68 7.77c.2.16.29.41.22.65-.07.24-.27.42-.51.46-.24.04-.49-.04-.65-.22-2.43-2.05-4.01-5.07-4.01-8.66s1.58-6.61 4.01-8.66c.16-.18.41-.26.65-.22.24.04.44.22.51.46.07.24-.02.49-.22.65zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18.25c-4.56 0-8.25-3.69-8.25-8.25S7.44 3.75 12 3.75 20.25 7.44 20.25 12 16.56 20.25 12 20.25z"/>
      </svg>
    </div>`,
  };

  getPlatformIcon(name: string): SafeHtml {
    const match = name.match(
      /\b(Instagram|Facebook|TikTok|YouTube|Telegram|Twitter|Linkedin|Twitch|Kick|Snapchat|Spotify|SoundCloud|Deezer|Apple)\b/i,
    );
    let platform = match ? match[0].toLowerCase() : '';
    if (platform === 'apple') platform = 'applemusic';
    
    const iconHtml = this.PLATFORM_ICONS[platform];
    
    if (iconHtml) {
        return this.sanitizer.bypassSecurityTrustHtml(iconHtml);
    }
    
    // Default fallback icon
    return this.sanitizer.bypassSecurityTrustHtml(`<div class="w-6 h-6 rounded bg-muted flex items-center justify-center shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" x2="12" y1="8" y2="16"></line>
        <line x1="8" x2="16" y1="12" y2="12"></line>
      </svg>
    </div>`);
  }

   onConfirm() {
    this.loading.set(true);
    this.orderService
      .createMediumOrder({
        serviceId: this.selectedService()!.service,
        quantity: this.quantity()!,
        link: this.link(),
      })
      .subscribe({
        next: (order) => {
          this.toastrService.success('Order Created');
          
           // Construct the full order object form local state + API response (ID)
           const fullOrder: any = {
            id: order.id,
            serviceId: String(this.selectedService()?.service),
            serviceName: this.selectedService()?.name,
            link: this.link(),
            quantity: this.quantity()!,
            charge: this.totalCharge(),
            status: 'Pending',
            createdAt: new Date().toISOString()
          };

          this.createdOrder.set(fullOrder);
          this.loading.set(false);
        },
        error: (error) => {
          this.toastrService.error(error.message);
          console.error('Error creating order:', error);
          this.loading.set(false);
        },
      });
  }

  closeSuccessModal() {
    this.createdOrder.set(null);
    // Reset form
    this.link.set('');
    this.quantity.set(null);
  }



  addToCart() {
    const service = this.selectedService();
    const qty = this.quantity();
    
    if (!service || !qty) {
       this.toastrService.error('Please select a service and quantity');
       return;
    }

    // Extract platform from service name or category
    const match = service.name.match(
      /\b(Instagram|Facebook|TikTok|YouTube|Telegram|Twitter|Linkedin|Twitch|Kick)\b/i,
    ) || service.category.match(
      /\b(Instagram|Facebook|TikTok|YouTube|Telegram|Twitter|Linkedin|Twitch|Kick)\b/i,
    );
    const platform = match ? match[0] : 'Unknown';

    this.cartService.addItem({
      serviceId: service.service,
      serviceName: service.name,
      platform: platform,
      category: service.category,
      rate: service.rate,
      min: Number(service.min),
      max: Number(service.max),
      quantity: qty,
    });
    
    this.toastrService.success('Added to cart');
  }

  searchQuery = signal<string>('');

  onSearch(query: string) {
    this.searchQuery.set(query);
    if (!query) return;

    // Check if query is a Service ID (numeric)
    const serviceId = Number(query);
    if (!isNaN(serviceId) && serviceId > 0) {
      const allServices = this.providerService.services()?.data || [];
      const foundService = allServices.find(s => s.service == serviceId);
      
      if (foundService) {
        // If found, switch category first, then select service
        this.formSelectedCategory.set(foundService.category.replace(/(More\s*Than\s*Panel|More\s*Than|MTP)/gi, 'SmmStable'));
        
        // Use setTimeout to ensure category change propagates before setting service
        setTimeout(() => {
          this.selectedServiceId.set(foundService.service);
        });
        return;
      }
    }

    // If not a service ID or service not found, try to match Category
    const categories = this.uniqueFormCategories();
    const foundCategory = categories.find(c => c.toLowerCase().includes(query.toLowerCase()));
    
    if (foundCategory) {
      this.formSelectedCategory.set(foundCategory);
    }
  }

  formatTime(minutes: number | undefined): string {
    if (!minutes) return 'N/A';
    
    // Just in case it's a string from API
    const mins = Number(minutes);
    if (isNaN(mins)) return String(minutes);

    const hours = Math.floor(mins / 60);
    const remainingMinutes = mins % 60;

    if (hours > 0) {
      return `${hours} hours ${remainingMinutes} minutes`;
    }
    return `${remainingMinutes} minutes`;
  }

}
