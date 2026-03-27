import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-shell">
        <div class="login-brand-panel">
          <div class="login-brand-badge">QR MENU</div>
          <h1 class="login-brand-title">Admin Panel</h1>
          <p class="login-brand-copy">
            Manage venues, categories, dishes and translations from one place with a layout that now works cleanly on desktop and mobile.
          </p>
        </div>

        <div class="login-box">
          <h2>{{ translate('LOGIN_TITLE') }}</h2>
          <p class="login-subtitle">Sign in to continue to your restaurant dashboard.</p>
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>{{ translate('LOGIN_USERNAME') }}</label>
            <input type="text" [(ngModel)]="username" name="username" required>
          </div>
          <div class="form-group">
            <label>{{ translate('LOGIN_PASSWORD') }}</label>
            <input type="password" [(ngModel)]="password" name="password" required>
          </div>
          <button type="submit" [disabled]="loading">{{ translate('LOGIN_BUTTON') }}</button>
          <div *ngIf="error" class="error">{{ error }}</div>
        </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1.25rem;
      background:
        radial-gradient(circle at top left, rgba(13, 110, 253, 0.16), transparent 32%),
        radial-gradient(circle at bottom right, rgba(25, 135, 84, 0.12), transparent 30%),
        #eef3f8;
    }
    .login-shell {
      width: min(980px, 100%);
      display: grid;
      grid-template-columns: minmax(280px, 1fr) minmax(320px, 420px);
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.8);
      border-radius: 28px;
      overflow: hidden;
      box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
      backdrop-filter: blur(18px);
    }
    .login-brand-panel {
      padding: 3rem;
      background: linear-gradient(160deg, #0f172a 0%, #1d4ed8 100%);
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      min-height: 100%;
    }
    .login-brand-badge {
      display: inline-flex;
      align-self: flex-start;
      padding: 0.45rem 0.8rem;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.12);
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      margin-bottom: 1.25rem;
    }
    .login-brand-title {
      font-size: clamp(2rem, 4vw, 3.3rem);
      line-height: 0.95;
      margin-bottom: 1rem;
      font-weight: 800;
    }
    .login-brand-copy {
      margin: 0;
      max-width: 32ch;
      color: rgba(255, 255, 255, 0.82);
      line-height: 1.6;
      font-size: 1rem;
    }
    .login-box {
      background: white;
      padding: 3rem 2.5rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .login-box h2 {
      margin-bottom: 0.5rem;
      font-size: 1.9rem;
      font-weight: 800;
      color: #0f172a;
    }
    .login-subtitle {
      margin-bottom: 2rem;
      color: #64748b;
      line-height: 1.5;
    }
    .form-group { margin-bottom: 1rem; }
    .form-group label {
      display: block;
      margin-bottom: 0.45rem;
      font-weight: 600;
      color: #334155;
    }
    input {
      width: 100%;
      padding: 0.95rem 1rem;
      border: 1px solid #d8e0ea;
      border-radius: 14px;
      background: #f8fafc;
      transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    }
    input:focus {
      outline: none;
      border-color: #60a5fa;
      box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.18);
      background: white;
    }
    button {
      width: 100%;
      padding: 0.95rem 1rem;
      background: linear-gradient(135deg, #0d6efd, #1d4ed8);
      color: white;
      border: none;
      border-radius: 14px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 700;
      margin-top: 0.75rem;
      box-shadow: 0 14px 30px rgba(29, 78, 216, 0.22);
    }
    button:disabled {
      background: #94a3b8;
      box-shadow: none;
      cursor: not-allowed;
    }
    .error {
      color: #dc2626;
      margin-top: 1rem;
      text-align: center;
      font-size: 0.95rem;
    }
    @media (max-width: 767.98px) {
      .login-container {
        align-items: stretch;
        padding: 0;
      }
      .login-shell {
        min-height: 100vh;
        border-radius: 0;
        grid-template-columns: 1fr;
        box-shadow: none;
      }
      .login-brand-panel {
        padding: 2rem 1.5rem 1.75rem;
        min-height: auto;
      }
      .login-brand-copy {
        max-width: none;
        font-size: 0.95rem;
      }
      .login-box {
        padding: 2rem 1.25rem 2.5rem;
      }
      .login-box h2 {
        font-size: 1.65rem;
      }
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router, private translationService: TranslationService) {}

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  onSubmit() {
    this.loading = true;
    this.authService.login(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/admin/dashboard']),
      error: err => {
        this.error = err;
        this.loading = false;
      }
    });
  }
}
