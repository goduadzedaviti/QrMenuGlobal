import { Injectable, signal } from '@angular/core';

export interface PendingAction {
  orderId: string;
  action: 'accept' | 'reject' | 'ready';
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class OfflineQueueService {
  private readonly storageKey = 'kitchen-pending-actions';
  readonly pendingActions = signal<PendingAction[]>(this.load());

  enqueue(action: PendingAction): void {
    const next = [...this.pendingActions(), action];
    this.pendingActions.set(next);
    localStorage.setItem(this.storageKey, JSON.stringify(next));
  }

  clear(action: PendingAction): void {
    const next = this.pendingActions().filter(entry =>
      !(entry.orderId === action.orderId && entry.action === action.action && entry.createdAt === action.createdAt));
    this.pendingActions.set(next);
    localStorage.setItem(this.storageKey, JSON.stringify(next));
  }

  private load(): PendingAction[] {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? JSON.parse(raw) as PendingAction[] : [];
  }
}
