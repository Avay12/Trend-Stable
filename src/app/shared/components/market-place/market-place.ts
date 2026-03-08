import { Component, HostListener, inject, input, output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AccountOrderService } from '../../../core/services/accountOrder.service';


@Component({
  selector: 'app-market-place-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './market-place.html',
  styleUrl: './market-place.css',
})
export class MarketPlaceModal {
  private accountOrderService = inject(AccountOrderService);

  isOpen = input(false);
  closeModal = output<void>();
  submitListing = output<any>();

  isDropdownOpen = false;
  accountForm: FormGroup;

  platforms = [
    { id: 'instagram', name: 'Instagram', icon: '📸' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵' },
    { id: 'youtube', name: 'YouTube', icon: '▶️' },
    { id: 'twitter', name: 'Twitter/X', icon: '🐦' },
    { id: 'facebook', name: 'Facebook', icon: '👥' },
    { id: 'twitch', name: 'Twitch', icon: '🎮' },
    { id: 'kick', name: 'Kick', icon: '🥊' },
    { id: 'discord', name: 'Discord', icon: '💬' },
    { id: 'telegram', name: 'Telegram', icon: '✈️' }
  ];

  selectedPlatform: any = null;

  constructor(private fb: FormBuilder) {
    this.accountForm = this.fb.group({
      platform: ['', Validators.required],
      username: ['', [Validators.required, Validators.pattern(/^@?[\w.]+$/)]],
      followers: ['', [Validators.required, Validators.min(10000)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.maxLength(500)]
    });
  }

  // Close modal when Escape key is pressed
  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: Event) {
    if (this.isOpen()) {
      this.close();
    }
  }

  // Close modal when clicking outside
  close() {
    this.isDropdownOpen = false;
    this.closeModal.emit();
  }

  // Prevent click event from propagating to overlay
  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  // Toggle dropdown
  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // Select platform
  selectPlatform(platform: any) {
    this.selectedPlatform = platform;
    this.accountForm.patchValue({ platform: platform.id });
    this.isDropdownOpen = false;
  }

  // Clear platform selection
  clearSelection() {
    this.selectedPlatform = null;
    this.accountForm.patchValue({ platform: '' });
  }

  // Handle form submission
  onAnswer() {
    if (this.accountForm.valid) {
      this.submitListing.emit(this.accountForm.value);
      this.accountForm.reset();
      this.selectedPlatform = null;
      this.close();
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.accountForm.controls).forEach(key => {
        this.accountForm.get(key)?.markAsTouched();
      });
    }
  }


    onSubmit() {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();

      return;
    }

    const formValue = this.accountForm.getRawValue();
      // Create new account
      const createData = {
        platform: formValue.platform,
        username: formValue.username,
        type: 'Sell',
        price: formValue.price,
        followers: formValue.followers,
        description: formValue.description,
      };

      this.accountOrderService.createAccountOrder(createData).subscribe({
        next: () => {

          this.close();
        },
        error: (err) => {
          console.error('Error creating account:', err);

        },
      });
    } 


  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container') && this.isDropdownOpen) {
      this.isDropdownOpen = false;
    }
  }

  // Get display text for selected platform
  getPlatformDisplayText(): string {
    if (this.selectedPlatform) {
      return `${this.selectedPlatform.icon} ${this.selectedPlatform.name}`;
    }
    return 'Select platform';
  }
}
