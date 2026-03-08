// music.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class MusicService {
  private http = inject(HttpClient);
  private apiKey = 'AIzaSyBOqe4J1jKQGhu_yLUrZKeZPOPaxK1lcq0';

  getLatestRnB() {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=english+rnb+songs+2000s+to+2025&type=video&videoCategoryId=10&order=date&maxResults=20&key=${this.apiKey}`;
    return this.http.get<any>(url);
  }
}