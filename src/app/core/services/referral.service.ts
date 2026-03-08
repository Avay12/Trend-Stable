import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReferralStats {
  referralCode: string | null;
  referralBalance: number;
  totalEarnings: number;
  commissionRate: number;
  totalReferrals: number;
}

export interface ApplyReferralResponse {
  message: string;
  referralCode: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReferralService {
  private url = 'https://smmstable.com/api';
  private http = inject(HttpClient);

  getStats(): Observable<ReferralStats> {
    return this.http.get<ReferralStats>(`${this.url}/referral/stats`, { withCredentials: true });
  }

  applyCode(customCode: string): Observable<ApplyReferralResponse> {
    return this.http.post<ApplyReferralResponse>(`${this.url}/referral/apply`, { customCode }, { withCredentials: true });
  }
}
