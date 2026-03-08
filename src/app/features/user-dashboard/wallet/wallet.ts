import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CurrencyService } from '../../../core/services/currency.service';
import { AuthService } from '../../../core/services/auth.service';

interface PaymentMethod {
  name: string;
  description: string;
  color: string;
  textColor: string;
  borderColor: string;
  qrImage: string;
}

@Component({
  selector: 'app-wallet',
  imports: [CommonModule],
  templateUrl: './wallet.html',
  styleUrl: './wallet.css',
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
// Lucide icons replaced with inline SVGs in template
export class Wallet implements OnInit {
  currencyService = inject(CurrencyService);
  authService = inject(AuthService);
  isLoading = false;
  selectedMethod = 'Global IME';

  paymentMethods: PaymentMethod[] = [
    {
      name: 'Global IME',
      description: 'International payment options',
      color: 'from-blue-600 to-blue-700',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-600',
      qrImage: '/GlobalIME.png',
    },
    {
      name: 'Khalti',
      description: 'Fast and secure payments with Khalti',
      color: 'from-purple-600 to-purple-700',
      textColor: 'text-purple-400',
      borderColor: 'border-purple-600',
      qrImage: '/Khalti.png',
    },
    {
      name: 'Esewa',
      description: 'Easy and instant payments with Esewa',
      color: 'from-green-600 to-green-700',
      textColor: 'text-green-400',
      borderColor: 'border-green-600',
      qrImage: '/esewa.png',
    },
  ];

  get currentPaymentMethod() {
    return this.paymentMethods.find(m => m.name === this.selectedMethod) || this.paymentMethods[0];
  }

  onMethodChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedMethod = select.value;
  }

  ngOnInit() {
    // Data initialized directly
  }

  handleDownload(methodName: string): void {
    const method = this.paymentMethods.find((m) => m.name === methodName);
    if (!method) return;

    const link = document.createElement('a');
    link.href = method.qrImage;
    link.download = `${method.name}-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}