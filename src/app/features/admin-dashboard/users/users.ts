import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

import { CurrencyService } from '../../../core/services/currency.service';

interface User {
  id: string;
  email: string;
  provider: string;
  role: string;
  balance: number;
  loyalty: string;
  currency: string;
  username: string;
  status: boolean;
  isActive: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePipe],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users {
  authService = inject(AuthService);
  private fb = inject(FormBuilder);

  currencyService = inject(CurrencyService);


  // users = this.authService.allUsers;
  searchTerm = '';
  selectedRole = '';
  showEditModal = signal(false);
  users = signal<User[]>([]);
  isLoading = signal(true);
  userForm = this.fb.nonNullable.group({
    id: [''],
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    balance: [0, [Validators.required, Validators.min(0)]],
    role: ['user', Validators.required],
    loyalty: ['silver', Validators.required],
    isActive: [true, Validators.required],
    currency: ['USD', Validators.required],
  });

  loadUsers(search?: string) {
    this.authService.getAllUsers(this.selectedRole, search).subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.isLoading.set(false);
      },
    });
  }

  onSearch() {
    this.isLoading.set(true);
    this.loadUsers(this.searchTerm);
  }

  // Track the previously selected currency to calculate conversion
  private previousCurrency = 'USD';

  ngOnInit() {
    this.loadUsers();
    
    // Subscribe to currency changes to convert balance dynamically
    this.userForm.get('currency')?.valueChanges.subscribe((newCurrency) => {
      if (!newCurrency) return;
      
      const currentBalance = this.userForm.get('balance')?.value || 0;
      if (currentBalance > 0) {
        // Convert current balance back to USD using previous currency rate
        const prevRate = this.currencyService.getCurrency(this.previousCurrency).rate;
        const balanceInUsd = currentBalance / prevRate;
        
        // Convert USD to new currency
        const newRate = this.currencyService.getCurrency(newCurrency).rate;
        const newBalance = balanceInUsd * newRate;
        
        // Update balance field without emitting event to avoid loops (though strict equality check prevents it usually)
        this.userForm.patchValue({ balance: parseFloat(newBalance.toFixed(2)) }, { emitEvent: false });
      }
      
      // Update previous currency for next change
      this.previousCurrency = newCurrency;
    });
  }

  deleteUser(id: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.authService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error deleting user:', err);
        },
      });
    }
  }

  availableCurrencies = this.currencyService.getAvailableCurrencies();

  openEditModal(user: User) {
    // Show balance in user's preferred currency
    const targetCurrency = user.currency || 'USD';
    
    // Note: user.balance is in USD. We need to show it in their currency.
    const convertedBalance = this.currencyService.convertTo(user.balance, targetCurrency);

    this.previousCurrency = targetCurrency; // Initialize previous currency for change tracking

    this.userForm.patchValue({
      id: user.id,
      username: user.username,
      email: user.email,
      balance: parseFloat(convertedBalance.toFixed(2)),
      loyalty: user.loyalty,
      role: user.role,
      isActive: user.isActive,
      currency: targetCurrency,
    });
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.userForm.reset();
  }

  saveUser() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const formValue = this.userForm.getRawValue();
    const { id, ...updateData } = formValue;

    // Convert balance back to USD before saving
    // AmountInUSD = AmountInCurrency / Rate
    const selectedCurrencyCode = formValue.currency || 'USD';
    const rate = this.currencyService.getCurrency(selectedCurrencyCode).rate;
    
    // Convert the balance (which is in selected currency) back to USD
    updateData.balance = updateData.balance / rate;

    this.authService.updateUserById(id!, updateData).subscribe({
      next: () => {
        // this.loadUsers(true);
        this.closeEditModal();
        this.loadUsers(); // Reload to refresh list
      },
      error: (err) => {
        console.error('Error updating user:', err);
      },
    });
  }

  exportToPDF() {}

  exportToExcel() {}
}
