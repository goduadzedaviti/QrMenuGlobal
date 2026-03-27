import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container py-4 admin-page">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="d-flex align-items-center mb-4">
            <button class="btn btn-light rounded-pill px-3 shadow-sm border me-3" routerLink="/admin/dashboard">
              <i class="bi bi-arrow-left"></i>
            </button>
            <h1 class="h3 fw-bold text-dark mb-0">{{ translate('DASHBOARD_CHANGE_PASSWORD') }}</h1>
          </div>

          <div class="card shadow-sm border-0 rounded-4 overflow-hidden">
            <div class="card-body p-4 p-md-5">
              <div class="mb-3">
                <label class="form-label small text-muted text-uppercase fw-bold">{{ translate('PASSWORD_CURRENT') }}</label>
                <input type="password" [(ngModel)]="currentPassword" class="form-control form-control-lg rounded-3 border-2">
              </div>
              <div class="mb-3">
                <label class="form-label small text-muted text-uppercase fw-bold">{{ translate('PASSWORD_NEW') }}</label>
                <input type="password" [(ngModel)]="newPassword" class="form-control form-control-lg rounded-3 border-2">
              </div>
              <div class="mb-4">
                <label class="form-label small text-muted text-uppercase fw-bold">{{ translate('PASSWORD_CONFIRM') }}</label>
                <input type="password" [(ngModel)]="confirmPassword" class="form-control form-control-lg rounded-3 border-2">
              </div>

              <div *ngIf="message" class="alert mb-4 py-3 border-0 rounded-3 shadow-sm" [ngClass]="isError ? 'alert-danger' : 'alert-success'">
                <i class="bi me-2" [ngClass]="isError ? 'bi-exclamation-circle' : 'bi-check-circle'"></i> {{ message }}
              </div>

              <button class="btn btn-primary btn-lg w-100 rounded-pill py-3 shadow-sm fw-bold" 
                      (click)="changePassword()" 
                      [disabled]="isSubmitting || !currentPassword || !newPassword || newPassword !== confirmPassword">
                <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                {{ translate('BUTTON_CHANGE_PASSWORD') }}
              </button>
            </div>
          </div>
          
          <div class="text-center mt-4">
            <p class="text-muted small">Update your security settings regularly to keep your account safe.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-control:focus {
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.05);
    }
  `]
})
export class ChangePasswordComponent {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  isSubmitting = false;
  message = '';
  isError = false;

  constructor(private authService: AuthService, private translationService: TranslationService) {}
  
  translate(key: string): string {
    return this.translationService.translate(key);
  }

  changePassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.message = 'Passwords do not match';
      this.isError = true;
      return;
    }

    this.isSubmitting = true;
    this.message = '';
    const userId = this.authService.currentUserValue?.id;

    if (!userId) {
      this.message = 'User ID not found. Please log in again.';
      this.isError = true;
      this.isSubmitting = false;
      return;
    }

    this.authService.changePassword(userId, this.currentPassword, this.newPassword).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.message = this.translate('PASSWORD_CHANGE_SUCCESS');
        this.isError = false;
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.message = err.error?.resultData?.errors?.[0] || err.error?.errors?.[0] || this.translate('PASSWORD_CHANGE_ERROR');
        this.isError = true;
      }
    });
  }
}
