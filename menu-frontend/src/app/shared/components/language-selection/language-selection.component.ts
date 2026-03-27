import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-language-selection',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lang-overlay">
      <div class="lang-card shadow-lg p-4 text-center border-0 rounded-5">
        <h2 class="fw-bold mb-4 text-dark">{{ translate('CHOOSE_LANGUAGE') }}</h2>
        <div class="d-grid gap-3">
          <button *ngIf="isActive('ka')" (click)="select('ka')" class="btn btn-lang py-3 rounded-pill position-relative overflow-hidden">
            <span class="flag me-3">🇬🇪</span> ქართული
          </button>
          <button *ngIf="isActive('en')" (click)="select('en')" class="btn btn-lang py-3 rounded-pill position-relative overflow-hidden">
            <span class="flag me-3">🇺🇸</span> English
          </button>
          <button *ngIf="isActive('ru')" (click)="select('ru')" class="btn btn-lang py-3 rounded-pill position-relative overflow-hidden">
            <span class="flag me-3">🇷🇺</span> Русский
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .lang-overlay {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(248, 249, 250, 0.95);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    .lang-card {
      width: 100%;
      max-width: 400px;
      background: white;
      transform: translateY(0);
      animation: slideUp 0.6s cubic-bezier(0.23, 1, 0.32, 1);
    }
    .btn-lang {
      text-align: left;
      padding-left: 2rem !important;
      font-weight: 600;
      font-size: 1.1rem;
      border: 2px solid #eee;
      background: white;
      transition: all 0.3s;
    }
    .btn-lang:hover {
      border-color: var(--bs-primary);
      background: #f0f7ff;
      transform: scale(1.02);
    }
    .flag { font-size: 1.4rem; }
    
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class LanguageSelectionComponent {
  activeLanguages: string[] = ['ka', 'en', 'ru'];

  constructor(private translationService: TranslationService) {
    this.translationService.activeLanguages$.subscribe(langs => {
      this.activeLanguages = langs;
    });
  }

  isActive(code: string): boolean {
    return this.activeLanguages.includes(code);
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  select(lang: string) {
    this.translationService.setLanguage(lang);
  }
}
