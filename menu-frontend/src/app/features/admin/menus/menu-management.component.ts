import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mgmt-panel">
      <div class="header">
        <h2>Manage Menus</h2>
        <button (click)="openCreate()">+ Add Menu</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Order</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let menu of menus">
            <td>{{ menu.name }}</td>
            <td>{{ menu.description }}</td>
            <td>{{ menu.sortOrder }}</td>
            <td>
              <button class="btn-sm" (click)="edit(menu)">Edit</button>
              <button class="btn-sm btn-danger" (click)="delete(menu.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="modal" *ngIf="isModalOpen">
        <div class="modal-content">
          <h3>{{ editingMenu.id ? 'Edit' : 'Create' }} Menu</h3>
          <input [(ngModel)]="editingMenu.name" placeholder="Name">
          <textarea [(ngModel)]="editingMenu.description" placeholder="Description"></textarea>
          <input type="number" [(ngModel)]="editingMenu.sortOrder" placeholder="Sort Order">
          <div class="modal-actions">
            <button (click)="save()">Save</button>
            <button (click)="closeModal()">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mgmt-panel { padding: 1rem; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 1rem; border-bottom: 1px solid #eee; }
    .btn-sm { padding: 4px 8px; margin-right: 4px; cursor: pointer; }
    .btn-danger { color: red; }
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; }
    .modal-content { background: white; padding: 2rem; border-radius: 8px; display: flex; flex-direction: column; gap: 1rem; width: 400px; }
  `]
})
export class MenuManagementComponent implements OnInit {
  menus: any[] = [];
  objectId: any;
  isModalOpen = false;
  editingMenu: any = {};

  constructor(private api: ApiService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.objectId = this.route.snapshot.paramMap.get('objectId');
    this.loadMenus();
  }

  loadMenus() {
    this.api.get(`/admin/menus/by-object/${this.objectId}`).subscribe(res => this.menus = res.data);
  }

  openCreate() {
    this.editingMenu = { objectId: this.objectId, sortOrder: 0, isActive: true };
    this.isModalOpen = true;
  }

  edit(menu: any) {
    this.editingMenu = { ...menu };
    this.isModalOpen = true;
  }

  save() {
    if (this.editingMenu.id) {
      this.api.put(`/admin/menus/${this.editingMenu.id}`, this.editingMenu).subscribe(() => {
        this.loadMenus();
        this.closeModal();
      });
    } else {
      this.api.post('/admin/menus', this.editingMenu).subscribe(() => {
        this.loadMenus();
        this.closeModal();
      });
    }
  }

  delete(id: string) {
    if (confirm('Are you sure?')) {
      this.api.delete(`/admin/menus/${id}`).subscribe(() => this.loadMenus());
    }
  }

  closeModal() { this.isModalOpen = false; }
}
