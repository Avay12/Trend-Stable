import { Component, ViewEncapsulation, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from './header/header';
import { Hero } from './hero/hero';
import { Features } from './features/features';
import { PopularServices } from './popular-services/popular-services';
import { Footer } from './footer/footer';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, Header, Hero, Features, PopularServices, Footer],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
  encapsulation: ViewEncapsulation.ShadowDom
})
export class LandingPage implements AfterViewInit {
  title = 'TrendStable - Grow Your Social Media Fast & Safely';

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Select elements within the Shadow DOM
    const shadowRoot = this.el.nativeElement.shadowRoot;
    const hiddenElements = shadowRoot.querySelectorAll('.reveal-on-scroll');
    hiddenElements.forEach((el: Element) => observer.observe(el));
  }

  onScrollToSection(sectionId: string) {
    const shadowRoot = this.el.nativeElement.shadowRoot;
    const element = shadowRoot.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
