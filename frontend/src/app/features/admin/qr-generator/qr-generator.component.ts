import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '../../../core/services/translation.service';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-qr-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4 admin-page">
      <div class="row mb-4 align-items-center">
        <div class="col">
          <h1 class="h3 mb-0 text-gray-800 fw-bold">{{ translate('SIDEBAR_QR_GENERATOR') || 'QR გენერატორი' }}</h1>
        </div>
      </div>

      <div class="card shadow-sm border-0 rounded-4">
        <div class="card-body p-4">
          <div class="row align-items-end mb-4">
            <div class="col-md-9">
              <label class="form-label fw-bold text-muted">{{ translate('ჩაწერეთ ლინკი (URL) ') || 'ჩაწერეთ ლინკი (URL)' }}</label>
              <input type="text" class="form-control form-control-lg bg-light" [(ngModel)]="qrData" placeholder="https://..." (keyup.enter)="generateQR()" />
            </div>
            <div class="col-md-3 mt-3 mt-md-0 d-grid">
              <button class="btn btn-primary btn-lg rounded-pill shadow-sm" (click)="generateQR()" [disabled]="!qrData">
                <i class="bi bi-qr-code me-2"></i> {{ translate('QR გენერირება') || 'გენერირება' }}
              </button>
            </div>
          </div>

          <div class="text-center mt-5" *ngIf="qrImageUrl">
            <div class="d-inline-block border rounded-4 p-4 bg-white shadow-sm mb-4 transition-all hover-scale">
              <img [src]="qrImageUrl" alt="Generated QR Code" class="img-fluid" style="min-width: 250px; min-height: 250px;" />
            </div>
            <div>
              <button class="btn btn-outline-success btn-lg rounded-pill px-5 shadow-sm" (click)="downloadQR()">
                <i class="bi bi-download me-2"></i> {{ translate('გადმოწერა') || 'გადმოწერა' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hover-scale:hover {
      transform: scale(1.02);
      transition: transform 0.3s ease;
    }
    .transition-all {
      transition: all 0.3s ease;
    }
  `]
})
export class QrGeneratorComponent {
  qrData: string = '';
  qrImageUrl: string | null = null;

  constructor(private translationService: TranslationService) { }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  async generateQR() {
    if (!this.qrData) return;
    try {
      this.qrImageUrl = await QRCode.toDataURL(this.qrData, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
    } catch (err) {
      console.error('Error generating QR code', err);
    }
  }

  downloadQR() {
    if (!this.qrImageUrl) return;
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = this.qrImageUrl;
    link.click();
  }
}
