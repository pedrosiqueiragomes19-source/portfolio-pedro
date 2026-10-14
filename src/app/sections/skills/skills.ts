import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
} from '@angular/core';

import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [],
  templateUrl: './skills.html',
  styleUrl: './skills.css',
})
export class Skills implements AfterViewInit, OnDestroy {
  // =========================================================
  // SECTION
  // =========================================================

  @ViewChild('skillsSection', { static: true })
  skillsSection!: ElementRef<HTMLElement>;

  // =========================================================
  // INTERNAL
  // =========================================================

  private sectionElement!: HTMLElement;

  // =========================================================
  // INTERSECTION OBSERVER
  // =========================================================

  private revealObserver?: IntersectionObserver;

  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(public languageService: LanguageService) {}

  // =========================================================
  // LIFECYCLE
  // =========================================================

  ngAfterViewInit(): void {
    this.sectionElement = this.skillsSection.nativeElement;

    // -------------------------------------------------------
    // INITIAL CSS VARIABLES
    // -------------------------------------------------------

    this.sectionElement.style.setProperty('--skills-scroll', '0');

    // -------------------------------------------------------
    // START
    // -------------------------------------------------------

    this.updateScrollProgress();

    this.setupScrollReveal();
  }

  // =========================================================
  // SCROLL REVEAL
  // =========================================================

  private setupScrollReveal(): void {
    if (!this.sectionElement) {
      return;
    }

    const section = this.sectionElement;

    /*
     * O estado "ready" é adicionado somente quando o JS
     * já está funcionando.
     *
     * Assim o conteúdo continua normal quando JS falha.
     */

    section.classList.add('skills-scroll-ready');

    // -------------------------------------------------------
    // FALLBACK
    // -------------------------------------------------------

    if (typeof IntersectionObserver === 'undefined') {
      section.classList.add('skills-scroll-visible');

      return;
    }

    // -------------------------------------------------------
    // OBSERVER
    // -------------------------------------------------------

    this.revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            /*
             * Entrou na viewport.
             *
             * Ativa todas as animações.
             */

            section.classList.add('skills-scroll-visible');
          } else {
            /*
             * Saiu da viewport.
             *
             * Remove a classe para que, quando voltar,
             * as animações aconteçam novamente.
             */

            section.classList.remove('skills-scroll-visible');
          }
        });
      },
      {
        /*
         * Um pequeno pedaço da seção precisa estar
         * visível para disparar.
         */

        threshold: 0.08,

        /*
         * Ativa um pouco antes da seção chegar
         * completamente ao viewport.
         */

        rootMargin: '0px 0px -10% 0px',
      },
    );

    this.revealObserver.observe(section);
  }

  // =========================================================
  // WINDOW SCROLL
  // =========================================================

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.updateScrollProgress();
  }

  // =========================================================
  // SCROLL PROGRESS
  // =========================================================

  private updateScrollProgress(): void {
    if (!this.sectionElement) {
      return;
    }

    const rect = this.sectionElement.getBoundingClientRect();

    const viewportHeight = window.innerHeight;

    const totalDistance = viewportHeight + rect.height;

    if (totalDistance <= 0) {
      return;
    }

    const currentPosition = viewportHeight - rect.top;

    let progress = currentPosition / totalDistance;

    progress = Math.max(0, Math.min(1, progress));

    this.sectionElement.style.setProperty('--skills-scroll', progress.toFixed(3));
  }

  // =========================================================
  // RESIZE
  // =========================================================

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateScrollProgress();
  }

  // =========================================================
  // CLEANUP
  // =========================================================

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();

    if (this.sectionElement) {
      this.sectionElement.classList.remove('skills-scroll-ready');

      this.sectionElement.classList.remove('skills-scroll-visible');

      this.sectionElement.style.removeProperty('--skills-scroll');
    }
  }
}
