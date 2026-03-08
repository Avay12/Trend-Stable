// services/calls.service.ts
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Order, Orders, OrderStats, UsersOrder } from '../../shared/models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  // url = 'http://localhost:3001/api/orders';
  url = 'https://smmstable.com/api/orders';
  private http = inject(HttpClient);
  orders = signal<Orders | null>(null);

  getOrders() {
    // In a real app, this would fetch from an API
    return this.http.get<Orders>(this.url, {
      withCredentials: true,
    });
  }

  getOrderStats(): Observable<OrderStats> {
    // In a real app, this would search calls from an API
    return this.http.get<OrderStats>(this.url + '/stats', {
      withCredentials: true,
    });
  }

  createOrder({
    serviceId,
    quantity,
    link,
  }: {
    serviceId: number;
    quantity: number;
    link: string;
  }) {
    return this.http.post<Order>(
      this.url,
      { serviceId: Number(serviceId), quantity: Number(quantity), link },
      {
        withCredentials: true,
      },
    );
  }

  createMediumOrder({
    serviceId,
    quantity,
    link,
  }: {
    serviceId: number;
    quantity: number;
    link: string;
  }) {
    return this.http.post<Order>(
      this.url + '/medium',
      { serviceId: Number(serviceId), quantity: Number(quantity), link },
      {
        withCredentials: true,
      },
    );
  }

  createCheapOrder({
    serviceId,
    quantity,
    link,
  }: {
    serviceId: number;
    quantity: number;
    link: string;
  }) {
    return this.http.post<Order>(
      this.url + '/cheap',
      { serviceId: Number(serviceId), quantity: Number(quantity), link },
      {
        withCredentials: true,
      },
    );
  }

  getAllOrders(search: string = '', status: string = 'IN_PROGRESS') {
    const params = {
      search,
      status,
    };
    return this.http.get<UsersOrder>(this.url + '/all', { params, withCredentials: true });
  }

  updateOrderStatus(orderId: string, status: string) {
    return this.http.put<Order>(
      this.url + '/update-status',
      { orderId, status },
      {
        withCredentials: true,
      },
    );
  }
}
