import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid py-4 admin-page">
      <div class="row justify-content-center">
        <div class="col-lg-10">
          <h1 class="mb-4 fw-bold text-dark">{{ translate('DASHBOARD_TITLE') }}</h1>
          <div class="card shadow-sm border-0 rounded-4 overflow-hidden mb-4 p-2">
            <div class="card-body p-4">
              <div class="row align-items-center">
                <div class="col-md-8">
                  <h3 class="fw-bold text-primary mb-3">{{ translate('DASHBOARD_WELCOME') }}</h3>
                  <p class="text-muted fs-5 mb-4">მართეთ ობიექტები, მენიუები და კერძები. </p>
                  <div class="d-flex gap-3 flex-column flex-sm-row">
                    <a routerLink="/admin/objects" class="btn btn-primary btn-lg rounded-pill px-5 shadow-sm">{{ translate('SIDEBAR_MANAGE_VENUES') }}</a>
                    <a routerLink="/admin/change-password" class="btn btn-outline-secondary btn-lg rounded-pill px-4 shadow-sm fw-bold">{{ translate('SIDEBAR_CHANGE_PASSWORD') }}</a>
                  </div>
                </div>
                <div class="col-md-4 d-none d-md-block text-center mt-3 mt-md-0">
                  <i class="bi bi-speedometer2 display-1 text-primary opacity-25"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [``]
})
export class DashboardComponent {
  constructor(private authService: AuthService, private translationService: TranslationService) { }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  logout() { this.authService.logout(); }
}
