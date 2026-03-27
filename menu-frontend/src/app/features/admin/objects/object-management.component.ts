import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-object-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mgmt-panel">
      <div class="header">
        <h2>Manage Venues</h2>
        <button (click)="openCreate()">+ Add Venue</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Address</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let obj of objects">
            <td>{{ obj.name }}</td>
            <td>{{ obj.address }}</td>
            <td><span [class]="obj.isActive ? 'badge-active' : 'badge-inactive'">{{ obj.isActive ? 'Active' : 'Inactive' }}</span></td>
            <td>
              <button class="btn-sm" (click)="edit(obj)">Edit</button>
              <button class="btn-sm btn-danger" (click)="delete(obj.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Simple Modal Placeholder -->
      <div class="modal" *ngIf="isModalOpen">
        <div class="modal-content">
          <h3>{{ editingObject.id ? 'Edit' : 'Create' }} Venue</h3>
          <input [(ngModel)]="editingObject.name" placeholder="Name">
          <input [(ngModel)]="editingObject.address" placeholder="Address">
          <textarea [(ngModel)]="editingObject.description" placeholder="Description"></textarea>
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
    .badge-active { color: green; font-weight: bold; }
    .badge-inactive { color: red; }
    .btn-sm { padding: 4px 8px; margin-right: 4px; cursor: pointer; }
    .btn-danger { color: red; }
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; }
    .modal-content { background: white; padding: 2rem; border-radius: 8px; display: flex; flex-direction: column; gap: 1rem; width: 400px; }
  `]
})
export class ObjectManagementComponent implements OnInit {
  objects: any[] = [];
  isModalOpen = false;
  editingObject: any = {};

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadObjects();
  }

  loadObjects() {
    this.api.get('/admin/objects').subscribe(res => this.objects = res.data.items);
  }

  openCreate() {
    this.editingObject = { isActive: true };
    this.isModalOpen = true;
  }

  edit(obj: any) {
    this.editingObject = { ...obj };
    this.isModalOpen = true;
  }

  save() {
    if (this.editingObject.id) {
      this.api.put(`/admin/objects/${this.editingObject.id}`, this.editingObject).subscribe(() => {
        this.loadObjects();
        this.closeModal();
      });
    } else {
      this.api.post('/admin/objects', this.editingObject).subscribe(() => {
        this.loadObjects();
        this.closeModal();
      });
    }
  }

  delete(id: string) {
    if (confirm('Are you sure?')) {
      this.api.delete(`/admin/objects/${id}`).subscribe(() => this.loadObjects());
    }
  }

  closeModal() { this.isModalOpen = false; }
}
