import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { AuthGuard } from './core/guards/auth.guard';
import { UserRole } from './models/auth.interface';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: '',
    component: MainLayout,
    // canActivate: [AuthGuard],
    // canActivateChild: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'sales',
        loadChildren: () => import('./features/sales/sales.module').then(m => m.SalesModule)
      },
      {
        path: 'barrels',
        loadChildren: () => import('./features/barrels/barrels.module').then(m => m.BarrelsModule)
      },
      {
        path: 'reports',
        loadChildren: () => import('./features/reports/reports.module').then(m => m.ReportsModule),
        // canActivate: [AuthGuard],
        // data: { roles: [UserRole.ADMIN, UserRole.MANAGER] }
      },
      {
        path: 'profile',
        loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('./features/settings/settings.module').then(m => m.SettingsModule),
        // canActivate: [AuthGuard],
        // data: { roles: [UserRole.ADMIN] }
      }
    ]
  },

  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
