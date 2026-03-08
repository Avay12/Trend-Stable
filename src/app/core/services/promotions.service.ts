import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PromoCode {
  id: string;
  code: string;
  bonusPercentage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Headline {
  id: string;
  text: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class PromotionsService {
  private url = 'https://trendstable.com/api';
  private http = inject(HttpClient);

  // Promocode Methods
  getAllPromoCodes(): Observable<PromoCode[]> {
    return this.http.get<PromoCode[]>(`${this.url}/promocode`, { withCredentials: true });
  }

  createPromoCode(code: string, bonusPercentage: number): Observable<PromoCode> {
    return this.http.post<PromoCode>(`${this.url}/promocode`, { code, bonusPercentage }, { withCredentials: true });
  }

  setPromoCodeStatus(id: string, isActive: boolean): Observable<PromoCode> {
    return this.http.put<PromoCode>(`${this.url}/promocode/${id}/status`, { isActive }, { withCredentials: true });
  }

  deletePromoCode(id: string): Observable<any> {
    return this.http.delete(`${this.url}/promocode/${id}`, { withCredentials: true });
  }

  // Headline Methods
  getActiveHeadlines(): Observable<Headline[]> {
    return this.http.get<Headline[]>(`${this.url}/headline/active`, { withCredentials: true });
  }
  getAllHeadlines(): Observable<Headline[]> {
    return this.http.get<Headline[]>(`${this.url}/headline`, { withCredentials: true });
  }

  createHeadline(text: string): Observable<Headline> {
    return this.http.post<Headline>(`${this.url}/headline`, { text }, { withCredentials: true });
  }

  setHeadlineStatus(id: string, isActive: boolean): Observable<Headline> {
    return this.http.put<Headline>(`${this.url}/headline/${id}/status`, { isActive }, { withCredentials: true });
  }

  deleteHeadline(id: string): Observable<any> {
    return this.http.delete(`${this.url}/headline/${id}`, { withCredentials: true });
  }
}
