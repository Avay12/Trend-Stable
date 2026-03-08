import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate, stagger, query } from '@angular/animations';
import { AuthService } from '../../../core/services/auth.service';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  animations: [
    trigger('fadeInUp', [
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      state('*', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', animate('600ms cubic-bezier(0.4, 0, 0.2, 1)')),
    ]),
    trigger('staggerFadeIn', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger(100, [
              animate(
                '500ms cubic-bezier(0.4, 0, 0.2, 1)',
                style({ opacity: 1, transform: 'translateY(0)' }),
              ),
            ]),
          ],
          { optional: true },
        ),
      ]),
    ]),
    trigger('scaleIn', [
      state('void', style({ opacity: 0, transform: 'scale(0.95)' })),
      state('*', style({ opacity: 1, transform: 'scale(1)' })),
      transition('void => *', animate('400ms cubic-bezier(0.4, 0, 0.2, 1)')),
    ]),
  ],
})
export class Dashboard implements OnInit {
  orderService = inject(OrderService);
  authService = inject(AuthService);
  currencyService = inject(CurrencyService);
  totalOrder = 0;
  totalSpent = signal(0);
  
  currentTier = computed(() => {
    const user = this.authService.currentUser();
    const loyalty = user?.loyalty?.toLowerCase() || 'bronze';
    
    switch (loyalty) {
      case 'platinum':
        return {
          name: 'Platinum',
          color: 'text-cyan-400',
          gradient: 'from-cyan-400 via-blue-400 to-purple-500',
          icon: 'platinum'
        };
      case 'gold':
        return {
          name: 'Gold',
          color: 'text-yellow-500',
          gradient: 'from-yellow-400 via-amber-400 to-orange-500',
          icon: 'gold'
        };
      case 'silver':
        return {
          name: 'Silver',
          color: 'text-slate-400',
          gradient: 'from-slate-400 via-gray-300 to-slate-500',
          icon: 'silver'
        };
      default:
        return {
          name: 'Bronze',
          color: 'text-amber-600',
          gradient: 'from-amber-600 via-amber-500 to-yellow-600',
          icon: 'bronze'
        };
    }
  });
  isLoading = signal(true);
  
  // Chart data for growth analytics
  chartData = {
    weeks: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    values: [140, 100, 60, 30, 15],
    points: [
      { x: 0, y: 140 },
      { x: 100, y: 100 },
      { x: 200, y: 60 },
      { x: 320, y: 30 },
      { x: 400, y: 15 },
    ],
  };

  // Animation state
  isLoaded = false;

  ngOnInit() {
    // Trigger animations after a short delay
    setTimeout(() => {
      this.isLoaded = true;
      this.animateChart();
    }, 100);

    this.loadOrderStats();
  }

  loadOrderStats() {
    this.orderService.getOrderStats().subscribe({
      next: (order: any) => {
        this.totalOrder = order.total.count;
        this.totalSpent.set(order.total.totalSpent);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  animateChart() {
    // Animate the SVG chart path
    const path = document.querySelector('.chart-line') as SVGPathElement;
    if (path) {
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;

      setTimeout(() => {
        path.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)';
        path.style.strokeDashoffset = '0';
      }, 300);
    }

    // Animate chart circles
    const circles = document.querySelectorAll('.chart-point');
    circles.forEach((circle, index) => {
      setTimeout(
        () => {
          circle.classList.add('animate-scale-in');
        },
        300 + index * 150,
      );
    });
  }
}
