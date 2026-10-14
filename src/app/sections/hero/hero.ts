// Componente da seção Hero

import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LanguageService } from '../../core/services/language.service';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero implements AfterViewInit, OnDestroy {
  @ViewChild('heroSection', { static: true })
  heroSection!: ElementRef<HTMLElement>;

  @ViewChild('heroContent', { static: true })
  heroContent!: ElementRef<HTMLElement>;

  @ViewChild('heroVisual', { static: true })
  heroVisual!: ElementRef<HTMLElement>;

  constructor(public languageService: LanguageService) {}

  ngAfterViewInit(): void {
    this.initAnimations();
  }

  // Inicializa animações GSAP de entrada e parallax
  private initAnimations(): void {
    const section = this.heroSection.nativeElement;
    const content = this.heroContent.nativeElement;
    const visual = this.heroVisual.nativeElement;

    gsap.from(content, {
      y: 20,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      delay: 0.1,
      clearProps: 'transform,opacity',
    });

    gsap.from(visual, {
      y: 16,
      opacity: 0,
      scale: 0.985,
      duration: 1,
      ease: 'power3.out',
      delay: 0.15,
      clearProps: 'transform,opacity',
    });

    const title = content.querySelector<HTMLElement>('h1');
    if (title) {
      this.animateTitleOnScroll(title);
    }

    const description = content.querySelector<HTMLElement>('.hero-description');
    if (description) {
      this.animateDescriptionOnScroll(description);
    }

    gsap.to(content, {
      y: -70,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2,
        invalidateOnRefresh: true,
      },
    });

    gsap.to(visual, {
      y: -50,
      scale: 0.96,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.4,
        invalidateOnRefresh: true,
      },
    });

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  }

  // Animação de revelação do título
  private animateTitleOnScroll(title: HTMLElement): void {
    const lines = Array.from(title.querySelectorAll<HTMLElement>('.hero-title-line'));
    if (!lines.length) return;

    gsap.set(lines, { opacity: 0, y: 14 });
    gsap.to(lines, {
      opacity: 1,
      y: 0,
      duration: 0.45,
      stagger: 0.08,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: title,
        start: 'top 82%',
        end: 'top 55%',
        scrub: 0.25,
      },
    });
  }

  // Animação da descrição no scroll
  private animateDescriptionOnScroll(description: HTMLElement): void {
    gsap.set(description, { opacity: 0, y: 10 });
    gsap.to(description, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: description,
        start: 'top 88%',
        end: 'top 65%',
        scrub: 0.25,
      },
    });
  }

  // Limpeza dos gatilhos de animação
  ngOnDestroy(): void {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    gsap.killTweensOf(this.heroContent.nativeElement);
    gsap.killTweensOf(this.heroVisual.nativeElement);
  }
}
