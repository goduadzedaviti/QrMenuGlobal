export type OrderStatus = 'Created' | 'Accepted' | 'Rejected' | 'Ready';

export interface OrderItem {
  id: string;
  nameSnapshot: string;
  quantity: number;
  notes?: string | null;
}

export interface KitchenOrder {
  id: string;
  restaurantId: string;
  orderNumber: string;
  customerName: string;
  tableLabel: string;
  notes?: string | null;
  status: OrderStatus;
  createdAtUtc: string;
  items: OrderItem[];
}

export interface DeviceRegistration {
  id: string;
  deviceId: string;
  restaurantId: string;
  displayName: string;
  platform: string;
  pushToken?: string | null;
}

export interface DeviceProfile {
  deviceId: string;
  restaurantId: string;
  displayName: string;
  platform: string;
}

export interface ApiResult<T> {
  succeeded: boolean;
  resultData?: T;
  errors?: string[];
}
