import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { TranslationService } from '../../../core/services/translation.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-object-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="detail-container" *ngIf="object">
      <div class="back-link btn btn-link text-decoration-none p-0 mb-4" routerLink="/">
        <i class="bi bi-arrow-left me-2"></i>{{ translate('PUBLIC_BACK_TO_VENUES') }}
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

        <div class="items-grid" *ngIf="items.length > 0; else noItems">
          <div class="item-card glass-card p-3 rounded-4" *ngFor="let item of items">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h4 class="mb-0 fw-bold">{{ translateField(item, 'Name') }}</h4>
              <span class="badge bg-primary rounded-pill px-3">{{ item.price | currency }}</span>
            </div>
            <div class="d-flex gap-3">
              <div class="flex-grow-1">
                <p class="text-muted small mb-0">{{ translateField(item, 'Description') }}</p>
              </div>
              <div class="flex-shrink-0" *ngIf="item.imageUrl">
                <img [src]="getFullUrl(item.imageUrl)" class="item-thumb rounded-3 shadow-sm">
              </div>
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
    
    .items-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); 
      gap: 1.5rem; 
    }
    
    .glass-card {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0,0,0,0.05);
      transition: transform 0.2s;
    }
    .glass-card:hover { transform: scale(1.02); }
    
    .item-thumb { width: 100px; height: 100px; object-fit: cover; }
    
    @media (max-width: 768px) { 
      .items-grid { grid-template-columns: 1fr; }
      .hero-wrapper { height: 250px; }
      .display-4 { font-size: 2.5rem; }
    }
  `]
})
export class ObjectDetailComponent implements OnInit {
  object: any;
  menus: any[] = [];
  selectedMenu: any;
  items: any[] = [];

  constructor(private route: ActivatedRoute, private api: ApiService, private translationService: TranslationService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.api.get(`/public/objects/${id}`).subscribe(res => {
      this.object = res.data;
    });
    this.api.get(`/public/objects/${id}/menus`).subscribe(res => {
      this.menus = res.data;
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
      this.items = res.data;
    });
  }
}
