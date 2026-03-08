import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PromotionsService } from '../../../core/services/promotions.service';
import { PromoCode, Headline } from '../../../shared/models/promotion.model';

@Component({
  selector: 'app-marketing',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './marketing.html'
})
export class MarketingComponent implements OnInit {
  promotionsService = inject(PromotionsService);
  toastr = inject(ToastrService);
  fb = inject(FormBuilder);

  activeTab = signal<'promocode' | 'headline'>('promocode');

  promoCodes = signal<PromoCode[]>([]);
  headlines = signal<Headline[]>([]);
  isLoading = signal(true);
  isSubmitting = signal(false);

  promoForm: FormGroup;
  headlineForm: FormGroup;

  constructor() {
    this.promoForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(3)]],
      bonusPercentage: [0, [Validators.required, Validators.min(1), Validators.max(100)]]
    });

    this.headlineForm = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    if (this.activeTab() === 'promocode') {
      this.loadPromoCodes();
    } else {
      this.loadHeadlines();
    }
  }

  switchTab(tab: 'promocode' | 'headline') {
    this.activeTab.set(tab);
    this.loadData();
  }

  loadPromoCodes() {
    this.promotionsService.getAllPromoCodes().subscribe({
      next: (res: any) => {
        this.promoCodes.set(res);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.toastr.error('Failed to load promo codes');
        this.isLoading.set(false);
      }
    });
  }

  loadHeadlines() {
    this.promotionsService.getAllHeadlines().subscribe({
      next: (res: any) => {
        this.headlines.set(res);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.toastr.error('Failed to load headlines');
        this.isLoading.set(false);
      }
    });
  }

  createPromoCode() {
    if (this.promoForm.invalid) {
      this.toastr.error('Please fill all fields correctly');
      return;
    }
    this.isSubmitting.set(true);
    const { code, bonusPercentage } = this.promoForm.value;
    this.promotionsService.createPromoCode(code, bonusPercentage).subscribe({
      next: () => {
        this.toastr.success('Promo code created successfully');
        this.promoForm.reset({ bonusPercentage: 0 });
        this.loadPromoCodes();
        this.isSubmitting.set(false);
      },
      error: (err: any) => {
        this.toastr.error(err.error?.message || 'Failed to create promo code');
        this.isSubmitting.set(false);
      }
    });
  }

  createHeadline() {
    if (this.headlineForm.invalid) {
      this.toastr.error('Please enter headline text');
      return;
    }
    this.isSubmitting.set(true);
    const { text } = this.headlineForm.value;
    this.promotionsService.createHeadline(text).subscribe({
      next: () => {
        this.toastr.success('Headline created successfully');
        this.headlineForm.reset();
        this.loadHeadlines();
        this.isSubmitting.set(false);
      },
      error: (err: any) => {
        this.toastr.error(err.error?.message || 'Failed to create headline');
        this.isSubmitting.set(false);
      }
    });
  }

  togglePromoStatus(id: string, currentStatus: boolean) {
    this.promotionsService.setPromoCodeStatus(id, !currentStatus).subscribe({
      next: () => {
        this.toastr.success('Status updated');
        this.loadPromoCodes();
      },
      error: (err: any) => this.toastr.error('Failed to update status')
    });
  }

  toggleHeadlineStatus(id: string, currentStatus: boolean) {
    this.promotionsService.setHeadlineStatus(id, !currentStatus).subscribe({
      next: () => {
        this.toastr.success('Status updated');
        this.loadHeadlines();
      },
      error: (err: any) => this.toastr.error('Failed to update status')
    });
  }

  deletePromo(id: string) {
    if (!confirm('Are you sure you want to delete this promo code?')) return;
    this.promotionsService.deletePromoCode(id).subscribe({
      next: () => {
        this.toastr.success('Deleted successfully');
        this.loadPromoCodes();
      },
      error: (err: any) => this.toastr.error('Failed to delete')
    });
  }

  deleteHeadline(id: string) {
    if (!confirm('Are you sure you want to delete this headline?')) return;
    this.promotionsService.deleteHeadline(id).subscribe({
      next: () => {
        this.toastr.success('Deleted successfully');
        this.loadHeadlines();
      },
      error: (err: any) => this.toastr.error('Failed to delete')
    });
  }
}
