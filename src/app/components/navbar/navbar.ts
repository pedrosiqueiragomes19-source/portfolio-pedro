import {
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core';

import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, OnDestroy {
  isDarkMode = false;

  isMobileMenuOpen = false;

  private isTransitionRunning = false;

  get isThemeTransitionRunning(): boolean {
    return this.isTransitionRunning;
  }

  set isThemeTransitionRunning(val: boolean) {
    this.isTransitionRunning = val;
  }

  constructor(
    public languageService: LanguageService,
    private cdr: ChangeDetectorRef,
    private appRef: ApplicationRef,
  ) {}

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme');

    this.isDarkMode = savedTheme === 'dark';

    document.documentElement.classList.toggle('dark', this.isDarkMode);

    /*
     * Garante que o estado inicial do botão
     * esteja sincronizado com o tema.
     */
    this.cdr.detectChanges();
  }

  /* =========================================================
     CIRCULAR VIEW TRANSITION
     ========================================================= */

  private runWithCircularTransition(
    event: MouseEvent,
    updateFn: () => void,
  ): void {
    /*
     * Impede duas transições simultâneas
     */
    if (this.isTransitionRunning) {
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const documentWithTransition = document as Document & {
      startViewTransition?: (callback: () => void) => {
        finished: Promise<void>;
      };
    };

    const startViewTransition = documentWithTransition.startViewTransition;

    /*
     * =======================================================
     * FALLBACK / REDUCED MOTION
     * =======================================================
     */
    if (!startViewTransition || prefersReducedMotion) {
      updateFn();
      this.appRef.tick();
      return;
    }

    /*
     * =======================================================
     * TRANSITION LOCK
     * =======================================================
     */
    this.isTransitionRunning = true;

    /*
     * =======================================================
     * PONTO DE ORIGEM DO CLIQUE
     * =======================================================
     */
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();

    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    /*
     * =======================================================
     * RAIO MÁXIMO ATÉ OS CANTOS DA TELA
     * =======================================================
     */
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    /*
     * =======================================================
     * CSS VARIABLES
     * =======================================================
     */
    document.documentElement.style.setProperty('--theme-transition-x', `${x}px`);
    document.documentElement.style.setProperty('--theme-transition-y', `${y}px`);
    document.documentElement.style.setProperty(
      '--theme-transition-radius',
      `${maxRadius}px`,
    );

    /*
     * =======================================================
     * VIEW TRANSITION
     * =======================================================
     */
    const transition = startViewTransition.call(document, () => {
      updateFn();
      this.appRef.tick();
    });

    /*
     * =======================================================
     * LIBERA O LOCK
     * =======================================================
     */
    transition.finished.finally(() => {
      this.isTransitionRunning = false;
    });
  }

  /* =========================================================
     THEME
     ========================================================= */

  toggleTheme(event: MouseEvent): void {
    const nextIsDark = !this.isDarkMode;

    this.runWithCircularTransition(event, () => {
      this.applyTheme(nextIsDark);
    });
  }

  private applyTheme(isDark: boolean): void {
    this.isDarkMode = isDark;

    document.documentElement.classList.toggle('dark', isDark);

    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  /* =========================================================
     LANGUAGE
     ========================================================= */

  setLanguage(lang: 'pt' | 'en', event?: MouseEvent): void {
    if (this.languageService.language() === lang) {
      return;
    }

    if (event) {
      this.runWithCircularTransition(event, () => {
        this.languageService.setLanguage(lang);
      });
    } else {
      this.languageService.setLanguage(lang);
      this.appRef.tick();
    }
  }

  /* =========================================================
     MOBILE MENU
     ========================================================= */

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;

    this.updateBodyScroll();
  }

  closeMobileMenu(): void {
    if (!this.isMobileMenuOpen) {
      return;
    }

    this.isMobileMenuOpen = false;

    this.updateBodyScroll();
  }

  private updateBodyScroll(): void {
    document.body.style.overflow = this.isMobileMenuOpen ? 'hidden' : '';
  }

  /* =========================================================
     ESC — CLOSE MENU
     ========================================================= */

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.isMobileMenuOpen) {
      return;
    }

    this.closeMobileMenu();
  }

  /* =========================================================
     RESIZE
     ========================================================= */

  @HostListener('window:resize')
  onWindowResize(): void {
    if (window.innerWidth > 900 && this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  /* =========================================================
     CLEANUP
     ========================================================= */

  ngOnDestroy(): void {
    document.body.style.overflow = '';

    this.isThemeTransitionRunning = false;
  }
}
