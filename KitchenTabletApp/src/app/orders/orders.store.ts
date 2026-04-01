import { Injectable, computed, signal, NgZone } from '@angular/core';
import { KitchenApiService } from '../core/kitchen-api.service';
import { DeviceAuthService } from '../core/device-auth.service';
import { NotificationService } from '../core/notification.service';
import { OfflineQueueService, PendingAction } from '../core/offline-queue.service';
import { SignalrService } from '../core/signalr.service';
import { KitchenOrder } from '../core/models';

@Injectable({ providedIn: 'root' })
export class OrdersStore {
  readonly loading = signal(false);
  readonly orders = signal<KitchenOrder[]>([]);
  readonly completedOrders = signal<KitchenOrder[]>([]);
  readonly selectedOrder = signal<KitchenOrder | null>(null);
  readonly newOrderAlert = signal<KitchenOrder | null>(null);
  readonly waiterCallAlert = signal<{ tableLabel: string; calledAtUtc: string } | null>(null);
  readonly waiterCalls = signal<{ tableLabel: string; calledAtUtc: string }[]>([]);
  readonly viewedOrderIds = signal<Set<string>>(new Set<string>(JSON.parse(localStorage.getItem('viewedOrders') || '[]')));
  readonly pendingCount = computed(() => this.orders().filter(order => order.status !== 'Ready').length);
  private initialized = false;
  private refreshHandle: ReturnType<typeof setInterval> | null = null;

  dismissAlert(): void {
    this.newOrderAlert.set(null);
    this.waiterCallAlert.set(null);
  }

  dismissWaiterCall(tableLabel: string): void {
    this.waiterCalls.update(calls => calls.filter(c => c.tableLabel !== tableLabel));
  }

  markAsViewed(orderId: string): void {
    const current = new Set(this.viewedOrderIds());
    if (!current.has(orderId)) {
      current.add(orderId);
      this.viewedOrderIds.set(current);
      localStorage.setItem('viewedOrders', JSON.stringify(Array.from(current)));
    }
  }

  constructor(
    private readonly kitchenApi: KitchenApiService,
    private readonly deviceAuth: DeviceAuthService,
    private readonly notifications: NotificationService,
    private readonly offlineQueue: OfflineQueueService,
    private readonly signalr: SignalrService,
    private readonly ngZone: NgZone
  ) {}

  async initialize(): Promise<void> {
    if (this.loading() || this.initialized) {
      return;
    }

    this.loading.set(true);
    try {
      await this.notifications.requestPermissions();
      const profile = await this.deviceAuth.ensureRegistered();
      await this.refreshQueue(profile.restaurantId);
      this.startBackgroundRefresh(profile.restaurantId);

      try {
        await this.signalr.connect(profile.deviceId, profile.restaurantId);
        this.signalr.onOrderEvent(event => {
          console.log('SignalR OrderEvent:', event);
          this.ngZone.run(async () => {
            this.upsert(event.order);
            if (event.type === 'created') {
              this.newOrderAlert.set(event.order);
              await this.notifications.notifyNewOrder(event.order);
            }
          });
        });

        this.signalr.onWaiterCalled(payload => {
          console.log('SignalR WaiterCalled payload:', payload);
          this.ngZone.run(() => {
            this.waiterCallAlert.set(payload);
            this.waiterCalls.update(calls => [payload, ...calls.filter(c => c.tableLabel !== payload.tableLabel)]);
          });
        });
      } catch {
        // Keep polling active even if realtime transport fails.
      }

      await this.flushOfflineQueue();
      this.initialized = true;
    } catch (err: any) {
      if (err.message === 'RESTAURANT_NOT_CONFIGURED') {
        // We need to redirect to setup. But store doesn't have router usually.
        // We'll throw it to the component.
        throw err;
      }
      console.error('Initialization failed', err);
    } finally {
      this.loading.set(false);
    }
  }

  async loadOrder(orderId: string): Promise<void> {
    const existing = this.orders().find(o => o.id === orderId) ||
                   this.completedOrders().find(o => o.id === orderId);

    if (existing) {
      this.selectedOrder.set(existing);
      return;
    }

    this.loading.set(true);
    try {
      const profile = await this.deviceAuth.ensureRegistered();
      const order = await this.kitchenApi.getOrder(profile.restaurantId, orderId);
      this.selectedOrder.set(order);
    } catch (err) {
      console.error('Failed to load order', err);
      this.selectedOrder.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  async act(orderId: string, action: PendingAction['action']): Promise<void> {
    const profile = await this.deviceAuth.ensureRegistered();
    const pendingAction: PendingAction = {
      orderId,
      action,
      createdAt: new Date().toISOString()
    };

    try {
      const updated = await this.kitchenApi.updateStatus(profile.restaurantId, orderId, action, profile.deviceId);
      this.upsert(updated);
    } catch {
      this.offlineQueue.enqueue(pendingAction);
    }
  }

  private async flushOfflineQueue(): Promise<void> {
    const profile = await this.deviceAuth.ensureRegistered();
    for (const item of this.offlineQueue.pendingActions()) {
      try {
        const updated = await this.kitchenApi.updateStatus(profile.restaurantId, item.orderId, item.action, profile.deviceId);
        this.upsert(updated);
        this.offlineQueue.clear(item);
      } catch {
        return;
      }
    }
  }

  private async refreshQueue(restaurantId: string): Promise<void> {
    this.orders.set(await this.kitchenApi.getQueue(restaurantId));
    this.completedOrders.set(await this.kitchenApi.getCompletedQueue(restaurantId));
  }

  private startBackgroundRefresh(restaurantId: string): void {
    if (this.refreshHandle) {
      return;
    }

    this.refreshHandle = setInterval(() => {
      void this.refreshQueue(restaurantId);
    }, 5000);
  }

  private upsert(order: KitchenOrder): void {
    if (order.status === 'Ready') {
      this.orders.set(this.orders().filter(o => o.id !== order.id));
      const currentReady = this.completedOrders();
      const idx = currentReady.findIndex(entry => entry.id === order.id);
      if (idx === -1) {
        this.completedOrders.set([order, ...currentReady]);
      } else {
        const nextReady = [...currentReady];
        nextReady[idx] = order;
        this.completedOrders.set(nextReady);
      }
      return;
    }

    const current = this.orders();
    const index = current.findIndex(entry => entry.id === order.id);
    if (index === -1) {
      this.orders.set([order, ...current]);
      return;
    }

    const next = [...current];
    next[index] = order;
    this.orders.set(next);
  }
}
