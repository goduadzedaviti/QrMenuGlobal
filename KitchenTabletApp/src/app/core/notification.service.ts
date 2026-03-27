import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { KitchenOrder } from './models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  async requestPermissions(): Promise<void> {
    await LocalNotifications.requestPermissions();
  }

  async notifyNewOrder(order: KitchenOrder): Promise<void> {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: Date.now(),
          title: `New order ${order.orderNumber}`,
          body: `${order.tableLabel} • ${order.items.length} items`,
          schedule: { at: new Date(Date.now() + 250) },
          sound: 'beep.wav'
        }
      ]
    });
  }
}
