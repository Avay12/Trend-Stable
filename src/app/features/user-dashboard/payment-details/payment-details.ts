import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-payment-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-details.html',
})
export class PaymentDetails implements OnInit {
  router = inject(Router);
  toastr = inject(ToastrService);
  
  paymentDetails: any = null;

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state?.['paymentDetails']) {
      this.paymentDetails = navigation.extras.state['paymentDetails'];
    } else {
      // Fallback if accessed via history state
      this.paymentDetails = history.state.paymentDetails;
    }
    
    if (!this.paymentDetails) {
       this.router.navigate(['/dashboard/payment']);
    }
  }

  copyToClipboard(text: string) {
    if (!text) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
         this.toastr.success('Copied to clipboard');
      }).catch(() => {
         this.toastr.error('Failed to copy');
      });
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.toastr.success('Copied to clipboard');
    }
  }

  onDone() {
    this.router.navigate(['/dashboard/payment']);
  }

  onCheck() {
    this.router.navigate(['/dashboard/payment'], { queryParams: { refresh: 'true' } });
  }
}
