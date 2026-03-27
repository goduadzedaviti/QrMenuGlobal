import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { TranslationService } from '../../../core/services/translation.service';
import { environment } from '../../../../environments/environment';
import { timeout } from 'rxjs';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-menu-item-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DragDropModule],
  template: `
    <div class="container mt-4 pb-5 admin-page">
      <!-- Breadcrumbs & Nav -->
      <nav class="mb-3">
        <ol class="breadcrumb mb-2">
          <li class="breadcrumb-item"><a routerLink="/admin" class="text-decoration-none text-muted small">{{ translate('BREADCRUMB_HOME') }}</a></li>
          <li class="breadcrumb-item"><a routerLink="/admin/objects" class="text-decoration-none text-muted small">{{ translate('BREADCRUMB_VENUES') }}</a></li>
          <li class="breadcrumb-item"><a [routerLink]="['/admin/menus', objectId]" class="text-decoration-none text-muted small">{{ objectName || '...' }}</a></li>
          <li class="breadcrumb-item active small text-primary" aria-current="page">{{ menuName || '...' }}</li>
        </ol>
        <div class="admin-toolbar">
          <div class="admin-toolbar__left">
            <button class="btn btn-light rounded-pill px-3 shadow-sm border" [routerLink]="['/admin/menus', objectId]">
              <i class="bi bi-arrow-left me-2"></i>{{ translate('NAV_BACK_TO_CATEGORIES') }}
            </button>
            <h2 class="fw-bold text-dark admin-toolbar__title">{{ translate('MENU_ITEM_TITLE') }}</h2>
          </div>
          <div class="admin-toolbar__right">
          <button class="btn btn-primary rounded-pill px-4 shadow-sm" (click)="openCreate()">
            <i class="bi bi-plus-lg me-2"></i>{{ translate('MENU_ITEM_ADD_BUTTON') }}
          </button>
          </div>
        </div>
      </nav>
 
      <div class="menu-item-list" cdkDropList (cdkDropListDropped)="drop($event)">
        <div *ngFor="let item of menuItems" cdkDrag class="card shadow-sm mb-3 rounded-4 border-0 hover-card drag-item">
          <div class="card-body p-3">
            <div class="menu-item-row">
              
              <!-- Drag Handle -->
              <div class="drag-handle text-muted" cdkDragHandle>
                <i class="bi bi-grip-vertical fs-4" style="cursor: grab;"></i>
              </div>

              <!-- Left Side: Image + Info -->
              <div class="menu-item-main">
                <div class="flex-shrink-0" *ngIf="item.imageUrl">
                  <img [src]="getFullUrl(item.imageUrl)" class="rounded-3 shadow-sm" style="width: 60px; height: 60px; object-fit: cover;">
                </div>
                <div class="flex-shrink-0 bg-light rounded-3 d-flex align-items-center justify-content-center" *ngIf="!item.imageUrl" style="width: 60px; height: 60px;">
                  <i class="bi bi-image text-muted opacity-50"></i>
                </div>
                <div class="menu-item-copy">
                  <div class="menu-item-heading">
                    <h5 class="mb-0 fw-bold text-dark menu-item-title">{{ item.name }}</h5>
                    <span class="badge rounded-pill" [class.text-bg-success]="item.isAvailable" [class.text-bg-secondary]="!item.isAvailable">
                      {{ item.isAvailable ? 'Visible' : 'Hidden' }}
                    </span>
                  </div>
                  <p class="mb-0 text-muted small menu-item-description">{{ item.description || 'No description' }}</p>
                </div>
              </div>
 
              <!-- Right Side: Price + Actions -->
              <div class="menu-item-actions">
                <div class="text-end me-3 menu-item-price">
                  <span class="d-block fw-bold text-primary">{{ item.price | currency }}</span>
                </div>
                
                <div class="btn-group shadow-sm rounded-3 overflow-hidden">
                  <button class="btn btn-white btn-sm px-3 border-end" (click)="edit(item)" title="Edit">
                    <i class="bi bi-pencil-square text-primary"></i>
                  </button>
                  <button class="btn btn-white btn-sm px-3" (click)="delete(item.id)" title="Delete">
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
      <div *ngIf="menuItems.length === 0" class="text-center py-5">
        <div class="text-muted mb-3">{{ translate('VENUE_EMPTY_STATE') }}</div>
        <button class="btn btn-outline-primary rounded-pill" (click)="openCreate()">{{ translate('MENU_ITEM_ADD_BUTTON') }}</button>
      </div>
 
      <!-- Modal: Create/Edit Dish -->
      <div class="modal modal-xl" *ngIf="isModalOpen" style="display: block; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div class="modal-header bg-primary text-white border-0 py-3">
              <h5 class="modal-title fw-bold">
                <i class="bi {{ editingItem.id ? 'bi-pencil-square' : 'bi-plus-circle' }} me-2"></i>
                {{ editingItem.id ? translate('BUTTON_EDIT') : translate('MENU_ITEM_CREATE_BUTTON') }}
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="closeModal()"></button>
            </div>
            <div class="modal-body p-4">
              <div class="row">
                <div class="col-md-8">
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
                      <input [(ngModel)]="editingItem.name" class="form-control form-control-lg rounded-3 border-2" [placeholder]="translate('MENU_ITEM_NAME_LABEL')">
                    </div>
                    <div class="mb-3">
                      <label class="form-label fw-bold small text-uppercase text-muted">{{ translate('FIELD_DESCRIPTION_KA') }}</label>
                      <textarea [(ngModel)]="editingItem.description" class="form-control rounded-3 border-2" [placeholder]="translate('VENUE_DESCRIPTION_LABEL')" rows="4"></textarea>
                    </div>
                  </div>

                  <!-- English Fields -->
                  <div *ngIf="activeLang === 'en'">
                    <div class="mb-3">
                      <label class="form-label fw-bold small text-uppercase text-muted">{{ translate('FIELD_NAME_EN') }}</label>
                      <input [(ngModel)]="editingItem.nameEn" class="form-control form-control-lg rounded-3 border-2" placeholder="Name (English)">
                    </div>
                    <div class="mb-3">
                      <label class="form-label fw-bold small text-uppercase text-muted">{{ translate('FIELD_DESCRIPTION_EN') }}</label>
                      <textarea [(ngModel)]="editingItem.descriptionEn" class="form-control rounded-3 border-2" placeholder="Description (English)" rows="4"></textarea>
                    </div>
                  </div>

                  <!-- Russian Fields -->
                  <div *ngIf="activeLang === 'ru'">
                    <div class="mb-3">
                      <label class="form-label fw-bold small text-uppercase text-muted">{{ translate('FIELD_NAME_RU') }}</label>
                      <input [(ngModel)]="editingItem.nameRu" class="form-control form-control-lg rounded-3 border-2" placeholder="Название (Русский)">
                    </div>
                    <div class="mb-3">
                      <label class="form-label fw-bold small text-uppercase text-muted">{{ translate('FIELD_DESCRIPTION_RU') }}</label>
                      <textarea [(ngModel)]="editingItem.descriptionRu" class="form-control rounded-3 border-2" placeholder="Описание (Русский)" rows="4"></textarea>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-6 mb-4">
                      <label class="form-label fw-bold small text-uppercase text-muted">{{ translate('MENU_ITEM_PRICE_LABEL') }} (₾)</label>
                      <div class="input-group">
                        <span class="input-group-text rounded-start-3 border-2 bg-light border-end-0">₾</span>
                        <input type="number" [(ngModel)]="editingItem.price" class="form-control rounded-end-3 border-2 border-start-0 py-2">
                      </div>
                    </div>
                    <div class="col-6 mb-4 d-flex align-items-end">
                      <div class="form-check form-switch fs-6 mb-2">
                        <input
                          id="menu-item-visibility"
                          type="checkbox"
                          class="form-check-input"
                          [(ngModel)]="editingItem.isAvailable">
                        <label class="form-check-label fw-bold text-dark" for="menu-item-visibility">
                          {{ editingItem.isAvailable ? 'Visible to customers' : 'Hidden from customers' }}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-4 mt-3 mt-md-0 border-start ps-md-4">
                  <label class="form-label fw-bold small text-uppercase text-muted d-block">{{ translate('VENUE_PHOTO_LABEL') }}</label>
                  
                  <div class="image-upload-container text-center p-3 border-2 border-dashed rounded-4 bg-light mb-3" 
                       style="border-style: dashed !important; border-color: #dee2e6 !important;">
                    <div *ngIf="!editingItem.imageUrl && !isUploading" (click)="fileInput.click()" style="cursor: pointer;">
                      <i class="bi bi-cloud-arrow-up display-4 text-muted"></i>
                      <p class="small text-muted mt-2">Click to upload image</p>
                    </div>
                    
                    <div *ngIf="isUploading" class="py-4">
                      <div class="spinner-border text-primary" role="status"></div>
                      <p class="small text-muted mt-2">Uploading...</p>
                    </div>

                    <div *ngIf="editingItem.imageUrl && !isUploading" class="position-relative group">
                      <img [src]="getFullUrl(editingItem.imageUrl)" class="img-fluid rounded-3 shadow-sm mb-2 max-h-200">
                      <div class="mt-2 d-flex justify-content-center gap-2">
                         <button class="btn btn-sm btn-outline-primary rounded-pill px-3" (click)="fileInput.click()">
                           <i class="bi bi-arrow-repeat me-1"></i> {{ translate('BUTTON_EDIT') }}
                         </button>
                         <button class="btn btn-sm btn-outline-danger rounded-pill px-3" (click)="editingItem.imageUrl = null">
                           <i class="bi bi-trash"></i> Remove
                         </button>
                      </div>
                    </div>
                    
                    <input #fileInput type="file" class="d-none" (change)="onFileSelected($event)" accept="image/*">
                  </div>

                  <div class="alert alert-info py-2 small border-0 rounded-3 mb-0">
                    <i class="bi bi-info-circle me-2"></i> Max size 2MB. Square images work best.
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer border-0 bg-light py-3 px-4">
              <button type="button" class="btn btn-link text-muted text-decoration-none fw-bold me-auto" (click)="closeModal()">{{ translate('BUTTON_CANCEL') }}</button>
              <button type="button" class="btn btn-primary rounded-pill px-5 py-2 shadow-sm fw-bold" (click)="save()" [disabled]="isUploading">
                {{ editingItem.id ? translate('MENU_ITEM_UPDATE_BUTTON') : translate('MENU_ITEM_CREATE_BUTTON') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .toolbar__left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .back-button {
      border: 1px solid rgba(13, 110, 253, 0.15);
      color: #0d6efd;
      font-weight: 600;
    }
    .menu-item-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      min-width: 0;
    }
    .menu-item-main {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
    }
    .menu-item-copy {
      min-width: 0;
      flex: 1 1 auto;
    }
    .menu-item-heading {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 0;
      flex-wrap: wrap;
    }
    .menu-item-title {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .menu-item-description {
      margin-top: 0.25rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      word-break: break-word;
      line-height: 1.4;
    }
    .menu-item-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 0 0 auto;
    }
    .menu-item-price {
      min-width: 90px;
    }
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
    .menu-item-list.cdk-drop-list-dragging .drag-item:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    .btn-white { background: white; border: 1px solid #eee; }
    .btn-white:hover { background: #f8f9fa; }
    .max-h-200 { max-height: 180px; object-fit: contain; }
    @media (max-width: 991px) {
      .menu-item-row {
        align-items: flex-start;
      }
      .menu-item-actions {
        flex-direction: column;
        align-items: flex-end;
      }
      .menu-item-price {
        min-width: auto;
        margin-right: 0 !important;
      }
    }
    @media (max-width: 767px) {
      .menu-item-row {
        flex-wrap: wrap;
      }
      .menu-item-main {
        width: 100%;
      }
      .menu-item-actions {
        width: 100%;
        flex-direction: row;
        justify-content: space-between;
        padding-left: 2rem;
      }
      .toolbar {
        align-items: stretch;
      }
      .toolbar__left {
        align-items: flex-start;
      }
    }
  `]
})
export class MenuItemManagementComponent implements OnInit {
  menuItems: any[] = [];
  menuId: any;
  menuName: string = '';
  objectId: any = null;
  objectName: string = '';
  isModalOpen = false;
  editingItem: any = {};
  isUploading = false;
  activeLang: 'ka' | 'en' | 'ru' = 'ka';

  constructor(private api: ApiService, private route: ActivatedRoute, private translationService: TranslationService, private location: Location) {}

  ngOnInit() {
    this.menuId = this.route.snapshot.paramMap.get('menuId');
    this.loadMenuItems();
    this.loadMenuDetails();
  }

  loadMenuDetails() {
    this.api.get(`/admin/menus/${this.menuId}`).subscribe(res => {
      this.menuName = res.resultData.name;
      this.objectId = res.resultData.objectId;
      this.loadObjectName();
    });
  }

  loadObjectName() {
    if (this.objectId) {
      this.api.get(`/admin/objects/${this.objectId}`).subscribe(res => {
        this.objectName = res.resultData.name;
      });
    }
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  getFullUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${environment.baseUrl}${url}`;
  }

  loadMenuItems() {
    this.api.get(`/admin/menu-items/by-menu/${this.menuId}`).subscribe(res => {
      this.menuItems = res.resultData.sort((a: any, b: any) => a.sortOrder - b.sortOrder);
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.menuItems, event.previousIndex, event.currentIndex);
    this.updateOrders();
  }

  updateOrders() {
    const itemsOrder = this.menuItems.map((item, index) => ({
      id: item.id,
      sortOrder: index
    }));

    this.api.put('/admin/menu-items/update-order', { items: itemsOrder }).subscribe({
      next: () => {
        this.menuItems.forEach((item, index) => item.sortOrder = index);
      },
      error: (err) => {
        console.error('Failed to update order', err);
        this.loadMenuItems();
      }
    });
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isUploading = true;
      try {
        const formData = new FormData();
        formData.append('file', file, file.name);
        
        this.api.post('/admin/upload/image', formData).pipe(
          timeout(30000)
        ).subscribe({
          next: (res: any) => {
            this.editingItem.imageUrl = res.imageUrl;
            this.isUploading = false;
          },
          error: (err) => {
            console.error('Upload error', err);
            this.isUploading = false;
            alert('Upload failed: ' + (err.message || 'Server error'));
          }
        });
      } catch (err: any) {
        console.error('Image processing/upload failed', err);
        this.isUploading = false;
        alert('Failed: ' + err.message);
      }
    }
  }

  openCreate() {
    this.editingItem = { menuId: this.menuId, price: 0, sortOrder: 0, isAvailable: true };
    this.activeLang = 'ka';
    this.isModalOpen = true;
  }

  edit(item: any) {
    this.editingItem = { ...item, isAvailable: item.isAvailable ?? true };
    this.activeLang = 'ka';
    this.isModalOpen = true;
  }

  save() {
    if (this.editingItem.id) {
      this.api.put(`/admin/menu-items/${this.editingItem.id}`, this.editingItem).subscribe(() => {
        this.loadMenuItems();
        this.closeModal();
      });
    } else {
      this.api.post('/admin/menu-items', this.editingItem).subscribe(() => {
        this.loadMenuItems();
        this.closeModal();
      });
    }
  }

  delete(id: string) {
    if (confirm(this.translate('CONFIRM_DELETE'))) {
      this.api.delete(`/admin/menu-items/${id}`).subscribe(() => this.loadMenuItems());
    }
  }

  goBackToMenus() {
    this.location.back();
  }

  closeModal() { this.isModalOpen = false; }
}
