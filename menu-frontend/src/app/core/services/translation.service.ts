import { Injectable } from '@angular/core';
import { KA_TRANSLATIONS } from '../translations/ka';
import { EN_TRANSLATIONS } from '../translations/en';
import { RU_TRANSLATIONS } from '../translations/ru';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguageSubject = new BehaviorSubject<string>(localStorage.getItem('selectedLanguage') || 'ka');
  currentLanguage$ = this.currentLanguageSubject.asObservable();

  private activeLanguagesSubject = new BehaviorSubject<string[]>(['ka', 'en', 'ru']);
  activeLanguages$ = this.activeLanguagesSubject.asObservable();

  private translations: any = {
    ka: KA_TRANSLATIONS,
    en: EN_TRANSLATIONS,
    ru: RU_TRANSLATIONS
  };

  constructor(private api: ApiService) {
    this.loadActiveLanguages();
  }

  loadActiveLanguages() {
    this.api.get('/public/languages').subscribe({
      next: (langs: string[]) => {
        this.activeLanguagesSubject.next(langs);
        // If current language is set but no longer active, reset it
        if (this.currentLanguage && !langs.includes(this.currentLanguage)) {
          this.setLanguage('');
        }
      },
      error: (err) => console.error('Failed to load active languages', err)
    });
  }

  get currentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  setLanguage(lang: string) {
    localStorage.setItem('selectedLanguage', lang);
    this.currentLanguageSubject.next(lang);
  }

  translate(key: string): string {
    const lang = this.currentLanguage || 'ka';
    return this.translations[lang]?.[key] || key;
  }

  translateField(item: any, fieldBaseName: string): string {
    const lang = this.currentLanguage || 'ka';
    if (lang === 'en') {
      return item[`${fieldBaseName}En`] || item[fieldBaseName.toLowerCase()];
    }
    if (lang === 'ru') {
      return item[`${fieldBaseName}Ru`] || item[fieldBaseName.toLowerCase()];
    }
    // Default to Georgian (base field)
    return item[fieldBaseName.toLowerCase()] || '';
  }
}
