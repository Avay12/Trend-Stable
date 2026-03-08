import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { AccountOrder, SellAccountorder } from '../../../shared/models/acoount-order.model';
import { AccountOrderService } from '../../../core/services/accountOrder.service';
import { CurrencyService } from '../../../core/services/currency.service';

@Component({
  selector: 'app-admin-market-accounts',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './market-accounts.html',
  styleUrl: './market-accounts.css',
})
export class AdminMarketAccounts implements OnInit {
  private accountOrderService = inject(AccountOrderService);
  currencyService = inject(CurrencyService);

  private fb = inject(FormBuilder);

  // Separate signals for buying and selling accounts
  buyAccounts = signal<AccountOrder[]>([]);
  sellAccounts = signal<SellAccountorder[]>([]);
  isLoading = signal(true);

  searchTerm = '';
  activeTab = signal<'Users Selling' | 'Admin Selling'>('Users Selling');
  showAddModal = signal(false);
  showEditModal = signal(false);

  // Reactive form for account creation/editing
  accountForm = this.fb.nonNullable.group({
    id: [''],
    platform: ['TikTok', Validators.required],
    username: ['', Validators.required],
    followers: [0, [Validators.required, Validators.min(0)]],
    price: [0, [Validators.required, Validators.min(0)]],
    type: ['Sell', Validators.required],
    description: ['', Validators.required],
  });

  ngOnInit() {
    this.loadBuyingAccounts();
    this.loadSellingAccounts();
  }

  loadBuyingAccounts() {
    this.accountOrderService.getAllAccountBuying(this.searchTerm, '').subscribe({
      next: (accounts) => {
        this.buyAccounts.set(accounts as any);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading buying accounts:', err);
        this.isLoading.set(false);
      },
    });
  }

  loadSellingAccounts() {
    this.accountOrderService.getAllAccountSelling(this.searchTerm, '').subscribe({
      next: (accounts) => {
        this.sellAccounts.set(accounts as any);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading selling accounts:', err);
        this.isLoading.set(false);
      },
    });
  }

  onSearch() {
    this.isLoading.set(true);
    if (this.activeTab() === 'Admin Selling') {
      this.loadBuyingAccounts();
    } else {
      this.loadSellingAccounts();
    }
  }

  setActiveTab(tab: 'Admin Selling' | 'Users Selling') {
    this.activeTab.set(tab);
  }

  openAddModal() {
    this.accountForm.reset({
      id: '',
      platform: 'TikTok',
      username: '',
      followers: 0,
      price: 0,
      type: 'Buy',
      description: '',
    });
    this.showAddModal.set(true);
  }

  openEditModal(account: any) {
    this.accountForm.patchValue({
      id: account.id,
      platform: account.platform,
      username: account.username,
      followers: account.followers,
      price: account.price,
      type: account.type,
      description: account.description,
    });
    this.showEditModal.set(true);
  }

  closeModals() {
    this.showAddModal.set(false);
    this.showEditModal.set(false);
    this.accountForm.reset();
  }

  saveAccount() {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();

      return;
    }

    const formValue = this.accountForm.getRawValue();

    if (this.showAddModal()) {
      // Create new account
      const createData = {
        platform: formValue.platform,
        username: formValue.username,
        type: formValue.type,
        price: formValue.price,
        followers: formValue.followers,
        description: formValue.description,
      };

      this.accountOrderService.createAccountOrder(createData).subscribe({
        next: () => {
          this.closeModals();
          // Reload the appropriate list
          if (formValue.type === 'Buy') {
            this.loadBuyingAccounts();
          } else {
            this.loadSellingAccounts();
          }
        },
        error: (err) => {
          console.error('Error creating account:', err);
        },
      });
    } else {
      // Update existing account
      const { id, ...updateData } = formValue;

      this.accountOrderService.updateOrderStatus(id, updateData as any).subscribe({
        next: () => {
          this.closeModals();
          // Reload the appropriate list
          if (formValue.type === 'Buy') {
            this.loadBuyingAccounts();
          } else {
            this.loadSellingAccounts();
          }
        },
        error: (err) => {
          console.error('Error updating account:', err);
        },
      });
    }
  }

  exportToPDF() {}

  exportToExcel() {}
}
