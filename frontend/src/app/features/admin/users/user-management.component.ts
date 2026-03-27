import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 mb-0 text-gray-800">{{ translate('SIDEBAR_USER_MANAGEMENT') }}</h1>
        <button class="btn btn-primary shadow-sm" (click)="openCreateModal()">
          <i class="bi bi-person-plus me-1"></i> მომხმარებლის დამატება
        </button>
      </div>

      <div class="card shadow-sm border-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="px-4 py-3 border-0">მომხმარებელი</th>
                <th class="px-4 py-3 border-0">როლი</th>
                <th class="px-4 py-3 border-0 text-end">მოქმედება</th>
              </tr>
            </thead>
            <tbody>
              @for (user of users; track user.id) {
                <tr>
                  <td class="px-4 py-3 border-0 fw-medium">{{ user.username }}</td>
                  <td class="px-4 py-3 border-0">
                    <span class="badge" [ngClass]="user.role === 'SystemAdmin' ? 'bg-info-subtle text-info' : 'bg-primary-subtle text-primary'">
                      {{ user.role }}
                    </span>
                    <span class="badge ms-2" [ngClass]="user.isActive ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'">
                      {{ user.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 border-0 text-end">
                    <button class="btn btn-link text-primary p-0 me-3" (click)="openEditModal(user)">
                      {{ translate('BUTTON_EDIT') }}
                    </button>
                    <button class="btn btn-link text-danger p-0" (click)="deleteUser(user)" *ngIf="user.username !== 'admin'">
                      {{ translate('BUTTON_DELETE') }}
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="3" class="text-center py-5 text-muted">მომხმარებლები არ მოიძებნა.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- User Modal -->
    <div class="modal fade shadow" [class.show]="showModal" [style.display]="showModal ? 'block' : 'none'" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold">{{ isEditMode ? 'რედაქტირება' : 'დამატება' }}</h5>
            <button type="button" class="btn-close" (click)="closeModal()"></button>
          </div>
          <div class="modal-body p-4">
            <div class="mb-3">
              <label class="form-label text-muted small fw-bold">მომხმარებლის სახელი</label>
              <input type="text" class="form-control form-control-lg bg-light" [(ngModel)]="currentUser.username" placeholder="Username">
            </div>
            <div class="mb-3">
              <label class="form-label text-muted small fw-bold">პაროლი {{ isEditMode ? '(დატოვეთ ცარიელი თუ არ გსურთ შეცვლა)' : '' }}</label>
              <input type="password" class="form-control form-control-lg bg-light" [(ngModel)]="currentUser.password" placeholder="Password">
            </div>
            <div class="mb-3">
              <label class="form-label text-muted small fw-bold">როლი</label>
              <select class="form-select form-control-lg bg-light" [(ngModel)]="currentUser.role">
                <option value="Admin">Admin</option>
                <option value="SystemAdmin">SystemAdmin</option>
              </select>
            </div>
            <div class="mb-3 d-flex align-items-center">
              <div class="form-check form-switch p-0 d-flex align-items-center gap-2">
                <input class="form-check-input ms-0" type="checkbox" [(ngModel)]="currentUser.isActive" id="userActiveSwitch" style="width: 3em; height: 1.5em; cursor: pointer;">
                <label class="form-check-label fw-bold small text-muted mb-0 cursor-pointer" for="userActiveSwitch">აქტიური სტატუსი</label>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-light rounded-pill px-4" (click)="closeModal()">{{ translate('BUTTON_CANCEL') }}</button>
            <button type="button" class="btn btn-primary rounded-pill px-4 shadow-sm" (click)="saveUser()" [disabled]="loading">
              {{ loading ? 'მიმდინარეობს...' : translate('BUTTON_SAVE') }}
            </button>
          </div>
        </div>
      </div>
    </div>
    @if (showModal) {
      <div class="modal-backdrop fade show"></div>
    }
  `,
  styles: [`
    .badge {
      font-weight: 500;
      padding: 0.5em 0.8em;
      border-radius: 6px;
    }
    .table-hover tbody tr:hover {
      background-color: rgba(0,0,0,0.01);
    }
  `]
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  showModal = false;
  isEditMode = false;
  loading = false;
  
  currentUser: any = {
    username: '',
    password: '',
    role: 'Admin'
  };

  constructor(
    private api: ApiService,
    private translationService: TranslationService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.api.get('/admin/users').subscribe(res => {
      this.users = res.resultData.data;
    });
  }

  openCreateModal() {
    this.isEditMode = false;
    this.currentUser = { username: '', password: '', role: 'Admin', isActive: true };
    this.showModal = true;
  }

  openEditModal(user: any) {
    this.isEditMode = true;
    this.currentUser = { ...user, password: '', isActive: user.isActive };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveUser() {
    if (!this.currentUser.username) return;
    this.loading = true;

    if (this.isEditMode) {
      this.api.put(`/admin/users/${this.currentUser.id}`, this.currentUser).subscribe({
        next: () => {
          this.loading = false;
          this.closeModal();
          this.loadUsers();
        },
        error: () => this.loading = false
      });
    } else {
      this.api.post('/admin/users', this.currentUser).subscribe({
        next: () => {
          this.loading = false;
          this.closeModal();
          this.loadUsers();
        },
        error: () => this.loading = false
      });
    }
  }

  deleteUser(user: any) {
    if (confirm(this.translate('CONFIRM_DELETE'))) {
      this.api.delete(`/admin/users/${user.id}`).subscribe(() => {
        this.loadUsers();
      });
    }
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }
}
