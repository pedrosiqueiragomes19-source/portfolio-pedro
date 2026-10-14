import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import {
  revealOnScroll,
  subtleParallax,
  cleanupScrollAnimations,
} from '../../core/animations/scroll.animations';

import { LanguageService } from '../../core/services/language.service';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About implements AfterViewInit, OnDestroy {
  @ViewChild('aboutSection', { static: true })
  aboutSection!: ElementRef<HTMLElement>;

  private gsapAnimations: gsap.core.Animation[] = [];
  private scrollTriggers: ScrollTrigger[] = [];

  constructor(public languageService: LanguageService) {}

  ngAfterViewInit(): void {
    requestAnimationFrame(() => {
      this.createScrollAnimations();

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    });
  }

  private createScrollAnimations(): void {
    const section = this.aboutSection.nativeElement;

    /*
     * ==========================================
     * HEADER
     * ==========================================
     */
    const header = section.querySelector('header');
    if (header instanceof HTMLElement) {
      this.gsapAnimations.push(
        revealOnScroll(header, {
          y: 35,
          duration: 0.75,
          start: 'top 88%',
        }),
      );
    }

    /*
     * ==========================================
     * TITLE
     * ==========================================
     */
    const title = section.querySelector('.about-title');
    if (title instanceof HTMLElement) {
      gsap.set(title, {
        opacity: 0,
        y: 24,
      });

      const titleAnimation = gsap.to(title, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: title,
          start: 'top 88%',
          end: 'top 65%',
          scrub: 0.7,
        },
      });

      this.gsapAnimations.push(titleAnimation);
    }

    /*
     * ==========================================
     * LEFT CONTENT
     * ==========================================
     */
    const leftContent = section.querySelector('.about-left-content');
    if (leftContent instanceof HTMLElement) {
      this.gsapAnimations.push(
        revealOnScroll(leftContent, {
          y: 30,
          duration: 0.8,
          start: 'top 86%',
        }),
      );
    }

    /*
     * ==========================================
     * RIGHT CONTENT
     * ==========================================
     */
    const rightContent = section.querySelector('.about-right-content');
    if (rightContent instanceof HTMLElement) {
      this.gsapAnimations.push(
        revealOnScroll(rightContent, {
          y: 30,
          duration: 0.8,
          delay: 0.08,
          start: 'top 86%',
        }),
      );
    }

    /*
     * ==========================================
     * CENTER VISUAL
     * ==========================================
     */
    const centerVisual = section.querySelector('.about-orb-container');
    if (centerVisual instanceof HTMLElement) {
      this.gsapAnimations.push(
        revealOnScroll(centerVisual, {
          y: 25,
          duration: 0.9,
          start: 'top 85%',
        }),
      );
    }

    /*
     * ==========================================
     * BOTTOM META
     * ==========================================
     */
    const bottomMeta = section.querySelector('.about-bottom-meta');
    if (bottomMeta instanceof HTMLElement) {
      this.gsapAnimations.push(
        revealOnScroll(bottomMeta, {
          y: 18,
          duration: 0.7,
          start: 'top 94%',
        }),
      );
    }

    /*
     * ==========================================
     * ATMOSPHERE PARALLAX
     * ==========================================
     */
    const atmosphere = section.querySelector('.about-background-glow--purple');
    if (atmosphere instanceof HTMLElement) {
      this.gsapAnimations.push(
        subtleParallax(atmosphere, {
          y: -30,
          start: 'top bottom',
          end: 'bottom top',
        }),
      );
    }
  }

  ngOnDestroy(): void {
    this.gsapAnimations.forEach((animation) => {
      animation.kill();
    });
    this.gsapAnimations = [];

    this.scrollTriggers.forEach((trigger) => {
      trigger.kill();
    });
    this.scrollTriggers = [];

    if (this.aboutSection?.nativeElement) {
      cleanupScrollAnimations(this.aboutSection.nativeElement);
    }
  }
}
