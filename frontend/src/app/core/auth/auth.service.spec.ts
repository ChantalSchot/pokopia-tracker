import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '@env';
import {
  UserResponse, LoginRequest, RegisterRequest,
  ForgotPasswordRequest, ResetPasswordRequest
} from '../models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  const apiUrl = `${environment.apiUrl}/api/auth`;

  const mockUser: UserResponse = {
    id: 'user-1',
    username: 'ash',
    email: 'ash@pokopia.com',
    roles: ['USER'],
    emailVerified: true,
    createdAt: '2026-01-01T00:00:00Z'
  };

  const mockAdminUser: UserResponse = {
    id: 'admin-1',
    username: 'oak',
    email: 'oak@pokopia.com',
    roles: ['USER', 'ADMIN'],
    emailVerified: true,
    createdAt: '2026-01-01T00:00:00Z'
  };

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('initial state', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have null user initially', () => {
      expect(service.user()).toBeNull();
    });

    it('should not be logged in initially', () => {
      expect(service.isLoggedIn()).toBeFalse();
    });

    it('should not be admin initially', () => {
      expect(service.isAdmin()).toBeFalse();
    });

    it('should have empty username initially', () => {
      expect(service.username()).toBe('');
    });
  });

  describe('register', () => {
    it('should POST to /register and return user', () => {
      const request: RegisterRequest = {
        username: 'ash',
        email: 'ash@pokopia.com',
        password: 'pikachu123'
      };

      service.register(request).subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${apiUrl}/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      expect(req.request.withCredentials).toBeTrue();
      req.flush(mockUser);
    });

    it('should not update currentUser signal on register', () => {
      const request: RegisterRequest = {
        username: 'ash',
        email: 'ash@pokopia.com',
        password: 'pikachu123'
      };

      service.register(request).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/register`);
      req.flush(mockUser);

      expect(service.user()).toBeNull();
      expect(service.isLoggedIn()).toBeFalse();
    });
  });

  describe('login', () => {
    it('should POST to /login and return user', () => {
      const request: LoginRequest = { username: 'ash', password: 'pikachu123' };

      service.login(request).subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      expect(req.request.withCredentials).toBeTrue();
      req.flush(mockUser);
    });

    it('should set currentUser signal on successful login', () => {
      const request: LoginRequest = { username: 'ash', password: 'pikachu123' };

      service.login(request).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush(mockUser);

      expect(service.user()).toEqual(mockUser);
      expect(service.isLoggedIn()).toBeTrue();
      expect(service.username()).toBe('ash');
    });

    it('should set isAdmin to true when user has ADMIN role', () => {
      const request: LoginRequest = { username: 'oak', password: 'research123' };

      service.login(request).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush(mockAdminUser);

      expect(service.isAdmin()).toBeTrue();
    });

    it('should set isAdmin to false when user lacks ADMIN role', () => {
      const request: LoginRequest = { username: 'ash', password: 'pikachu123' };

      service.login(request).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush(mockUser);

      expect(service.isAdmin()).toBeFalse();
    });

    it('should not update state on login HTTP error', () => {
      const request: LoginRequest = { username: 'ash', password: 'wrong' };

      service.login(request).subscribe({
        error: () => {}
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      expect(service.user()).toBeNull();
      expect(service.isLoggedIn()).toBeFalse();
    });
  });

  describe('logout', () => {
    it('should POST to /logout', () => {
      // First login
      service.setUser(mockUser);

      service.logout().subscribe();

      const req = httpMock.expectOne(`${apiUrl}/logout`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      expect(req.request.withCredentials).toBeTrue();
      req.flush(null);
    });

    it('should clear currentUser and navigate to /login on logout', () => {
      service.setUser(mockUser);
      expect(service.isLoggedIn()).toBeTrue();

      service.logout().subscribe();

      const req = httpMock.expectOne(`${apiUrl}/logout`);
      req.flush(null);

      expect(service.user()).toBeNull();
      expect(service.isLoggedIn()).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('refresh', () => {
    it('should POST to /refresh and set user on success', () => {
      service.refresh().subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${apiUrl}/refresh`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      expect(req.request.withCredentials).toBeTrue();
      req.flush(mockUser);

      expect(service.user()).toEqual(mockUser);
      expect(service.isLoggedIn()).toBeTrue();
    });

    it('should clear user and return null on refresh error', () => {
      service.setUser(mockUser);

      service.refresh().subscribe(user => {
        expect(user).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/refresh`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      expect(service.user()).toBeNull();
      expect(service.isLoggedIn()).toBeFalse();
    });
  });

  describe('forgotPassword', () => {
    it('should POST to /forgot-password', () => {
      const request: ForgotPasswordRequest = { email: 'ash@pokopia.com' };

      service.forgotPassword(request).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/forgot-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(null);
    });

    it('should not send withCredentials for forgot password', () => {
      const request: ForgotPasswordRequest = { email: 'ash@pokopia.com' };

      service.forgotPassword(request).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/forgot-password`);
      expect(req.request.withCredentials).toBeFalse();
      req.flush(null);
    });
  });

  describe('resetPassword', () => {
    it('should POST to /reset-password', () => {
      const request: ResetPasswordRequest = {
        token: 'reset-token-abc',
        newPassword: 'newpass123'
      };

      service.resetPassword(request).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/reset-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(null);
    });

    it('should not send withCredentials for reset password', () => {
      const request: ResetPasswordRequest = {
        token: 'reset-token-abc',
        newPassword: 'newpass123'
      };

      service.resetPassword(request).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/reset-password`);
      expect(req.request.withCredentials).toBeFalse();
      req.flush(null);
    });
  });

  describe('setUser', () => {
    it('should set user and update computed signals', () => {
      service.setUser(mockUser);

      expect(service.user()).toEqual(mockUser);
      expect(service.isLoggedIn()).toBeTrue();
      expect(service.isAdmin()).toBeFalse();
      expect(service.username()).toBe('ash');
    });

    it('should clear user when set to null', () => {
      service.setUser(mockUser);
      service.setUser(null);

      expect(service.user()).toBeNull();
      expect(service.isLoggedIn()).toBeFalse();
      expect(service.isAdmin()).toBeFalse();
      expect(service.username()).toBe('');
    });

    it('should reflect admin status for admin user', () => {
      service.setUser(mockAdminUser);

      expect(service.isAdmin()).toBeTrue();
    });
  });

  describe('checkAuth', () => {
    it('should delegate to refresh', () => {
      service.checkAuth().subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${apiUrl}/refresh`);
      expect(req.request.method).toBe('POST');
      req.flush(mockUser);

      expect(service.user()).toEqual(mockUser);
    });
  });
});
