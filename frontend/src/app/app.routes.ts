import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'pokedex',
    canActivate: [authGuard],
    loadComponent: () => import('./features/pokedex/pokedex.component').then(m => m.PokedexComponent)
  },
  {
    path: 'houses',
    canActivate: [authGuard],
    loadComponent: () => import('./features/houses/houses.component').then(m => m.HousesComponent)
  },
  {
    path: 'houses/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/houses/house-detail/house-detail.component').then(m => m.HouseDetailComponent)
  },
  {
    path: 'items',
    canActivate: [authGuard],
    loadComponent: () => import('./features/items/items.component').then(m => m.ItemsComponent)
  },
  {
    path: 'habitats',
    canActivate: [authGuard],
    loadComponent: () => import('./features/habitats/habitats.component').then(m => m.HabitatsComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/admin-users/admin-users.component').then(m => m.AdminUsersComponent)
      },
      {
        path: 'import',
        loadComponent: () => import('./features/admin/admin-import/admin-import.component').then(m => m.AdminImportComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
