import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { TranslationService } from '../../../core/services/translation.service';
import { environment } from '../../../../environments/environment';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-object-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="detail-container" *ngIf="object">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div class="back-link btn btn-link text-decoration-none p-0" routerLink="/">
          <i class="bi bi-arrow-left me-2"></i>{{ translate('PUBLIC_BACK_TO_VENUES') }}
        </div>
        
        <div class="lang-nav d-flex gap-2">
          <button *ngFor="let lang of activeLanguages" 
                  (click)="setLang(lang)"
                  class="btn btn-sm rounded-pill px-3"
                  [class.btn-dark]="currentLang === lang"
                  [class.btn-outline-dark]="currentLang !== lang">
            {{ getFlag(lang) }} {{ lang.toUpperCase() }}
          </button>
        </div>
      </div>
      
      <div class="header-section mb-5">
        <div class="hero-wrapper rounded-4 shadow-lg overflow-hidden mb-4">
          <img [src]="getFullUrl(object.imageUrl)" [alt]="translateField(object, 'Name')" class="hero-image">
        </div>
        <div class="header-info text-center">
          <h1 class="display-4 fw-bold mb-3">{{ translateField(object, 'Name') }}</h1>
          <p class="lead text-muted mx-auto" style="max-width: 700px;">{{ translateField(object, 'Description') }}</p>
          <div class="meta text-muted d-flex justify-content-center gap-3">
            <span *ngIf="object.address"><i class="bi bi-geo-alt me-1"></i>{{ translateField(object, 'Address') }}</span>
            <span *ngIf="object.phone"><i class="bi bi-telephone me-1"></i>{{ object.phone }}</span>
          </div>
        </div>
      </div>

      <div class="menus-section">
        <h2 class="fw-bold mb-4 text-center">{{ translate('PUBLIC_MENU_TAB') }}</h2>
        <div class="tabs-container mb-5">
          <div class="d-flex gap-2 pb-2 overflow-x-auto justify-content-center no-scrollbar">
            <button *ngFor="let menu of menus" 
                    class="btn rounded-pill px-4 transition-all"
                    [class.btn-primary]="selectedMenu?.id === menu.id"
                    [class.btn-outline-secondary]="selectedMenu?.id !== menu.id"
                    (click)="selectMenu(menu)">
              {{ translateField(menu, 'Name') }}
            </button>
          </div>
        </div>

        <div class="menu-items-list" *ngIf="items.length > 0; else noItems">
          <div class="menu-item-row" 
               *ngFor="let item of items"
               (click)="selectedItem = item">
            <div class="menu-item-content">
              <div class="d-flex justify-content-between align-items-start mb-1">
                <h4 class="item-title mb-0">{{ translateField(item, 'Name') }}</h4>
                <span class="item-price">{{ item.price | currency }}</span>
              </div>
              <p class="item-description text-muted small mb-2">{{ translateField(item, 'Description') }}</p>
              <div class="item-badges" *ngIf="item.modelUrl">
                <span class="badge-3d"><i class="bi bi-view-stacked me-1"></i> 3D View</span>
              </div>
            </div>
            <div class="menu-item-media" *ngIf="item.imageUrl">
              <img [src]="getFullUrl(item.imageUrl)" class="item-thumb">
            </div>
          </div>
        </div>
        <ng-template #noItems>
          <div class="text-center py-5">
            <i class="bi bi-journals display-1 text-light"></i>
            <p class="text-muted mt-3">{{ translate('PUBLIC_SELECT_CATEGORY') }}</p>
          </div>
        </ng-template>
      </div>

      <!-- Detailed Item View Overlay -->
      <div class="item-details-overlay" *ngIf="selectedItem" (click)="selectedItem = null">
        <div class="item-details-card glass-card rounded-5 p-4 animate-slide-up" (click)="$event.stopPropagation()">
          <button class="btn-close-custom" (click)="selectedItem = null">
            <i class="bi bi-x-lg"></i>
          </button>
          
          <div class="row g-4">
            <div class="col-md-6">
              <div class="media-container rounded-4 overflow-hidden bg-light shadow-inner position-relative">
                <model-viewer 
                  *ngIf="selectedItem.modelUrl"
                  [src]="getFullUrl(selectedItem.modelUrl)" 
                  camera-controls
                  auto-rotate
                  touch-action="pan-y"
                  camera-orbit="0deg 0deg 105%"
                  ar
                  ar-modes="webxr scene-viewer quick-look"
                  class="w-100 h-100"
                  style="min-height: 350px; background: #f8f9fa;">
                </model-viewer>
                <img *ngIf="!selectedItem.modelUrl && selectedItem.imageUrl" 
                     [src]="getFullUrl(selectedItem.imageUrl)" 
                     class="detail-main-img w-100 h-100 object-fit-cover">
                <div *ngIf="!selectedItem.modelUrl && !selectedItem.imageUrl" class="no-media py-5 text-center d-flex align-items-center justify-content-center" style="height: 350px;">
                  <i class="bi bi-image text-secondary opacity-25 display-1"></i>
                </div>
              </div>
            </div>
            <div class="col-md-6 d-flex flex-column justify-content-center py-3">
              <div class="mb-4">
                <h2 class="display-6 fw-bold mb-2">{{ translateField(selectedItem, 'Name') }}</h2>
                <div class="badge bg-primary-soft text-primary rounded-pill px-3 py-2 mb-3">
                  {{ selectedItem.price | currency }}
                </div>
                <p class="lead text-muted">{{ translateField(selectedItem, 'Description') }}</p>
              </div>
              
              <div class="mt-auto d-flex gap-3">
                <button class="btn btn-primary btn-lg rounded-pill flex-grow-1 py-3 shadow-lg fw-bold">
                  {{ translate('PUBLIC_ADD_TO_CART') || 'კალათაში დამატება' }}
                </button>
                <button *ngIf="selectedItem.modelUrl" class="btn btn-outline-primary btn-lg rounded-circle p-0 d-flex align-items-center justify-content-center" style="width: 56px; height: 56px;">
                  <i class="bi bi-view-stacked"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detail-container { max-width: 900px; margin: 0 auto; padding: 2rem 1rem; }
    .hero-wrapper { height: 400px; }
    .hero-image { width: 100%; height: 100%; object-fit: cover; }
    .meta i { color: #0d6efd; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    
    .transition-all { transition: all 0.3s ease; }
    
    .menu-items-list {
      display: flex;
      flex-direction: column;
      gap: 0;
    }
    
    .menu-item-row {
      display: flex;
      padding: 1.25rem 0;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      transition: background-color 0.2s;
      align-items: center;
      gap: 1.5rem;
    }
    
    .menu-item-row:hover {
      background-color: #fafafa;
    }
    
    .menu-item-content {
      flex: 1;
      min-width: 0;
    }
    
    .item-title {
      font-size: 1.15rem;
      font-weight: 600;
      color: #1a1a1a;
    }
    
    .item-price {
      font-weight: 700;
      color: #0d6efd;
      font-size: 1.1rem;
      margin-left: 1rem;
    }
    
    .item-description {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.5;
    }
    
    .menu-item-media {
      flex-shrink: 0;
    }
    
    .item-thumb {
      width: 110px;
      height: 110px;
      object-fit: cover;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    
    .badge-3d {
      background: #e7f1ff;
      color: #0d6efd;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
    }
    
    /* Overlay & Detail View */
    .item-details-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(8px);
      z-index: 1050;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    
    .item-details-card {
      width: 100%;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      background: white;
      border-radius: 30px !important;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    
    .btn-close-custom {
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(255,255,255,0.9);
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      z-index: 10;
      transition: transform 0.2s;
    }
    .btn-close-custom:hover { transform: scale(1.1); }
    
    .media-container { 
      min-height: 350px;
      background: #fcfcfc;
      border-radius: 20px;
    }
    
    .animate-slide-up {
      animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    @keyframes slideUp {
      from { transform: translateY(40px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    @media (max-width: 768px) { 
      .item-thumb { width: 90px; height: 90px; }
      .item-title { font-size: 1.05rem; }
      .hero-wrapper { height: 250px; }
    }
  `]
})
export class ObjectDetailComponent implements OnInit {
  object: any;
  menus: any[] = [];
  selectedMenu: any;
  items: any[] = [];
  selectedItem: any = null;
  activeLanguages: string[] = [];
  currentLang: string = 'ka';

  constructor(private route: ActivatedRoute, private api: ApiService, private translationService: TranslationService) {}

  ngOnInit() {
    this.translationService.activeLanguages$.subscribe(langs => this.activeLanguages = langs);
    this.translationService.currentLanguage$.subscribe(lang => this.currentLang = lang);

    const id = this.route.snapshot.paramMap.get('id');
    this.api.get(`/public/objects/${id}`).subscribe(res => {
      this.object = res.resultData;
    });
    this.api.get(`/public/objects/${id}/menus`).subscribe(res => {
      this.menus = res.resultData || [];
      if (this.menus.length > 0) this.selectMenu(this.menus[0]);
    });
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  translateField(item: any, fieldBaseName: string): string {
    return this.translationService.translateField(item, fieldBaseName);
  }

  getFullUrl(url: string): string {
    if (!url) return 'https://via.placeholder.com/800x400?text=No+Photo';
    if (url.startsWith('http')) return url;
    return `${environment.baseUrl}${url}`;
  }

  selectMenu(menu: any) {
    this.selectedMenu = menu;
    this.api.get(`/public/menus/${menu.id}/items`).subscribe(res => {
      const itemsData = res.resultData || [];
      this.items = itemsData.sort((a: any, b: any) => {
        // Prioritize items with images
        if (a.imageUrl && !b.imageUrl) return -1;
        if (!a.imageUrl && b.imageUrl) return 1;
        return 0;
      });
    });
  }

  setLang(lang: string) {
    this.translationService.setLanguage(lang);
  }

  getFlag(lang: string): string {
    const flags: any = { ka: '🇬🇪', en: '🇺🇸', ru: '🇷🇺' };
    return flags[lang] || '';
  }
}
