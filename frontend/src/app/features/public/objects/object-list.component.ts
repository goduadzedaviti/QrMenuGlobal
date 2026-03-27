import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-object-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="public-container">
      <header class="hero">
        <h1>Explore Venues & Menus</h1>
        <p>Discover the best places and their offerings.</p>
      </header>
      
      <div class="grid" *ngIf="!loading && objects.length > 0">
        <div class="card" *ngFor="let obj of objects" [routerLink]="['/object', obj.id]">
          <img [src]="getFullUrl(obj.imageUrl)" [alt]="obj.name">
          <div class="card-content">
            <h3>{{ obj.name }}</h3>
            <p class="address text-muted mb-0 small"><i class="bi bi-geo-alt me-1"></i>{{ obj.address }}</p>
          </div>
        </div>
      </div>
      
      <div *ngIf="!loading && objects.length === 0 && !error" class="no-data">
        No venues found.
      </div>

      <div *ngIf="error" class="error-box">
        {{ error }}
      </div>
      
      <div *ngIf="loading" class="loader">Loading venues...</div>
    </div>
  `,
  styles: [`
    .public-container { padding: 3rem 1.5rem; max-width: 1100px; margin: 0 auto; min-height: 100vh; background-color: #f8f9fa; }
    .hero { text-align: center; margin-bottom: 4rem; }
    .hero h1 { font-size: 2.75rem; font-weight: 800; color: #1a1a1a; letter-spacing: -0.03em; margin-bottom: 0.5rem; }
    .hero p { color: #6c757d; font-size: 1.1rem; }
    
    .grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); 
      gap: 2.5rem; 
    }
    
    .card { 
      background: white; 
      border-radius: 20px; 
      overflow: hidden; 
      border: 0;
      box-shadow: 0 10px 30px rgba(0,0,0,0.04); 
      cursor: pointer; 
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
    }
    .card:hover { 
      transform: translateY(-8px); 
      box-shadow: 0 20px 40px rgba(0,0,0,0.08); 
    }
    
    .card img { 
      width: 100%; 
      height: 220px; 
      object-fit: cover; 
      transition: transform 0.5s ease;
    }
    .card:hover img {
      transform: scale(1.05);
    }
    
    .card-content { padding: 1.75rem; }
    .card-content h3 { 
      margin: 0 0 0.5rem; 
      font-weight: 700; 
      color: #1a1a1a;
      font-size: 1.4rem;
    }
    .address { 
      font-size: 0.9rem; 
      color: #747d8c; 
      display: flex;
      align-items: center;
    }
    
    .no-data, .loader { text-align: center; padding: 4rem; color: #a4b0be; font-size: 1.1rem; }
    .error-box { 
      background: #fff5f5; 
      color: #e53e3e; 
      padding: 1.5rem; 
      border-radius: 12px; 
      text-align: center;
      border: 1px solid #fed7d7;
    }

    @media (max-width: 576px) {
      .hero h1 { font-size: 2.25rem; }
      .grid { gap: 1.5rem; }
    }
  `]
})
export class ObjectListComponent implements OnInit {
  objects: any[] = [];
  loading = true;
  error = '';

  constructor(private api: ApiService) {}

  getFullUrl(url?: string | null): string {
    if (!url) return 'https://via.placeholder.com/300x200?text=No+Image';
    if (url.startsWith('http')) return url;
    return `${environment.baseUrl}${url}`;
  }

  ngOnInit() {
    this.api.get('/public/objects').subscribe({
      next: (res) => {
        this.objects = res.resultData.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load venues. Please try again later.';
        this.loading = false;
      }
    });
  }
}
