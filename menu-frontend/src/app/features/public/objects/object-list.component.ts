import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { TranslationService } from '../../../core/services/translation.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-object-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="public-container">
      <header class="hero">
        <h1 class="fw-bold">{{ translate('PUBLIC_VENUES_TITLE') }}</h1>
        <p class="text-muted">{{ translate('PUBLIC_SEARCH_PLACEHOLDER') }}</p>
      </header>
      
      <div class="venue-grid" *ngIf="objects.length > 0; else loading">
        <div class="venue-card shadow-sm" *ngFor="let obj of objects" [routerLink]="['/object', obj.id]">
          <div class="image-wrapper">
            <img [src]="getFullUrl(obj.imageUrl)" [alt]="translateField(obj, 'Name')">
            <div class="overlay">
              <span class="view-btn">{{ translate('BUTTON_VIEW_MENU') }}</span>
            </div>
          </div>
          <div class="card-content text-center">
            <h3 class="mb-0">{{ translateField(obj, 'Name') }}</h3>
          </div>
        </div>
      </div>
      
      <ng-template #loading>
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-3 text-muted">{{ translate('PUBLIC_NO_VENUES') }}</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .public-container { padding: 3rem 1.5rem; max-width: 1100px; margin: 0 auto; }
    .hero { text-align: center; margin-bottom: 4rem; }
    .hero h1 { font-size: 3rem; color: #1a1a1a; letter-spacing: -1px; }
    
    .venue-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
      gap: 2.5rem; 
    }
    
    .venue-card { 
      background: white; 
      border-radius: 20px; 
      overflow: hidden; 
      cursor: pointer; 
      transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); 
      border: 1px solid rgba(0,0,0,0.05);
    }
    
    .venue-card:hover { 
      transform: translateY(-10px); 
      box-shadow: 0 20px 40px rgba(0,0,0,0.12) !important; 
    }
    
    .image-wrapper { position: relative; height: 240px; overflow: hidden; }
    .image-wrapper img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s; }
    .venue-card:hover .image-wrapper img { transform: scale(1.1); }
    
    .overlay { 
      position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
      background: rgba(0,0,0,0.3); opacity: 0; 
      display: flex; align-items: center; justify-content: center; 
      transition: opacity 0.3s; 
    }
    .venue-card:hover .overlay { opacity: 1; }
    
    .view-btn { 
      background: white; color: black; padding: 0.8rem 1.5rem; 
      border-radius: 30px; font-weight: 600; font-size: 0.9rem;
      transform: translateY(20px); transition: transform 0.3s;
    }
    .venue-card:hover .view-btn { transform: translateY(0); }
    
    .card-content { padding: 1.5rem; }
    .card-content h3 { font-size: 1.4rem; font-weight: 700; color: #333; }
  `]
})
export class ObjectListComponent implements OnInit {
  objects: any[] = [];

  constructor(private api: ApiService, private translationService: TranslationService) {}

  ngOnInit() {
    this.api.get('/public/objects').subscribe(res => {
      this.objects = res.resultData?.data || [];
    });
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  translateField(item: any, fieldBaseName: string): string {
    return this.translationService.translateField(item, fieldBaseName);
  }

  getFullUrl(url: string): string {
    if (!url) return 'https://via.placeholder.com/600x400?text=No+Photo';
    if (url.startsWith('http')) return url;
    return `${environment.baseUrl}${url}`;
  }
}
