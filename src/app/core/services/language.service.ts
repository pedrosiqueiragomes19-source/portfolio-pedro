import { Injectable, signal } from '@angular/core';

import { EN } from "../i18n/en";
import { PT } from '../i18n/pt';

export type Language = 'en' | 'pt';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly currentLanguage = signal<Language>(this.getInitialLanguage());

  readonly language = this.currentLanguage.asReadonly();

  private readonly translationFiles = {
    en: EN,
    pt: PT,
  };

  getInitialLanguage(): Language {
    if (typeof window === 'undefined') {
      return 'pt';
    }

    try {
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage === 'pt' || savedLanguage === 'en') {
        return savedLanguage;
      }

      if (navigator.language && !navigator.language.toLowerCase().startsWith('pt')) {
        return 'en';
      }
    } catch {
      // Fallback
    }

    return 'pt';
  }

  setLanguage(language: Language): void {
    this.currentLanguage.set(language);

    localStorage.setItem('language', language);
  }

  toggleLanguage(): void {
    const nextLanguage: Language = this.currentLanguage() === 'en' ? 'pt' : 'en';

    this.setLanguage(nextLanguage);
  }

  get translations() {
    return this.translationFiles[this.currentLanguage()];
  }
}
