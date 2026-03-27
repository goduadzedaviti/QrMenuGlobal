import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Device } from '@capacitor/device';
import { firstValueFrom } from 'rxjs';
import { appConfig } from './app-config';
import { ApiResult, DeviceProfile, DeviceRegistration } from './models';

@Injectable({ providedIn: 'root' })
export class DeviceAuthService {
  readonly deviceProfile = signal<DeviceProfile | null>(null);

  constructor(private readonly httpClient: HttpClient) {}

  async ensureRegistered(): Promise<DeviceProfile> {
    const existing = this.deviceProfile();
    if (existing) {
      return existing;
    }

    const info = await Device.getId();
    const deviceInfo = await Device.getInfo();
    const storedRestaurantId = localStorage.getItem('kitchen_restaurant_id');

    if (!storedRestaurantId) {
      throw new Error('RESTAURANT_NOT_CONFIGURED');
    }

    const profile: DeviceProfile = {
      deviceId: info.identifier,
      restaurantId: storedRestaurantId,
      displayName: `${deviceInfo.platform} Kitchen`,
      platform: this.mapPlatform(deviceInfo.platform)
    };

    const result = await firstValueFrom(this.httpClient.post<ApiResult<DeviceRegistration>>(
      `${appConfig.apiBaseUrl}/kitchen/devices/register`,
      {
        objectId: profile.restaurantId,
        deviceId: profile.deviceId,
        displayName: profile.displayName,
        platform: profile.platform
      }
    ));

    if (!result.succeeded) {
      throw new Error(result.errors?.[0] ?? 'Device registration failed.');
    }

    this.deviceProfile.set(profile);
    return profile;
  }

  setRestaurantId(id: string) {
    localStorage.setItem('kitchen_restaurant_id', id);
    this.deviceProfile.set(null); // Reset profile to force re-registration
  }

  isConfigured(): boolean {
    return !!localStorage.getItem('kitchen_restaurant_id');
  }

  private mapPlatform(platform: string): string {
    switch (platform) {
      case 'android':
        return 'Android';
      case 'ios':
        return 'iPadOS';
      case 'windows':
        return 'Windows';
      default:
        return 'Web';
    }
  }
}
