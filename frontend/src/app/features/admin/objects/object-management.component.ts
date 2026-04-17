import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ImageService } from '../../../core/services/image.service';
import { TranslationService } from '../../../core/services/translation.service';
import { environment } from '../../../../environments/environment';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-object-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-4 admin-page">
      <!-- Breadcrumbs & Nav -->
      <nav class="mb-3">
        <ol class="breadcrumb mb-2">
          <li class="breadcrumb-item"><a routerLink="/admin" class="text-decoration-none text-muted small">{{ translate('BREADCRUMB_HOME') }}</a></li>
          <li class="breadcrumb-item active small text-primary" aria-current="page">{{ translate('BREADCRUMB_VENUES') }}</li>
        </ol>
        <div class="admin-toolbar">
          <div class="admin-toolbar__left">
            <button class="btn btn-light rounded-pill px-3 shadow-sm border" [routerLink]="['/admin']">
              <i class="bi bi-arrow-left me-2"></i>{{ translate('NAV_BACK') }}
            </button>
            <h2 class="fw-bold text-dark admin-toolbar__title">{{ translate('VENUE_TITLE') }}</h2>
          </div>
          <div class="admin-toolbar__right">
          <button class="btn btn-primary rounded-pill px-4 shadow-sm" (click)="openCreate()">
            <i class="bi bi-plus-lg me-2"></i>{{ translate('VENUE_ADD_BUTTON') }}
          </button>
          </div>
        </div>
      </nav>

      <div class="venue-list">
        <div *ngFor="let obj of objects" class="card shadow-sm mb-3 rounded-4 border-0 hover-card">
          <div class="card-body p-3">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              
              <!-- Left Side: Basic Info & Image -->
              <div class="d-flex align-items-center flex-grow-1">
                <div class="flex-shrink-0 rounded-3 d-flex align-items-center justify-content-center overflow-hidden" style="width: 64px; height: 64px; background: #f0f2f5;">
                  <img *ngIf="obj.imageUrl" [src]="getFullUrl(obj.imageUrl)" class="w-100 h-100 object-fit-cover">
                  <i *ngIf="!obj.imageUrl" class="bi bi-geo-alt fs-4 text-primary bg-primary bg-opacity-10 w-100 h-100 d-flex align-items-center justify-content-center"></i>
                </div>
                <div class="ms-3">
                  <h4 class="mb-1 fw-bold text-dark">{{ obj.name }}</h4>
                  <p class="mb-0 text-muted small"><i class="bi bi-map me-1"></i>{{ obj.address }}</p>
                  <div class="mt-1 d-flex align-items-center gap-2">
                    <span class="text-secondary x-small font-monospace bg-light px-2 py-1 rounded">Kitchen Code: {{ obj.id }}</span>
                    <button class="btn btn-sm btn-link p-0 text-primary" (click)="copyToClipboard(obj.id)" title="Copy ID">
                      <i class="bi bi-clipboard small"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Right Side: Status + Actions -->
              <div class="d-flex align-items-center justify-content-between justify-content-md-end gap-3 w-100 w-md-auto">
                <span class="badge rounded-pill px-3 py-2" [ngClass]="obj.isActive ? 'bg-success bg-opacity-10 text-success border border-success' : 'bg-secondary bg-opacity-10 text-secondary border'">
                  {{ obj.isActive ? translate('VENUE_STATUS_ACTIVE') : translate('VENUE_STATUS_INACTIVE') }}
                </span>
                
                <div class="btn-group shadow-sm rounded-3 overflow-hidden">
                  <button class="btn btn-info btn-sm text-white px-3" [routerLink]="['/admin/menus', obj.id]">{{ translate('BUTTON_MENUS') }}</button>
                  <button class="btn btn-outline-secondary btn-sm px-3" (click)="edit(obj)">{{ translate('BUTTON_EDIT') }}</button>
                  <button class="btn btn-outline-danger btn-sm px-3" (click)="delete(obj.id)">{{ translate('BUTTON_DELETE') }}</button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="objects.length === 0" class="text-center py-5">
        <div class="text-muted mb-3">{{ translate('VENUE_EMPTY_STATE') }}</div>
        <button class="btn btn-outline-primary" (click)="openCreate()">{{ translate('VENUE_CREATE_FIRST') }}</button>
      </div>

      <!-- Modal: Create/Edit Venue -->
      <div class="modal" *ngIf="isModalOpen" style="display: block; background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg rounded-4">
            <div class="modal-header border-0 pb-0">
              <h5 class="modal-title fw-bold">{{ editingObject.id ? translate('VENUE_MODAL_EDIT') : translate('VENUE_MODAL_CREATE') }}</h5>
              <button type="button" class="btn-close" (click)="closeModal()"></button>
            </div>
            <div class="modal-body pt-4">
              <!-- Photo Upload -->
              <div class="mb-3 text-center">
                <div class="d-inline-block position-relative">
                  <div class="rounded-4 overflow-hidden shadow-sm bg-light d-flex align-items-center justify-content-center" style="width: 150px; height: 100px; border: 2px dashed #dee2e6;">
                    <img *ngIf="editingObject.imageUrl && !isUploading" [src]="getFullUrl(editingObject.imageUrl)" class="w-100 h-100 object-fit-cover">
                    <div *ngIf="isUploading" class="p-3">
                      <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    </div>
                    <i *ngIf="!editingObject.imageUrl && !isUploading" class="bi bi-camera fs-1 text-muted"></i>
                  </div>
                  <button type="button" class="btn btn-sm btn-primary position-absolute bottom-0 end-0 rounded-circle shadow" (click)="fileInput.click()" [disabled]="isUploading" style="width: 32px; height: 32px; padding: 0;">
                    <i class="bi bi-pencil-fill small"></i>
                  </button>
                </div>
                <input #fileInput type="file" (change)="onFileSelected($event)" accept="image/*" class="d-none">
                <div class="mt-2 text-muted small">{{ isUploading ? 'Uploading...' : translate('VENUE_PHOTO_LABEL') }}</div>
              </div>

              <!-- Global Review Links -->
              <div class="mb-3">
                <label class="form-label fw-medium text-primary small"><i class="bi bi-google me-2"></i>Google Link</label>
                <input [(ngModel)]="editingObject.googleReviewUrl" class="form-control form-control-sm rounded-3 border-primary" placeholder="https://g.page/r/...">
              </div>
              <div class="mb-4">
                <label class="form-label fw-medium text-success small"><i class="bi bi-tripadvisor me-2"></i>TripAdvisor</label>
                <input [(ngModel)]="editingObject.tripAdvisorUrl" class="form-control form-control-sm rounded-3 border-success" placeholder="https://www.tripadvisor.com/...">
              </div>

              <!-- Language Tabs -->
              <div class="btn-group btn-group-sm w-100 mb-4 shadow-sm rounded-3">
                <button type="button" class="btn" [ngClass]="activeLang === 'ka' ? 'btn-primary' : 'btn-outline-primary'" (click)="activeLang = 'ka'">ქართული</button>
                <button type="button" class="btn" [ngClass]="activeLang === 'en' ? 'btn-primary' : 'btn-outline-primary'" (click)="activeLang = 'en'">English</button>
                <button type="button" class="btn" [ngClass]="activeLang === 'ru' ? 'btn-primary' : 'btn-outline-primary'" (click)="activeLang = 'ru'">Русский</button>
              </div>

              <!-- Georgian Fields -->
              <div *ngIf="activeLang === 'ka'">
                <div class="mb-3">
                  <label class="form-label fw-medium">{{ translate('FIELD_NAME_KA') }}</label>
                  <input [(ngModel)]="editingObject.name" class="form-control rounded-3" [placeholder]="translate('VENUE_NAME_LABEL')">
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">{{ translate('FIELD_ADDRESS_KA') }}</label>
                  <input [(ngModel)]="editingObject.address" class="form-control rounded-3" [placeholder]="translate('VENUE_ADDRESS_LABEL')">
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">{{ translate('FIELD_DESCRIPTION_KA') }}</label>
                  <textarea [(ngModel)]="editingObject.description" class="form-control rounded-3" [placeholder]="translate('VENUE_DESCRIPTION_LABEL')" rows="3"></textarea>
                </div>
              </div>

              <!-- English Fields -->
              <div *ngIf="activeLang === 'en'">
                <div class="mb-3">
                  <label class="form-label fw-medium">{{ translate('FIELD_NAME_EN') }}</label>
                  <input [(ngModel)]="editingObject.nameEn" class="form-control rounded-3" placeholder="Name (English)">
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">{{ translate('FIELD_ADDRESS_EN') }}</label>
                  <input [(ngModel)]="editingObject.addressEn" class="form-control rounded-3" placeholder="Address (English)">
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">{{ translate('FIELD_DESCRIPTION_EN') }}</label>
                  <textarea [(ngModel)]="editingObject.descriptionEn" class="form-control rounded-3" placeholder="Description (English)" rows="3"></textarea>
                </div>
              </div>

              <!-- Russian Fields -->
              <div *ngIf="activeLang === 'ru'">
                <div class="mb-3">
                  <label class="form-label fw-medium">{{ translate('FIELD_NAME_RU') }}</label>
                  <input [(ngModel)]="editingObject.nameRu" class="form-control rounded-3" placeholder="Название (Русский)">
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">{{ translate('FIELD_ADDRESS_RU') }}</label>
                  <input [(ngModel)]="editingObject.addressRu" class="form-control rounded-3" placeholder="Адрес (Русский)">
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">{{ translate('FIELD_DESCRIPTION_RU') }}</label>
                  <textarea [(ngModel)]="editingObject.descriptionRu" class="form-control rounded-3" placeholder="Описание (Русский)" rows="3"></textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer border-0">
              <button type="button" class="btn btn-light rounded-pill px-4" (click)="closeModal()" [disabled]="isUploading">{{ translate('BUTTON_CANCEL') }}</button>
              <button type="button" class="btn btn-primary rounded-pill px-4" (click)="save()" [disabled]="isUploading">
                {{ editingObject.id ? translate('VENUE_UPDATE_BUTTON') : translate('VENUE_CREATE_BUTTON') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hover-card {
      transition: all 0.25s ease-in-out;
      border: 1px solid rgba(0,0,0,0.05) !important;
    }
    .hover-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 0.5rem 1.5rem rgba(0,0,0,0.08) !important;
      border-color: rgba(13, 110, 253, 0.2) !important;
    }
    .card-body {
      background: #ffffff;
    }
    .x-small {
      font-size: 0.7rem;
    }
    @media (max-width: 767.98px) {
      .card-body { padding: 1.25rem; }
    }
  `]
})
export class ObjectManagementComponent implements OnInit {
  objects: any[] = [];
  isModalOpen = false;
  editingObject: any = {};
  isUploading = false;
  activeLang: 'ka' | 'en' | 'ru' = 'ka';

  constructor(private api: ApiService, private translationService: TranslationService, private imageService: ImageService, private ngZone: NgZone) {}

  ngOnInit() {
    this.loadObjects();
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  getFullUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${environment.baseUrl}${url}`;
  }

  loadObjects() {
    this.api.get('/admin/objects').subscribe(res => this.objects = res.resultData.data);
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isUploading = true;
      try {
        const resizedBlob = await this.imageService.resizeImage(file);
        const formData = new FormData();
        formData.append('file', resizedBlob, file.name);

        this.api.post('/admin/upload/image', formData).pipe(
          timeout(30000)
        ).subscribe({
          next: (res: any) => {
            this.ngZone.run(() => {
              this.editingObject.imageUrl = res.imageUrl;
              this.isUploading = false;
            });
          },
          error: (err: any) => {
            console.error('Venue photo upload error', err);
            this.ngZone.run(() => {
              this.isUploading = false;
            });
            alert('Upload failed: ' + (err.message || 'Server error'));
          }
        });
      } catch (err: any) {
        console.error('Venue photo processing failed', err);
        this.ngZone.run(() => {
          this.isUploading = false;
        });
        alert('Image processing failed: ' + err.message);
      }
    }
  }

  openCreate() {
    this.editingObject = { isActive: true };
    this.activeLang = 'ka';
    this.isModalOpen = true;
  }

  edit(obj: any) {
    this.editingObject = { ...obj };
    this.activeLang = 'ka';
    this.isModalOpen = true;
  }

  save() {
    if (this.editingObject.id) {
      this.api.put(`/admin/objects/${this.editingObject.id}`, this.editingObject).subscribe(() => {
        this.loadObjects();
        this.closeModal();
      });
    } else {
      this.api.post('/admin/objects', this.editingObject).subscribe(() => {
        this.loadObjects();
        this.closeModal();
      });
    }
  }

  delete(id: string) {
    if (confirm(this.translate('CONFIRM_DELETE'))) {
      this.api.delete(`/admin/objects/${id}`).subscribe(() => this.loadObjects());
    }
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  }

  closeModal() { this.isModalOpen = false; }
}
