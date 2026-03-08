import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-margin',
  imports: [CommonModule, FormsModule],
  templateUrl: './margin.html',
  styleUrl: './margin.css'
})
export class MarginComponent implements OnInit {
  adminService = inject(AdminService);
  toastr = inject(ToastrService);
  currencyService = inject(CurrencyService);

  currentMargin = signal<number>(1.8);
  profitPercentage = signal<string>('80.0');
  stats = signal<any>(null);
  
  newMargin = signal<number>(1.8);
  isUpdating = signal<boolean>(false);

  // Revenue filters
  revenueData = signal<any>(null);
  selectedPeriod = signal<'day' | 'week' | 'month' | 'custom'>('day');
  revStartDate = signal<string>('');
  revEndDate = signal<string>('');

  // Margin filters
  marginStartDate = signal<string>('');
  marginEndDate = signal<string>('');

  ngOnInit() {
    this.loadMarginData();
    this.loadRevenueData();
  }

  loadMarginData() {
    this.adminService.getMarginConfig(this.marginStartDate(), this.marginEndDate()).subscribe({
      next: (res: any) => {
        if (res) {
          this.currentMargin.set(res.currentMargin);
          this.profitPercentage.set(res.profitPercentage);
          this.stats.set(res.stats);
          
          this.newMargin.set(res.currentMargin);
        }
      },
      error: (err: any) => {
        this.toastr.error('Failed to load margin configuration');
        console.error(err);
      }
    });
  }

  updateMargin() {
    if (this.newMargin() < 1 || this.newMargin() > 10) {
      this.toastr.warning('Margin must be between 1 and 10');
      return;
    }

    this.isUpdating.set(true);
    this.adminService.updateGlobalMargin(this.newMargin()).subscribe({
      next: (res: any) => {
        this.toastr.success('Margin updated successfully');
        this.loadMarginData(); // reload
        this.isUpdating.set(false);
      },
      error: (err: any) => {
        this.toastr.error('Failed to update margin');
        console.error(err);
        this.isUpdating.set(false);
      }
    });
  }

  onMarginDateChange() {
     if (this.marginStartDate() && this.marginEndDate()) {
         this.loadMarginData();
     } else if (!this.marginStartDate() && !this.marginEndDate()) {
         this.loadMarginData();
     }
  }

  loadRevenueData() {
    this.adminService.getRevenueAnalytics(this.selectedPeriod(), this.revStartDate(), this.revEndDate()).subscribe({
      next: (res: any) => {
        this.revenueData.set(res);
      },
      error: (err: any) => {
        this.toastr.error('Failed to load revenue analytics');
        console.error(err);
      }
    });
  }

  changePeriod(period: 'day' | 'week' | 'month' | 'custom') {
    this.selectedPeriod.set(period);
    if (period !== 'custom') {
      this.revStartDate.set('');
      this.revEndDate.set('');
    }
    this.loadRevenueData();
  }

  onRevDateChange() {
    if (this.selectedPeriod() === 'custom') {
      if (this.revStartDate() && this.revEndDate()) {
         this.loadRevenueData();
      }
    }
  }
}

