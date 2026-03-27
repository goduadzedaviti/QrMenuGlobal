import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DeviceAuthService } from '../core/device-auth.service';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="setup-shell d-flex align-items-center justify-content-center vh-100">
      <main class="setup-card">
        <header class="text-center mb-5">
          <div class="icon-circle mb-4">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 15V17M12 7V13M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h1 class="fw-bold">Kitchen Setup</h1>
          <p class="muted-text">Initialize this machine for your restaurant</p>
        </header>

        <section class="setup-form">
          <div class="field-group mb-4">
            <label>Restaurant Setup Code</label>
            <input 
              type="text" 
              class="setup-input" 
              [(ngModel)]="setupCode" 
              placeholder="00000000-0000-0000-0000-000000000000"
              [disabled]="loading()"
            >
            <small class="hint">Found in Admin Panel -> Venues</small>
          </div>

          <button 
            class="setup-btn" 
            (click)="saveSetup()" 
            [disabled]="!setupCode || loading()"
          >
            {{ loading() ? 'Configuring System...' : 'Link Machine' }}
          </button>
        </section>
      </main>
    </div>
  `,
  styles: [`
    .setup-shell {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .setup-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 48px;
      width: 100%;
      max-width: 480px;
      box-shadow: var(--shadow);
    }
    .icon-circle {
      width: 80px;
      height: 80px;
      background: var(--surface-soft);
      color: var(--accent);
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
    }
    h1 { color: var(--text); margin-bottom: 8px; font-size: 2rem; }
    .muted-text { color: var(--muted); margin-bottom: 0; }
    .field-group label {
      display: block;
      color: var(--text);
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .setup-input {
      width: 100%;
      background: var(--surface-alt);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
      color: var(--text);
      font-family: monospace;
      font-size: 1rem;
      margin-bottom: 8px;
    }
    .setup-input:focus {
      outline: none;
      border-color: var(--accent);
    }
    .hint { color: var(--muted); font-size: 0.8rem; }
    .setup-btn {
      width: 100%;
      background: var(--accent);
      color: #fff;
      border: none;
      border-radius: 12px;
      padding: 16px;
      font-weight: 700;
      font-size: 1.1rem;
      margin-top: 24px;
      transition: background 0.2s;
    }
    .setup-btn:hover:not(:disabled) {
      background: var(--accent-strong);
    }
    .setup-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class SetupComponent {
  setupCode = '';
  readonly loading = signal(false);

  constructor(
    private readonly deviceAuth: DeviceAuthService,
    private readonly router: Router
  ) {}

  async saveSetup() {
    if (!this.setupCode) return;
    
    this.loading.set(true);
    try {
      this.deviceAuth.setRestaurantId(this.setupCode.trim());
      // Try to register to verify it's a valid ID
      await this.deviceAuth.ensureRegistered();
      this.router.navigate(['/']);
    } catch (err: any) {
      const errorMsg = err.message || JSON.stringify(err);
      alert(`Error linking machine: ${errorMsg}\n\nCheck your connection and setup code.`);
    } finally {
      this.loading.set(false);
    }
  }
}
