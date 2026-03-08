// services/calls.service.ts
import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Services } from '../../shared/models/services.model';

@Injectable({
  providedIn: 'root',
})
export class ProviderServices {
  // url = 'http://localhost:3001/api/services';
  url = 'https://smmstable.com/api/services';
  private http = inject(HttpClient);
  services = signal<Services | null>(null);
  appRange = signal<number>(1.8);

  constructor() {
    this.getAppRange().subscribe({
      next: (res: any) => {
        if (res && res.range) {
          this.appRange.set(res.range);
        }
      },
      error: (err) => {
        console.error('Failed to fetch app range', err);
      }
    });
  }

  getAppRange() {
    return this.http.get<any>('https://smmstable.com/api/range', {
      withCredentials: true,
    });
  }

  getServices(platform: string) {
    const params = {
      platform,
    };
    // In a real app, this would fetch from an API
    return this.http.get<Services>(this.url, {
      params,
      withCredentials: true,
    });
  }

  getVipServices(platform: string) {
    const params = {
      platform,
    };
    // In a real app, this would fetch from an API
    return this.http.get<Services>(this.url + '/medium', {
      params,
      withCredentials: true,
    });
  }

    getCheapServices(platform: string) {
    const params = {
      platform,
    };
    // In a real app, this would fetch from an API
    return this.http.get<Services>(this.url + '/cheap', {
      params,
      withCredentials: true,
    });
  }

  getPagination(page: number = 1, limit: number = 10, platform: string, search?: string) {
    const params: any = {
      page,
      limit,
      platform,
    };
    if (search) {
      params.search = search;
    }
    return this.http.get<Services>(this.url + '/all', {
      params,
      withCredentials: true,
    });
  }

  getBalance() {
    return this.http.get<number>(this.url + '/balance', {
      withCredentials: true,
    });
  }

  getMediumBalance() {
    return this.http.get<Services>(this.url + '/morethanpannel/balance', {
      withCredentials: true,
    });
  }


  getCheapBalance() {
    return this.http.get<Services>(this.url + '/smmbind/balance', {
      withCredentials: true,
    });
  }


}
