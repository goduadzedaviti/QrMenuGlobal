import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { appConfig } from './app-config';
import { KitchenOrder } from './models';

@Injectable({ providedIn: 'root' })
export class SignalrService {
  readonly connected = signal(false);
  private hubConnection?: signalR.HubConnection;
  private listeners = new Set<(event: { type: 'created' | 'updated'; order: KitchenOrder }) => void>();
  private waiterListeners = new Set<(event: { tableLabel: string; calledAtUtc: string }) => void>();

  async connect(deviceId: string, restaurantId: string): Promise<void> {
    if (this.hubConnection) {
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(appConfig.hubUrl)
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('OrderCreated', (order: KitchenOrder) => {
      this.listeners.forEach(listener => listener({ type: 'created', order }));
    });

    this.hubConnection.on('OrderUpdated', (order: KitchenOrder) => {
      this.listeners.forEach(listener => listener({ type: 'updated', order }));
    });

    this.hubConnection.on('WaiterCalled', (payload: { tableLabel: string; calledAtUtc: string }) => {
      this.waiterListeners.forEach(listener => listener(payload));
    });

    this.hubConnection.onreconnected(async () => {
      this.connected.set(true);
      await this.hubConnection?.invoke('RegisterDevice', deviceId, restaurantId);
    });

    await this.hubConnection.start();
    await this.hubConnection.invoke('RegisterDevice', deviceId, restaurantId);
    this.connected.set(true);
  }

  onOrderEvent(listener: (event: { type: 'created' | 'updated'; order: KitchenOrder }) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onWaiterCalled(listener: (event: { tableLabel: string; calledAtUtc: string }) => void): () => void {
    this.waiterListeners.add(listener);
    return () => this.waiterListeners.delete(listener);
  }
}
