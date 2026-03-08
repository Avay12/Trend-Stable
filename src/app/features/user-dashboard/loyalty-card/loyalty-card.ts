import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { CurrencyService } from '../../../core/services/currency.service';

@Component({
  selector: 'app-loyalty-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loyalty-card.html',
  styleUrl: './loyalty-card.css',
})
export class LoyaltyCard {
  authService = inject(AuthService);
  currencyService = inject(CurrencyService);

  // Tier Thresholds
  private readonly thresholds = {
    silver: 35,
    gold: 139,
    platinum: 346
  };

  tierStats = computed(() => {
    const user = this.authService.currentUser();
    // Use balance as requested by user
    const totalDeposited = user?.balance || 0;
    const loyalty = user?.loyalty?.toLowerCase() || 'bronze';

    let nextTierName = '';
    let nextTierAmount = 0;
    let progress = 0;
    let currentTierName = 'Bronze';
    let currentTierColor = 'text-amber-600';
    let currentTierGradient = 'from-amber-600 via-amber-500 to-yellow-600';
    let currentTierIcon = 'award';

    // Determine current tier styling
    switch (loyalty) {
      case 'platinum':
        currentTierName = 'Platinum';
        currentTierColor = 'text-cyan-400';
        currentTierGradient = 'from-cyan-400 via-blue-400 to-purple-500';
        currentTierIcon = 'gem';
        break;
      case 'gold':
        currentTierName = 'Gold';
        currentTierColor = 'text-yellow-500';
        currentTierGradient = 'from-yellow-400 via-amber-400 to-orange-500';
        currentTierIcon = 'crown';
        break;
      case 'silver':
        currentTierName = 'Silver';
        currentTierColor = 'text-slate-400';
        currentTierGradient = 'from-slate-400 via-gray-300 to-slate-500';
        currentTierIcon = 'star';
        break;
      default: // bronze
        currentTierName = 'Bronze';
        currentTierColor = 'text-amber-600';
        currentTierGradient = 'from-amber-600 via-amber-500 to-yellow-600';
        currentTierIcon = 'award';
        break;
    }

    // Determine next tier and progress based on CURRENT assigned tier
    switch (loyalty) {
      case 'platinum':
        nextTierName = 'Max Tier';
        nextTierAmount = totalDeposited;
        progress = 100;
        break;
      case 'gold':
        nextTierName = 'Platinum';
        nextTierAmount = this.thresholds.platinum;
        // Progress within Gold -> Platinum range
        // If balance < gold threshold (manual upgrade), progress is 0
        progress = ((totalDeposited - this.thresholds.gold) / (this.thresholds.platinum - this.thresholds.gold)) * 100;
        break;
      case 'silver':
        nextTierName = 'Gold';
        nextTierAmount = this.thresholds.gold;
        // Progress within Silver -> Gold range
        progress = ((totalDeposited - this.thresholds.silver) / (this.thresholds.gold - this.thresholds.silver)) * 100;
        break;
      default: // bronze
        nextTierName = 'Silver';
        nextTierAmount = this.thresholds.silver;
        // Progress within Bronze -> Silver range
        progress = (totalDeposited / this.thresholds.silver) * 100;
        break;
    }

    // Clamp progress between 0 and 100
    progress = Math.max(0, Math.min(100, progress));

    const remainingAmount = Math.max(0, nextTierAmount - totalDeposited);

    return {
      currentTierName,
      currentTierColor,
      currentTierGradient,
      currentTierIcon,
      nextTierName,
      nextTierAmount,
      progress,
      remainingAmount,
      totalDeposited
    };
  });
}
