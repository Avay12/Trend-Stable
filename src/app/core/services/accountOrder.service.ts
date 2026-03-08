// services/calls.service.ts
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Order, Orders } from '../../shared/models/order.model';
import {
  SellAccountorder,
  AccountOrder,
  CreateAccountOrder,
} from '../../shared/models/acoount-order.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AccountOrderService {
  // url = 'http://localhost:3001/api/orders';
  url = 'https://smmstable.com/api/orders';
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  orders = signal<Orders | null>(null);

  getAccountOrderById(search: string = '', platform: string = '') {
    const params = { search, platform };
    return this.http.get<AccountOrder>(this.url + '/account-order', {
      params,
      withCredentials: true,
    });
  }

  getAllAccountOrders(platform: string = ''): Observable<SellAccountorder> {
    const params = { platform };
    return this.http.get<SellAccountorder>(this.url + '/account-orders', {
      withCredentials: true,
    });
  }

  getAllAccountSelling(search: string = '', platform: string = ''): Observable<SellAccountorder[]> {
    const params = { platform, search };
    return this.http.get<SellAccountorder[]>(this.url + '/account-order/sellings', {
      params,
      withCredentials: true,
    });
  }

  getAllAccountBuying(search: string = '', platform: string = ''): Observable<AccountOrder[]> {
    const params = { platform, search };
    return this.http.get<AccountOrder[]>(this.url + '/account-order/buyings', {
      params,
      withCredentials: true,
    });
  }

  deleteAccountOrder(id: string) {
    return this.http.delete<any>(this.url + '/account-order/delete/' + id, {
      withCredentials: true,
    });
  }

  createAccountOrder(data: CreateAccountOrder) {
    const account = {
      platform: data.platform,
      username: data.username,
      type: data.type,
      price: data.price,
      followers: data.followers,
      description: data.description,
    };

    return this.http.post<any>(this.url + '/account-order', account, {
      withCredentials: true,
    });
  }

  updateOrderStatus(id: string, data: CreateAccountOrder) {
    return this.http.put<Order>(this.url + '/account-order/update/' + id, data, {
      withCredentials: true,
    });
  }
}
