import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '@env';
import {
  UserResponse, LoginRequest, RegisterRequest,
  ForgotPasswordRequest, ResetPasswordRequest
} from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/api/auth`;
  private currentUser = signal<UserResponse | null>(null);

  readonly user = this.currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.roles?.includes('ADMIN') ?? false);
  readonly username = computed(() => this.currentUser()?.username ?? '');

  constructor(private http: HttpClient, private router: Router) {}

  register(request: RegisterRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiUrl}/register`, request, { withCredentials: true });
  }

  login(request: LoginRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiUrl}/login`, request, { withCredentials: true })
      .pipe(tap(user => this.currentUser.set(user)));
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .pipe(tap(() => {
        this.currentUser.set(null);
        this.router.navigate(['/login']);
      }));
  }

  refresh(): Observable<UserResponse | null> {
    return this.http.post<UserResponse>(`${this.apiUrl}/refresh`, {}, { withCredentials: true })
      .pipe(
        tap(user => this.currentUser.set(user)),
        catchError(() => {
          this.currentUser.set(null);
          return of(null);
        })
      );
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/forgot-password`, request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reset-password`, request);
  }

  setUser(user: UserResponse | null): void {
    this.currentUser.set(user);
  }

  checkAuth(): Observable<UserResponse | null> {
    return this.refresh();
  }
}
