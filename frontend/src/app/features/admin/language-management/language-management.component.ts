import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-language-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4 pb-5 admin-page">
      <div class="admin-toolbar">
        <div class="admin-toolbar__left">
          <h2 class="fw-bold text-dark admin-toolbar__title"><i class="bi bi-translate me-2 text-primary"></i>{{ translate('LANG_MGMT_TITLE') }}</h2>
        </div>
      </div>

      <div class="card shadow-sm rounded-4 border-0 p-4">
        <p class="text-muted mb-4">{{ translate('LANG_MGMT_SUBTITLE') }}</p>

        <div class="list-group list-group-flush">
          <div *ngFor="let lang of languages" class="list-group-item d-flex align-items-center justify-content-between flex-wrap gap-3 py-3 border-0 rounded-3 mb-2 bg-light-hover">
            <div class="d-flex align-items-center min-w-0">
              <span class="fs-4 me-3">{{ getFlag(lang.code) }}</span>
              <div>
                <h6 class="mb-0 fw-bold">{{ translate('LANG_NAME_' + lang.code.toUpperCase()) }}</h6>
                <small class="text-muted">{{ lang.code.toUpperCase() }}</small>
              </div>
            </div>
            <div class="form-check form-switch fs-5">
              <input class="form-check-input" type="checkbox" role="switch" 
                     [(ngModel)]="lang.isActive" 
                     (change)="toggle(lang)"
                     [disabled]="lang.code === 'ka'">
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bg-light-hover { transition: background 0.2s; }
    .bg-light-hover:hover { background: #f8f9fa; }
    .form-check-input:checked { background-color: #0d6efd; border-color: #0d6efd; }
  `]
})
export class LanguageManagementComponent implements OnInit {
  languages: any[] = [];

  constructor(private api: ApiService, private translationService: TranslationService) {}

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.api.get('/admin/language-settings').subscribe(res => {
      this.languages = res;
    });
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  getFlag(code: string): string {
    switch (code) {
      case 'ka': return '🇬🇪';
      case 'en': return '🇺🇸';
      case 'ru': return '🇷🇺';
      default: return '🌐';
    }
  }

  toggle(lang: any) {
    this.api.put('/admin/language-settings', { id: lang.id, isActive: lang.isActive }).subscribe({
      error: (err) => {
        console.error('Failed to update language setting', err);
        this.loadSettings(); // Revert on error
      }
    });
  }
}
