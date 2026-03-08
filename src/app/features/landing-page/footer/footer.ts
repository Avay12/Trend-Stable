import { Component, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  private el = inject(ElementRef);

  scrollToSection(id: string, event: Event) {
    event.preventDefault();
    const root = this.el.nativeElement.getRootNode() as ShadowRoot | Document;
    const element = root.querySelector(`#${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
