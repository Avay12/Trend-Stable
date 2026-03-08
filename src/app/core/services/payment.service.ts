import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GetAllPaymentsResponse, GetUserPaymentsResponse } from '../../shared/models/payment.model';

export interface PaymentInitiateResponse {
  redirect_url: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private url = 'https://smmstable.com/api';
  private http = inject(HttpClient);

   initiatePayment(amount: number, mobile: string, promoCode?: string): Observable<PaymentInitiateResponse> {
    // The backend controller expects { amount: number }, but we also gather mobile and optionally promoCode. 
    // Sending them assuming the backend handles it as specified.
    const payload: any = { amount, mobile };
    if (promoCode) {
      payload.promoCode = promoCode;
    }
    return this.http.post<PaymentInitiateResponse>(this.url + '/payment/initiate', payload, { withCredentials: true });
  }

  getAllPayments(page: number, limit: number, search: string = ''): Observable<GetAllPaymentsResponse> {
    return this.http.get<GetAllPaymentsResponse>(`${this.url}/payment/all`, {
      params: { page, limit, search },
      withCredentials: true
    });
  }

  getUserPayments(page: number, limit: number, search: string = ''): Observable<GetUserPaymentsResponse> {
    return this.http.get<GetUserPaymentsResponse>(`${this.url}/payment`, {
      params: { page, limit, search },
      withCredentials: true
    });
  }

  getAllOxaPayments(page: number, limit: number): Observable<any> {
    return this.http.get<any>(`${this.url}/payment/easypay/all`, {
      params: { page, limit },
      withCredentials: true
    });
  }

  getUserOxaPayments(page: number, limit: number): Observable<any> {
    return this.http.get<any>(`${this.url}/payment/easypay/user`, {
      params: { page, limit },
      withCredentials: true
    });
  }

  checkPaid(): Observable<any> {
    return this.http.post(`${this.url}/payment/check-paid`, {}, { withCredentials: true });
  }

  updatePaid(identifier: string): Observable<any> {
    return this.http.post(`${this.url}/payment/update-paid`, { identifier }, { withCredentials: true });
  }

  createOxaPayPayment(amount: number, currency: string, network: string, promoCode?: string): Observable<any> {
    const payload: any = { amount, currency, network };
    if (promoCode) {
      payload.promoCode = promoCode;
    }
    return this.http.post<any>(`${this.url}/payment/easypay/create`, payload, { withCredentials: true });
  }
}


