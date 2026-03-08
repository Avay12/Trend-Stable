import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SidebarService {
    // Signal to track sidebar open/close state
    isOpen = signal(false);

    // Toggle sidebar
    toggle() {
        this.isOpen.update(value => !value);
    }

    // Open sidebar
    open() {
        this.isOpen.set(true);
    }

    // Close sidebar
    close() {
        this.isOpen.set(false);
    }
}
