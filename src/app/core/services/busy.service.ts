import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BusyService {
  loading = signal(false);
  busyRequestCount = 0;
  private timeoutId: any;

  busy() {
    this.busyRequestCount++;
    console.log('Busy count:', this.busyRequestCount);

    this.loading.set(true);

    // Safety timeout: auto-reset after 5 seconds
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => {
      console.warn('BusyService timeout - forcing reset');
      this.reset();
    }, 5000);
  }

  idle() {
    this.busyRequestCount--;
    console.log('Idle count:', this.busyRequestCount);

    if (this.busyRequestCount <= 0) {
      this.busyRequestCount = 0;
      this.loading.set(false);

      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
    }
  }

  // Force reset if something goes wrong
  reset() {
    this.busyRequestCount = 0;
    this.loading.set(false);
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
