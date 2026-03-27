import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { appConfig } from './app-config';
import { ApiResult, KitchenOrder } from './models';

@Injectable({ providedIn: 'root' })
export class KitchenApiService {
  constructor(private readonly httpClient: HttpClient) {}

  getQueue(restaurantId: string): Promise<KitchenOrder[]> {
    return firstValueFrom(
      this.httpClient.get<ApiResult<KitchenOrder[]>>(`${appConfig.apiBaseUrl}/kitchen/objects/${restaurantId}/orders`)
    ).then(result => {
      if (!result.succeeded) {
        throw new Error(result.errors?.[0] ?? 'Failed to load kitchen queue.');
      }

      return result.resultData ?? [];
    });
  }

  getCompletedQueue(restaurantId: string): Promise<KitchenOrder[]> {
    return firstValueFrom(
      this.httpClient.get<ApiResult<KitchenOrder[]>>(`${appConfig.apiBaseUrl}/kitchen/objects/${restaurantId}/orders?showCompleted=true`)
    ).then(result => {
      if (!result.succeeded) {
        throw new Error(result.errors?.[0] ?? 'Failed to load completed kitchen queue.');
      }

      return result.resultData ?? [];
    });
  }

  getOrder(restaurantId: string, orderId: string): Promise<KitchenOrder> {
    return firstValueFrom(
      this.httpClient.get<ApiResult<KitchenOrder>>(
        `${appConfig.apiBaseUrl}/kitchen/objects/${restaurantId}/orders/${orderId}`
      )
    ).then(result => {
      if (!result.succeeded || !result.resultData) {
        throw new Error(result.errors?.[0] ?? 'Failed to load order.');
      }

      return result.resultData;
    });
  }

  updateStatus(
    restaurantId: string,
    orderId: string,
    action: 'accept' | 'reject' | 'ready',
    deviceId: string
  ): Promise<KitchenOrder> {
    return firstValueFrom(
      this.httpClient.post<ApiResult<KitchenOrder>>(
        `${appConfig.apiBaseUrl}/kitchen/objects/${restaurantId}/orders/${orderId}/${action}`,
        { deviceId }
      )
    ).then(result => {
      if (!result.succeeded || !result.resultData) {
        throw new Error(result.errors?.[0] ?? 'Failed to update order.');
      }

      return result.resultData;
    });
  }
}
