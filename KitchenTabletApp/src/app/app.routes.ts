import { Routes } from '@angular/router';
import { OrdersQueueComponent } from './orders/orders-queue.component';
import { OrderDetailsComponent } from './orders/order-details.component';
import { SetupComponent } from './setup/setup.component';
import { SetupGuard } from './core/setup.guard';

export const appRoutes: Routes = [
  { path: 'setup', component: SetupComponent },
  { path: '', component: OrdersQueueComponent, canActivate: [SetupGuard] },
  { path: 'orders/:id', component: OrderDetailsComponent, canActivate: [SetupGuard] },
  { path: '**', redirectTo: '' }
];
