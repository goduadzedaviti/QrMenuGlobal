import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ImageService } from '../../../core/services/image.service';
import { TranslationService } from '../../../core/services/translation.service';
import { environment } from '../../../../environments/environment';
import { timeout } from 'rxjs';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DragDropModule],
  template: `
    <div class="container mt-4 pb-5 admin-page">
      <!-- Breadcrumbs & Nav -->
      <nav class="mb-3">
        <ol class="breadcrumb mb-2">
          <li class="breadcrumb-item"><a routerLink="/admin" class="text-decoration-none text-muted small">{{ translate('BREADCRUMB_HOME') }}</a></li>
          <li class="breadcrumb-item"><a routerLink="/admin/objects" class="text-decoration-none text-muted small">{{ translate('BREADCRUMB_VENUES') }}</a></li>
          <li class="breadcrumb-item active small text-primary" aria-current="page">{{ objectName || '...' }}</li>
        </ol>
        <div class="admin-toolbar">
          <div class="admin-toolbar__left">
            <button class="btn btn-light rounded-pill px-3 shadow-sm border" [routerLink]="['/admin/objects']">
              <i class="bi bi-arrow-left me-2"></i>{{ translate('NAV_BACK_TO_VENUES') }}
            </button>
            <h2 class="fw-bold text-dark admin-toolbar__title">{{ translate('MENU_TITLE') }}</h2>
          </div>
          <div class="admin-toolbar__right">
          <button class="btn btn-primary rounded-pill px-4 shadow-sm" (click)="openCreate()">
            <i class="bi bi-plus-lg me-2"></i>{{ translate('MENU_ADD_BUTTON') }}
          </button>
          </div>
        </div>
      </nav>
 
      <div class="menu-list" cdkDropList (cdkDropListDropped)="drop($event)">
        <div *ngFor="let menu of menus" cdkDrag class="card shadow-sm mb-3 rounded-4 border-0 hover-card drag-item">
          <div class="card-body p-3">
            <div class="d-flex flex-row align-items-center gap-3">
              
              <!-- Drag Handle -->
              <div class="drag-handle text-muted" cdkDragHandle>
                <i class="bi bi-grip-vertical fs-4" style="cursor: grab;"></i>
              </div>

              <!-- Left Side: Image + Info -->
              <div class="d-flex align-items-center flex-grow-1 overflow-hidden">
                <div class="flex-shrink-0" *ngIf="menu.imageUrl">
                  <img [src]="getFullUrl(menu.imageUrl)" class="rounded-3 shadow-sm" style="width: 60px; height: 60px; object-fit: cover;">
                </div>
                <div class="flex-shrink-0 bg-light rounded-3 d-flex align-items-center justify-content-center" *ngIf="!menu.imageUrl" style="width: 60px; height: 60px;">
                  <i class="bi bi-image text-muted opacity-50"></i>
                </div>
                <div class="ms-3 text-truncate">
                  <h5 class="mb-0 fw-bold text-dark text-truncate">{{ menu.name }}</h5>
                  <p class="mb-0 text-muted small text-truncate d-none d-sm-block">{{ menu.description || 'No description provided' }}</p>
                </div>
              </div>
 
              <!-- Right Side: Actions -->
              <div class="d-flex align-items-center gap-2">
                <div class="btn-group shadow-sm rounded-3 overflow-hidden">
                  <button class="btn btn-white btn-sm px-3 border-end" [routerLink]="['/admin/menu-items', menu.id]" title="Items">
                    <i class="bi bi-list-ul text-primary"></i>
                  </button>
                  <button class="btn btn-white btn-sm px-3 border-end" (click)="edit(menu)" title="Edit">
                    <i class="bi bi-pencil-square text-primary"></i>
                  </button>
                  <button class="btn btn-white btn-sm px-3" (click)="delete(menu.id)" title="Delete">
                    <i class="bi bi-trash3 text-danger"></i>
                  </button>
                </div>
              </div>
 
            </div>
          </div>
          
          <!-- Drag Preview Placeholder -->
          <div *cdkDragPlaceholder class="drag-placeholder rounded-4"></div>
        </div>
      </div>
 
      <!-- Empty State -->
      <div *ngIf="menus.length === 0" class="text-center py-5">
        <div class="text-muted mb-3">{{ translate('VENUE_EMPTY_STATE') }}</div>
        <button class="btn btn-outline-primary rounded-pill" (click)="openCreate()">{{ translate('MENU_ADD_BUTTON') }}</button>
      </div>
 
      <div class="modal modal-lg" *ngIf="isModalOpen" style="display: block; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div class="modal-header bg-primary text-white border-0 py-3">
              <h5 class="modal-title fw-bold">
                <i class="bi {{ editingMenu.id ? 'bi-pencil-square' : 'bi-plus-circle' }} me-2"></i>
                {{ editingMenu.id ? translate('BUTTON_EDIT') : translate('MENU_CREATE_BUTTON') }}
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="closeModal()"></button>
            </div>
            <div class="modal-body p-4">
              <div class="row">
                <div class="col-md-7">
                  <!-- Language Tabs -->
                  <div class="btn-group btn-group-sm w-100 mb-4 shadow-sm rounded-3">
                    <button type="button" class="btn" [ngClass]="activeLang === 'ka' ? 'btn-primary' : 'btn-outline-primary'" (click)="activeLang = 'ka'">ქართული</button>
                    <button type="button" class="btn" [ngClass]="activeLang === 'en' ? 'btn-primary' : 'btn-outline-primary'" (click)="activeLang = 'en'">English</button>
                    <button type="button" class="btn" [ngClass]="activeLang === 'ru' ? 'btn-primary' : 'btn-outline-primary'" (click)="activeLang = 'ru'">Русский</button>
                  </div>

                  <!-- Georgian Fields -->
                  <div *ngIf="activeLang === 'ka'">
                    <div class="mb-3">
                      <label class="form-label fw-bold small text-uppercase text-muted">{{ translate('FIELD_NAME_KA') }}</label>
                      <input [(ngModel)]="editingMenu.name" class="form-control form-control-lg rounded-3 border-2" [placeholder]="translate('MENU_NAME_LABEL')">
                    </div>
                    <div class="mb-3">
                      <label class="form-label fw-bold small text-uppercase text-muted">{{ translate('FIELD_DESCRIPTION_KA') }}</label>
                      <textarea [(ngModel)]="editingMenu.description" class="form-control rounded-3 border-2" [placeholder]="translate('VENUE_DESCRIPTION_LABEL')" rows="4"></textarea>
                    </div>
                  </div>

                  <!-- English Fields -->
                  <div *ngIf="activeLang === 'en'">
                    <div class="mb-3">
                      <label class="form-label fw-bold small text-uppercase text-muted">{{ translate('FIELD_NAME_EN') }}</label>
                      <input [(ngModel)]="editingMenu.nameEn" class="form-control form-control-lg rounded-3 border-2" placeholder="Name (English)">
                    </div>
                    <div class="mb-3">
                      <label class="form-label fw-bold small text-uppercase text-muted">{{ translate('FIELD_DESCRIPTION_EN') }}</label>
                      <textarea [(ngModel)]="editingMenu.descriptionEn" class="form-control rounded-3 border-2" placeholder="Description (English)" rows="4"></textarea>
                    </div>
                  </div>

                  <!-- Russian Fields -->
                  <div *ngIf="activeLang === 'ru'">
                    <div class="mb-3">
                      <label class="form-label fw-bold small text-uppercase text-muted">{{ translate('FIELD_NAME_RU') }}</label>
                      <input [(ngModel)]="editingMenu.nameRu" class="form-control form-control-lg rounded-3 border-2" placeholder="Название (Русский)">
                    </div>
                    <div class="mb-3">
                      <label class="form-label fw-bold small text-uppercase text-muted">{{ translate('FIELD_DESCRIPTION_RU') }}</label>
                      <textarea [(ngModel)]="editingMenu.descriptionRu" class="form-control rounded-3 border-2" placeholder="Описание (Русский)" rows="4"></textarea>
                    </div>
                  </div>
                </div>
                <div class="col-md-5 mt-3 mt-md-0 border-start ps-md-4">
                  <label class="form-label fw-bold small text-uppercase text-muted d-block">{{ translate('VENUE_PHOTO_LABEL') }}</label>
                  
                  <div class="image-upload-container text-start p-3 border-2 border-dashed rounded-4 bg-light mb-3" 
                       style="border-style: dashed !important; border-color: #dee2e6 !important;">
                    <div *ngIf="!editingMenu.imageUrl && !isUploading" (click)="fileInput.click()" style="cursor: pointer;">
                      <i class="bi bi-cloud-arrow-up display-4 text-muted"></i>
                      <p class="small text-muted mt-2">Click to upload</p>
                    </div>
                    
                    <div *ngIf="isUploading" class="py-4">
                      <div class="spinner-border text-primary" role="status"></div>
                    </div>

                    <div *ngIf="editingMenu.imageUrl && !isUploading" class="d-inline-block text-start">
                      <img [src]="getFullUrl(editingMenu.imageUrl)" class="img-fluid rounded-3 shadow-sm mb-2 max-h-150 d-block">
                      <div class="mt-2 d-flex justify-content-between align-items-center">
                         <button class="btn btn-sm btn-outline-primary rounded-pill px-3" (click)="fileInput.click()">
                           <i class="bi bi-pencil-square me-1"></i> {{ translate('BUTTON_EDIT') }}
                         </button>
                         <button class="btn btn-sm btn-outline-danger rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;" (click)="editingMenu.imageUrl = null" title="Remove Image">
                           <i class="bi bi-trash m-0"></i>
                         </button>
                      </div>
                    </div>
                    
                    <input #fileInput type="file" class="d-none" (change)="onFileSelected($event)" accept="image/*">
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer border-0 bg-light py-3 px-4">
              <button type="button" class="btn btn-link text-muted text-decoration-none fw-bold me-auto" (click)="closeModal()">{{ translate('BUTTON_CANCEL') }}</button>
              <button type="button" class="btn btn-primary rounded-pill px-5 py-2 shadow-sm fw-bold" (click)="save()" [disabled]="isUploading">
                {{ editingMenu.id ? translate('MENU_UPDATE_BUTTON') : translate('MENU_CREATE_BUTTON') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hover-card {
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(0,0,0,0.05) !important;
    }
    .hover-card:hover {
      box-shadow: 0 0.5rem 1.5rem rgba(0,0,0,0.06) !important;
      border-color: rgba(13, 110, 253, 0.15) !important;
    }
    .drag-handle { cursor: grab; padding-right: 5px; }
    .drag-handle:active { cursor: grabbing; }
    
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 1rem;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1) !important;
      background: white;
    }
    .cdk-drag-placeholder { opacity: 0.1; }
    .cdk-drag-animating { transition: transform 250ms cubic-bezier(0, 0, 0.2, 1); }
    .menu-list.cdk-drop-list-dragging .drag-item:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    .btn-white { background: white; border: 1px solid #eee; }
    .btn-white:hover { background: #f8f9fa; }
    .max-h-150 { max-height: 150px; object-fit: contain; }
  `]
})
export class MenuManagementComponent implements OnInit {
  menus: any[] = [];
  objectId: any;
  objectName: string = '';
  isModalOpen = false;
  editingMenu: any = {};
  isUploading = false;
  activeLang: 'ka' | 'en' | 'ru' = 'ka';

  constructor(private api: ApiService, private route: ActivatedRoute, private imageService: ImageService, private translationService: TranslationService) {}

  ngOnInit() {
    this.objectId = this.route.snapshot.paramMap.get('objectId');
    this.loadMenus();
    this.loadObjectName();
  }

  loadObjectName() {
    this.api.get(`/admin/objects/${this.objectId}`).subscribe(res => {
      this.objectName = res.resultData.name;
    });
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  getFullUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${environment.baseUrl}${url}`;
  }

  loadMenus() {
    this.api.get(`/admin/menus/by-object/${this.objectId}`).subscribe(res => {
      this.menus = res.resultData.sort((a: any, b: any) => a.sortOrder - b.sortOrder);
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.menus, event.previousIndex, event.currentIndex);
    this.updateOrders();
  }

  updateOrders() {
    const menusOrder = this.menus.map((item, index) => ({
      id: item.id,
      sortOrder: index
    }));

    this.api.put('/admin/menus/update-order', { items: menusOrder }).subscribe({
      next: () => {
        this.menus.forEach((item, index) => item.sortOrder = index);
      },
      error: (err) => {
        console.error('Failed to update menu order', err);
        this.loadMenus();
      }
    });
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isUploading = true;
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Process timed out')), 30000)
      );

      try {
        const resizedBlob = (await Promise.race([
          this.imageService.resizeImage(file),
          timeoutPromise
        ])) as Blob;

        const formData = new FormData();
        formData.append('file', resizedBlob, file.name);
        
        this.api.post('/admin/upload/image', formData).pipe(
          timeout(30000)
        ).subscribe({
          next: (res: any) => {
            this.editingMenu.imageUrl = res.imageUrl;
            this.isUploading = false;
          },
          error: (err: any) => {
            console.error('Menu upload error', err);
            this.isUploading = false;
            alert('Upload failed: ' + (err.message || 'Server error'));
          }
        });
      } catch (err: any) {
        console.error('Menu processing/upload failed', err);
        this.isUploading = false;
        alert('Failed: ' + err.message);
      }
    }
  }

  openCreate() {
    this.editingMenu = { objectId: this.objectId, sortOrder: 0, isActive: true };
    this.activeLang = 'ka';
    this.isModalOpen = true;
  }

  edit(menu: any) {
    this.editingMenu = { ...menu };
    this.activeLang = 'ka';
    this.isModalOpen = true;
  }

  save() {
    if (this.editingMenu.id) {
      this.api.put(`/admin/menus/${this.editingMenu.id}`, this.editingMenu).subscribe(() => {
        this.loadMenus();
        this.closeModal();
      });
    } else {
      this.api.post('/admin/menus', this.editingMenu).subscribe(() => {
        this.loadMenus();
        this.closeModal();
      });
    }
  }

  delete(id: string) {
    if (confirm(this.translate('CONFIRM_DELETE'))) {
      this.api.delete(`/admin/menus/${id}`).subscribe(() => this.loadMenus());
    }
  }

  closeModal() { this.isModalOpen = false; }
}
