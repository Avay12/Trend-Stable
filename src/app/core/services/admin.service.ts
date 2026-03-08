import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = 'https://smmstable.com/api/admin';

  getMarginConfig(startDate?: string, endDate?: string): Observable<any> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get(`${this.apiUrl}/margin`, {
      params,
      withCredentials: true,
    });
  }

  updateGlobalMargin(margin: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/margin`, { margin }, {
      withCredentials: true,
    });
  }

  getRevenueAnalytics(
    period: 'day' | 'week' | 'month' | 'custom' = 'day',
    startDate?: string,
    endDate?: string
  ): Observable<any> {
    let params = new HttpParams().set('period', period);
    
    if (period === 'custom') {
      if (startDate) params = params.set('startDate', startDate);
      if (endDate) params = params.set('endDate', endDate);
    }
    
    return this.http.get(`${this.apiUrl}/revenue`, {
      params,
      withCredentials: true,
    });
  }

  getSystemStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/system/stats`, {
      withCredentials: true,
    });
  }
}
