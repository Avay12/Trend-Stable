import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AdminSidebar } from '../../shared/components/admin-sidebar/admin-sidebar';
import { AdminHeader } from '../../shared/components/admin-header/admin-header';

@Component({
    selector: 'app-admin-dashboard',
    imports: [CommonModule, RouterOutlet, AdminSidebar, AdminHeader],
    templateUrl: './admin-dashboard.html',
    styleUrl: './admin-dashboard.css'
})
export class AdminDashboard {
}
