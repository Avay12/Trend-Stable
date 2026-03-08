import { Component, inject, signal, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  isMobileMenuOpen = signal(false);
  isScrolled = signal(false);
  @Output() scrollToSection = new EventEmitter<string>();
  private router = inject(Router);

  constructor() {
    this.router.events.subscribe(() => {
      this.isMobileMenuOpen.set(false);
    });
  }

  onNavClick(event: Event, sectionId: string) {
    event.preventDefault();
    this.scrollToSection.emit(sectionId);
    this.closeMobileMenu();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update((value) => !value);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 10);
  }
}
