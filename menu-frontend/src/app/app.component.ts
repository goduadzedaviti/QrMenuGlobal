import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslationService } from './core/services/translation.service';
import { LanguageSelectionComponent } from './shared/components/language-selection/language-selection.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LanguageSelectionComponent],
  template: `
    <app-language-selection *ngIf="!currentLang"></app-language-selection>
    <router-outlet *ngIf="currentLang"></router-outlet>
  `
})
export class AppComponent implements OnInit {
  currentLang: string = '';

  constructor(private translationService: TranslationService) {}

  ngOnInit() {
    this.translationService.currentLanguage$.subscribe(lang => {
      this.currentLang = lang;
    });
  }
}
