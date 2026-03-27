import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrdersStore } from './orders.store';

@Component({
  selector: 'app-orders-queue',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './orders-queue.component.html',
  styleUrl: './orders-queue.component.css'
})
export class OrdersQueueComponent implements OnInit {
  readonly activeTab = signal<'active' | 'completed'>('active');
  readonly orders = computed(() => this.ordersStore.orders());
  readonly completedOrders = computed(() => this.ordersStore.completedOrders());
  readonly pendingCount = this.ordersStore.pendingCount;

  constructor(
    readonly ordersStore: OrdersStore,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.ordersStore.initialize();
    } catch (err: any) {
      if (err.message === 'RESTAURANT_NOT_CONFIGURED') {
        this.router.navigate(['/setup']);
      }
    }
    const tab = this.route.snapshot.queryParamMap.get('tab');
    if (tab === 'completed') {
      this.activeTab.set('completed');
    }
  }
}
