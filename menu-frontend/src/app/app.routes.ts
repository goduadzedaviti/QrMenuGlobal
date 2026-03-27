import { Routes } from '@angular/router';
import { ObjectListComponent } from './features/public/objects/object-list.component';
import { ObjectDetailComponent } from './features/public/object-details/object-detail.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: ObjectListComponent },
  { path: 'object/:id', component: ObjectDetailComponent },
  { path: 'admin/login', loadComponent: () => import('./features/admin/auth/login.component').then(m => m.LoginComponent) },
  { 
    path: 'admin', 
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'objects', loadComponent: () => import('./features/admin/objects/object-management.component').then(m => m.ObjectManagementComponent) },
      { path: 'menus/:objectId', loadComponent: () => import('./features/admin/menus/menu-management.component').then(m => m.MenuManagementComponent) },
      // Other admin routes can be added here
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
