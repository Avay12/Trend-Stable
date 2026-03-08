import { Component, ChangeDetectorRef, inject, OnInit, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero implements OnInit {
  currentText = '';
  phrases = [
    '#1 SMM Panel for Instant Growth.',
    'Boost your social presence effortlessly.',
    'Premium services for TikTok, Instagram & more.',
  ];
  currentPhraseIndex = 0;
  currentCharIndex = 0;
  isDeleting = false;
  typingSpeed = 100;
  deletingSpeed = 50;
  pauseBeforeDelete = 2000;
  pauseBeforeNextPhrase = 500;
  
  stats = [
    { number: '10K+', label: 'Active Users' },
    { number: '1M+', label: 'Orders Delivered' },
    { number: '24/7', label: 'Support' },
    { number: '99.9%', label: 'Uptime' },
  ];

  private cdr = inject(ChangeDetectorRef);
  private el = inject(ElementRef);

  ngOnInit() {
    this.typeText();
  }

  typeText() {
    const currentPhrase = this.phrases[this.currentPhraseIndex];

    if (!this.isDeleting) {
      if (this.currentCharIndex <= currentPhrase.length) {
        this.currentText = currentPhrase.substring(0, this.currentCharIndex);
        this.currentCharIndex++;
        this.cdr.detectChanges();
        setTimeout(() => this.typeText(), this.typingSpeed);
      } else {
        setTimeout(() => {
          this.isDeleting = true;
          this.typeText();
        }, this.pauseBeforeDelete);
      }
    } else {
      if (this.currentCharIndex > 0) {
        this.currentText = currentPhrase.substring(0, this.currentCharIndex - 1);
        this.currentCharIndex--;
        this.cdr.detectChanges();
        setTimeout(() => this.typeText(), this.deletingSpeed);
      } else {
        this.isDeleting = false;
        this.currentPhraseIndex = (this.currentPhraseIndex + 1) % this.phrases.length;
        setTimeout(() => this.typeText(), this.pauseBeforeNextPhrase);
      }
    }
  }

  scrollToSection(id: string, event: Event) {
    event.preventDefault();
    const root = this.el.nativeElement.getRootNode() as ShadowRoot | Document;
    const element = root.querySelector(`#${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
