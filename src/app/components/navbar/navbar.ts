import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';

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

  private isThemeTransitionRunning = false;

  constructor(
    public languageService: LanguageService,
    private cdr: ChangeDetectorRef,
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
     THEME
     ========================================================= */

  toggleTheme(event: MouseEvent): void {
    /*
     * Impede dois cliques de iniciarem duas transições
     * ao mesmo tempo.
     */
    if (this.isThemeTransitionRunning) {
      return;
    }

    const nextIsDark = !this.isDarkMode;

    const documentWithTransition = document as Document & {
      startViewTransition?: (callback: () => void) => {
        finished: Promise<void>;
      };
    };

    const startViewTransition = documentWithTransition.startViewTransition;

    /*
     * =======================================================
     * FALLBACK
     * =======================================================
     */

    if (!startViewTransition) {
      this.applyTheme(nextIsDark);
      return;
    }

    /*
     * =======================================================
     * TRANSITION LOCK
     * =======================================================
     */

    this.isThemeTransitionRunning = true;

    /*
     * =======================================================
     * PONTO DE ORIGEM
     * =======================================================
     */

    const button = event.currentTarget as HTMLElement;

    const rect = button.getBoundingClientRect();

    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    /*
     * =======================================================
     * RAIO
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

    document.documentElement.style.setProperty('--theme-transition-radius', `${maxRadius}px`);

    /*
     * =======================================================
     * VIEW TRANSITION
     * =======================================================
     */

    const transition = startViewTransition.call(document, () => {
      /*
       * Atualiza o tema.
       */
      this.applyTheme(nextIsDark);

      /*
       * IMPORTANTE:
       * força o Angular a atualizar imediatamente
       * os bindings:
       *
       * [class.is-dark]
       * [class.pi-sun]
       * [class.pi-moon]
       */
      this.cdr.detectChanges();
    });

    /*
     * =======================================================
     * LIBERA O LOCK
     * =======================================================
     */

    transition.finished.finally(() => {
      this.isThemeTransitionRunning = false;
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

  toggleLanguage(): void {
    this.languageService.toggleLanguage();
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
