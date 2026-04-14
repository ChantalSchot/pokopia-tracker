import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { authGuard, adminGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { UserResponse } from '../models';

describe('Auth Guards', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = {} as RouterStateSnapshot;

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
    authServiceSpy = jasmine.createSpyObj('AuthService', ['checkAuth'], {
      isLoggedIn: jasmine.createSpy('isLoggedIn'),
      isAdmin: jasmine.createSpy('isAdmin')
    });
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
  });

  describe('authGuard', () => {
    it('should allow access when user is already logged in', () => {
      (authServiceSpy.isLoggedIn as jasmine.Spy).and.returnValue(true);

      const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(result).toBeTrue();
    });

    it('should call checkAuth when user is not logged in', (done: DoneFn) => {
      (authServiceSpy.isLoggedIn as jasmine.Spy).and.returnValue(false);
      authServiceSpy.checkAuth.and.returnValue(of(mockUser));

      const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      if (result instanceof Object && 'subscribe' in result) {
        (result as any).subscribe((allowed: boolean) => {
          expect(allowed).toBeTrue();
          expect(authServiceSpy.checkAuth).toHaveBeenCalled();
          done();
        });
      } else {
        fail('Expected an Observable when user is not logged in');
      }
    });

    it('should redirect to /login when checkAuth returns null', (done: DoneFn) => {
      (authServiceSpy.isLoggedIn as jasmine.Spy).and.returnValue(false);
      authServiceSpy.checkAuth.and.returnValue(of(null));

      const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      if (result instanceof Object && 'subscribe' in result) {
        (result as any).subscribe((allowed: boolean) => {
          expect(allowed).toBeFalse();
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
          done();
        });
      } else {
        fail('Expected an Observable when user is not logged in');
      }
    });
  });

  describe('adminGuard', () => {
    it('should allow access when user is logged in and is admin', () => {
      (authServiceSpy.isLoggedIn as jasmine.Spy).and.returnValue(true);
      (authServiceSpy.isAdmin as jasmine.Spy).and.returnValue(true);

      const result = TestBed.runInInjectionContext(() => adminGuard(mockRoute, mockState));

      expect(result).toBeTrue();
    });

    it('should redirect to /dashboard when user is logged in but not admin', () => {
      (authServiceSpy.isLoggedIn as jasmine.Spy).and.returnValue(true);
      (authServiceSpy.isAdmin as jasmine.Spy).and.returnValue(false);

      const result = TestBed.runInInjectionContext(() => adminGuard(mockRoute, mockState));

      expect(result).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should call checkAuth when user is not logged in and allow admin', (done: DoneFn) => {
      (authServiceSpy.isLoggedIn as jasmine.Spy).and.returnValue(false);
      authServiceSpy.checkAuth.and.returnValue(of(mockAdminUser));
      // After checkAuth resolves, isAdmin should return true
      let callCount = 0;
      (authServiceSpy.isAdmin as jasmine.Spy).and.callFake(() => {
        // First call in the initial check returns false (not logged in)
        // After checkAuth sets the user, isAdmin returns true
        callCount++;
        return callCount > 0;
      });

      const result = TestBed.runInInjectionContext(() => adminGuard(mockRoute, mockState));

      if (result instanceof Object && 'subscribe' in result) {
        (result as any).subscribe((allowed: boolean) => {
          expect(allowed).toBeTrue();
          expect(authServiceSpy.checkAuth).toHaveBeenCalled();
          done();
        });
      } else {
        fail('Expected an Observable when user is not logged in');
      }
    });

    it('should redirect to /dashboard when checkAuth returns non-admin user', (done: DoneFn) => {
      (authServiceSpy.isLoggedIn as jasmine.Spy).and.returnValue(false);
      authServiceSpy.checkAuth.and.returnValue(of(mockUser));
      (authServiceSpy.isAdmin as jasmine.Spy).and.returnValue(false);

      const result = TestBed.runInInjectionContext(() => adminGuard(mockRoute, mockState));

      if (result instanceof Object && 'subscribe' in result) {
        (result as any).subscribe((allowed: boolean) => {
          expect(allowed).toBeFalse();
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
          done();
        });
      } else {
        fail('Expected an Observable when user is not logged in');
      }
    });

    it('should redirect to /dashboard when checkAuth returns null', (done: DoneFn) => {
      (authServiceSpy.isLoggedIn as jasmine.Spy).and.returnValue(false);
      authServiceSpy.checkAuth.and.returnValue(of(null));
      (authServiceSpy.isAdmin as jasmine.Spy).and.returnValue(false);

      const result = TestBed.runInInjectionContext(() => adminGuard(mockRoute, mockState));

      if (result instanceof Object && 'subscribe' in result) {
        (result as any).subscribe((allowed: boolean) => {
          expect(allowed).toBeFalse();
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
          done();
        });
      } else {
        fail('Expected an Observable when user is not logged in');
      }
    });
  });
});
