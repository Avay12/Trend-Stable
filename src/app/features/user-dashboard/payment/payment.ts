import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CurrencyService } from '../../../core/services/currency.service';
import { AuthService } from '../../../core/services/auth.service';
import { PaymentService } from '../../../core/services/payment.service';
import { ToastrService } from 'ngx-toastr';
import { CryptoToken } from '../../../shared/models/payment.model';


@Component({
  selector: 'app-payment',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment.html',
  styleUrl: './payment.css'
})
export class Payment implements OnInit {
  currencyService = inject(CurrencyService);
  authService = inject(AuthService);
  paymentService = inject(PaymentService);
  fb = inject(FormBuilder);
  toastr = inject(ToastrService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  isProcessing = signal(false);
  isMethodLoading = signal(false);
  selectedPaymentMethod = signal<'crypto'>('crypto');
  
  cryptoTokens: CryptoToken[] = [
    { name: 'USDT (TRC-20)', currency: 'USDT', network: 'trc20', iconSymbol: '₮' },
    { name: 'USDT (ERC-20)', currency: 'USDT', network: 'erc20', iconSymbol: '₮' },
    { name: 'USDT (BEP-20)', currency: 'USDT', network: 'bep20', iconSymbol: '₮' },
    { name: 'Bitcoin (Bitcoin)', currency: 'BTC', network: 'bitcoin', iconSymbol: '₿' },
    { name: 'Ethereum (Ethereum)', currency: 'ETH', network: 'erc20', iconSymbol: 'Ξ' },
    { name: 'Solana (Solana)', currency: 'SOL', network: 'solana', iconSymbol: '◎' },
    { name: 'Monero (Monero)', currency: 'XMR', network: 'monero', iconSymbol: 'ɱ' },
    { name: 'USDC (Ethereum)', currency: 'USDC', network: 'erc20', iconSymbol: '$' }
  ];
  isTokenDropdownOpen = signal(false);
  selectedToken = signal<CryptoToken>(this.cryptoTokens[2]); // Default to USDT (BEP-20)
  
  // Payment History State
  isLoadingPayments = signal(false);
  payments = signal<any[]>([]);
  totalItems = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = signal(0);

  paymentForm: FormGroup;

  constructor() {
    this.paymentForm = this.fb.group({
      amount: [, [Validators.required, Validators.min(1)]],
      promoCode: ['']
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['refresh'] === 'true') {
        this.refreshBalance();
      }
    });
    this.loadPayments();
  }

  setPaymentMethod(method: 'crypto') {
    if (this.selectedPaymentMethod() === method) return;
    this.selectedPaymentMethod.set(method);
    
    this.paymentForm.get('amount')?.setValidators([Validators.required, Validators.min(20)]);
    this.paymentForm.get('amount')?.updateValueAndValidity();

    this.isMethodLoading.set(true);
    setTimeout(() => {
      this.isMethodLoading.set(false);
    }, 500);
  }

  refreshBalance() {
    this.authService.getUserInfo().subscribe({
      next: () => {
        this.toastr.success('Balance updated successfully', 'Balance Refreshed');
      },
      error: () => {
        this.toastr.error('Failed to refresh balance', 'Error');
      }
    });
  }

  loadPayments() {
    this.isLoadingPayments.set(true);
    this.paymentService.getUserOxaPayments(this.currentPage(), this.pageSize()).subscribe({
      next: (res) => {
        this.payments.set(res.payments);
        this.totalItems.set(res.total);
        this.totalPages.set(res.totalPages);
        this.isLoadingPayments.set(false);
      },
      error: (err) => {
        console.error('Error loading payments', err);
        this.toastr.error('Failed to load payment history', 'Error');
        this.isLoadingPayments.set(false);
      }
    });
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadPayments();
    }
  }

  get visiblePages(): (number | string)[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number;

    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
            range.push(i);
        }
    }

    range.forEach(i => {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1);
            } else if (i - l !== 1) {
                rangeWithDots.push('...');
            }
        }
        rangeWithDots.push(i);
        l = i;
    });

    return rangeWithDots;
  }

  viewPaymentDetails(payment: any) {
    const paymentDetails = {
      order_id: payment.orderId,
      pay_currency: payment.currency,
      pay_amount: payment.amount,
      address: payment.payAddress || payment.address,
      qr_code: payment.qrCode || payment.qr_code,
      status: payment.status
    };
    this.router.navigate(['/dashboard/payment-details'], { state: { paymentDetails } });
  }

  initiatePayment() {
    if (this.paymentForm.invalid) {
       this.toastr.warning('Please enter a valid amount (Min $1)', 'Invalid Form');
       return;
    }

    this.isProcessing.set(true);
    const { amount, promoCode } = this.paymentForm.value;

    const token = this.selectedToken();
    this.paymentService.createOxaPayPayment(amount, token.currency, token.network, promoCode).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Crypto payment initiated', 'Success');
          this.router.navigate(['/dashboard/payment-details'], { state: { paymentDetails: res } });
        } else {
          this.toastr.error('Failed to initiate crypto payment', 'Payment Error');
        }
        this.isProcessing.set(false);
      },
      error: (err) => {
        console.error('Crypto payment failed', err);
        this.toastr.error('Failed to initiate crypto payment. Please try again.', 'Error');
        this.isProcessing.set(false);
      }
    });
  }
}
