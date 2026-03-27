import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { OrdersStore } from './orders.store';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css'
})
export class OrderDetailsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly ordersStore = inject(OrdersStore);
  readonly order = this.ordersStore.selectedOrder;

  ngOnInit(): void {
    void this.ordersStore.initialize();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      void this.ordersStore.loadOrder(id);
      this.ordersStore.markAsViewed(id);
    }
  }

  async accept(): Promise<void> {
    const order = this.order();
    if (order) {
      await this.ordersStore.act(order.id, 'accept');
    }
  }

  async reject(): Promise<void> {
    const order = this.order();
    if (order) {
      await this.ordersStore.act(order.id, 'reject');
    }
  }

  async ready(): Promise<void> {
    const order = this.order();
    if (order) {
      await this.ordersStore.act(order.id, 'ready');
      void this.router.navigate(['/'], { queryParams: { tab: 'active' } });
    }
  }
}
