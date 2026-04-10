import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./components/layout/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'interns',
        loadComponent: () => import('./components/intern/intern-list.component').then(m => m.InternListComponent)
      },
      {
        path: 'interns/add',
        loadComponent: () => import('./components/intern/intern-form.component').then(m => m.InternFormComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'MANAGER'] }
      },
      {
        path: 'interns/edit/:id',
        loadComponent: () => import('./components/intern/intern-form.component').then(m => m.InternFormComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'MANAGER'] }
      },
      {
        path: 'batches',
        loadComponent: () => import('./components/batch/batch-list.component').then(m => m.BatchListComponent)
      },
      {
        path: 'batches/add',
        loadComponent: () => import('./components/batch/batch-form.component').then(m => m.BatchFormComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'MANAGER'] }
      },
      {
        path: 'batches/:id/overview',
        loadComponent: () => import('./components/batch/batch-overview.component').then(m => m.BatchOverviewComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./components/notifications/notifications.component').then(m => m.NotificationsComponent)
      }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
