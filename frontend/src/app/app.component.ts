import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { ApiService } from './core/services/api.service';
import { TranslationService } from './core/services/translation.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  mobileMenuOpen = false;

  constructor(public authService: AuthService, private router: Router, private api: ApiService, private translationService: TranslationService) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.mobileMenuOpen = false;
      });
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  showSidebar(): boolean {
    return this.router.url.startsWith('/admin') && this.authService.isLoggedIn();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  logout() {
    this.mobileMenuOpen = false;
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
