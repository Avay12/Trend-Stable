import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-payment-status',
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-status.html',
  styleUrl: './payment-status.css',
})
export class PaymentStatus implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  status = signal<'success' | 'cancelled' | 'pending'>('pending');

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const statusParam = params['status'];
      if (statusParam === 'success') {
        this.status.set('success');
      } else if (statusParam === 'cancelled') {
        this.status.set('cancelled');
      } else {
        // Default or invalid, maybe redirect back to dashboard or show error
        this.status.set('pending'); // or default
      }
    });
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  tryAgain() {
    this.router.navigate(['/dashboard/new-order']);
  }
}
