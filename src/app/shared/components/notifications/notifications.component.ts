import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent {
  notificationService = inject(NotificationService);
  
  @Output() close = new EventEmitter<void>();

  constructor() {
      // Ensure we have data
      this.notificationService.loadNotifications();
  }

  markAsRead(notification: Notification) {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification._id);
    }
  }

  deleteNotification(event: Event, id: string) {
    event.stopPropagation(); // Prevent triggering markAsRead
    this.notificationService.deleteNotification(id);
  }

  clearAll() {
    this.notificationService.deleteAllNotifications();
  }
}
