import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Home',
    loadComponent: () => import('./pages/home').then((m) => m.Home),
  },
  {
    path: 'profile',
    title: 'Profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile').then((m) => m.Profile),
  },
  {
    path: 'admin',
    title: 'Admin',
    canActivate: [authGuard],
    data: { roles: ['admin'] },
    loadComponent: () => import('./pages/admin').then((m) => m.Admin),
  },
  {
    path: 'forbidden',
    title: 'Access denied',
    loadComponent: () => import('./pages/forbidden').then((m) => m.Forbidden),
  },
  { path: '**', redirectTo: '' },
];
