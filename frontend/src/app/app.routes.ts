import { Routes } from '@angular/router';
import { ObjectListComponent } from './features/public/objects/object-list.component';
import { ObjectDetailComponent } from './features/public/object-details/object-detail.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: ObjectListComponent },
  { path: 'object/:id', component: ObjectDetailComponent },
  { path: 'object/:id/:table', component: ObjectDetailComponent },
  { path: 'login', redirectTo: 'admin/login', pathMatch: 'full' },
  { path: 'admin/login', loadComponent: () => import('./features/admin/auth/login.component').then(m => m.LoginComponent) },
  { 
    path: 'admin', 
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'objects', loadComponent: () => import('./features/admin/objects/object-management.component').then(m => m.ObjectManagementComponent) },
      { path: 'language-management', loadComponent: () => import('./features/admin/language-management/language-management.component').then(m => m.LanguageManagementComponent) },
      { path: 'menus/:objectId', loadComponent: () => import('./features/admin/menus/menu-management.component').then(m => m.MenuManagementComponent) },
      { path: 'menu-items/:menuId', loadComponent: () => import('./features/admin/menu-items/menu-item-management.component').then(m => m.MenuItemManagementComponent) },
      { path: 'change-password', loadComponent: () => import('./features/admin/auth/change-password.component').then(m => m.ChangePasswordComponent) },
      { path: 'qr-generator', loadComponent: () => import('./features/admin/qr-generator/qr-generator.component').then(m => m.QrGeneratorComponent) },
      { path: 'users', loadComponent: () => import('./features/admin/users/user-management.component').then(m => m.UserManagementComponent) },
      // Other admin routes can be added here
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
