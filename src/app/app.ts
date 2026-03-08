import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { BusyService } from './core/services/busy.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private router = inject(Router);
  busyService = inject(BusyService);
  protected readonly title = signal('TrendStable');

  ngOnInit(): void {
    // 1. Load the script once on app initialization
    this.loadTawkScript();

    // 2. Listen for route changes to toggle visibility
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.toggleTawkVisibility(event.url);
      });
  }

  loadTawkScript() {
    if (document.getElementById('tawk-script')) return;

    // Initialize API object
    (window as any).Tawk_API = (window as any).Tawk_API || {};
    (window as any).Tawk_LoadStart = new Date();

    // CRITICAL: Tell Tawk.to not to show automatically if we are already on dashboard
    if (this.router.url.startsWith('/dashboard')) {
      (window as any).Tawk_API.onLoad = function () {
        (window as any).Tawk_API.hideWidget();
      };
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://embed.tawk.to/697982b635a2d2198418d642/1jg1ad71q';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    script.id = 'tawk-script';

    document.body.appendChild(script);
  }

  private toggleTawkVisibility(url: string) {
    const tawk = (window as any).Tawk_API;

    // If the API is fully ready
    if (tawk && typeof tawk.hideWidget === 'function') {
      if (url.startsWith('/dashboard') || url.startsWith('/admin')) {
        tawk.hideWidget();
      } else {
        tawk.showWidget();
      }
    } else {
      // If it's still loading (common on refresh), hook into the onLoad event
      (window as any).Tawk_API = (window as any).Tawk_API || {};
      (window as any).Tawk_API.onLoad = () => {
        if (this.router.url.startsWith('/dashboard') || this.router.url.startsWith('/admin')) {
          (window as any).Tawk_API.hideWidget();
        } else {
          (window as any).Tawk_API.showWidget();
        }
      };
    }
  }


  isDashboardRoute(): boolean {
    return this.router.url.startsWith('/dashboard') || this.router.url.startsWith('/admin');
  }
}
