import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { DeviceAuthService } from './device-auth.service';

@Injectable({ providedIn: 'root' })
export class SetupGuard implements CanActivate {
  constructor(
    private router: Router,
    private deviceAuth: DeviceAuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.deviceAuth.isConfigured()) {
      return true;
    }

    this.router.navigate(['/setup']);
    return false;
  }
}
