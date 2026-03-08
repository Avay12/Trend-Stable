import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics.html',
  styleUrls: ['./statistics.css']
})
export class StatisticsComponent implements OnInit {
  adminService = inject(AdminService);
  toastr = inject(ToastrService);
  currencyService = inject(CurrencyService);

  stats = signal<any>(null);

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.adminService.getSystemStats().subscribe({
      next: (res: any) => {
        this.stats.set(res);
      },
      error: (err: any) => {
        this.toastr.error('Failed to load system statistics');
        console.error(err);
      }
    });
  }
}
