import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-layout">
      <aside class="sidebar">
        <h3>Menu Admin</h3>
        <nav>
          <a routerLink="/admin/dashboard" routerLinkActive="active">Dashboard</a>
          <a routerLink="/admin/objects" routerLinkActive="active">Manage Venues</a>
          <button (click)="logout()">Logout</button>
        </nav>
      </aside>
      <main class="content">
        <h1>Welcome, Admin</h1>
        <div class="stats">
          <div class="stat-card">
            <span class="value">2</span>
            <span class="label">Total Venues</span>
          </div>
          <!-- More stats can be added -->
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout { display: flex; height: 100vh; }
    .sidebar { width: 250px; background: #222; color: white; padding: 2rem; }
    .sidebar h3 { margin-bottom: 2rem; color: #ffc107; }
    nav { display: flex; flex-direction: column; gap: 1rem; }
    nav a { color: #ccc; text-decoration: none; padding: 0.5rem; border-radius: 4px; }
    nav a.active { background: #333; color: white; }
    nav button { margin-top: 2rem; background: none; border: 1px solid #555; color: #888; padding: 0.5rem; cursor: pointer; }
    .content { flex: 1; padding: 3rem; background: #fefefe; }
    .stats { display: flex; gap: 2rem; margin-top: 2rem; }
    .stat-card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); text-align: center; width: 150px; }
    .stat-card .value { display: block; font-size: 2rem; font-weight: bold; }
    .stat-card .label { color: #888; font-size: 0.8rem; }
  `]
})
export class DashboardComponent {
  constructor(private authService: AuthService) {}
  logout() { this.authService.logout(); }
}
