import { Component, OnInit, inject, signal } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ReferralService } from '../../../core/services/referral.service';
import { ReferralStats } from '../../../shared/models/refferal.model';

import { CurrencyService } from '../../../core/services/currency.service';

@Component({
  selector: 'app-referrals',
  imports: [CommonModule, FormsModule],
  templateUrl: './referrals.html',
  styleUrl: './referrals.css',
  animations: [
    trigger('fadeInUp', [
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      state('*', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', animate('600ms cubic-bezier(0.4, 0, 0.2, 1)'))
    ])
  ]
})
export class Referrals implements OnInit {
  referralService = inject(ReferralService);
  toastr = inject(ToastrService);
  currencyService = inject(CurrencyService);
 
  isLoading = signal(true);
  isApplying = signal(false);
  stats = signal<ReferralStats | null>(null);
  customCodeInput = signal('');

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading.set(true);
    this.referralService.getStats().subscribe({
      next: (res) => {
        this.stats.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading referral stats', err);
        this.toastr.error('Failed to load referral stats', 'Error');
        this.isLoading.set(false);
      }
    });
  }

  applyCode() {
    const code = this.customCodeInput().trim();
    if (!code) {
      this.toastr.warning('Please enter a referral code', 'Warning');
      return;
    }

    this.isApplying.set(true);
    this.referralService.applyCode(code).subscribe({
      next: (res) => {
        this.toastr.success(res.message || 'Referral code applied successfully');
        this.customCodeInput.set('');
        this.isApplying.set(false);
        this.loadStats();
      },
      error: (err) => {
        console.error('Error applying referral code', err);
        this.toastr.error(err.error?.message || 'Failed to apply referral code', 'Error');
        this.isApplying.set(false);
      }
    });
  }

  copyLink() {
    const code = this.stats()?.referralCode;
    if (code) {
      const link = `https://SmmStable.com/signup?ref=${code}`;
      navigator.clipboard.writeText(link).then(() => {
        this.toastr.success('Referral link copied to clipboard');
      }).catch(() => {
        this.toastr.error('Failed to copy link');
      });
    }
  }
}
