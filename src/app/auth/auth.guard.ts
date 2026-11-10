import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Requires an authenticated user. Optionally requires roles via route data:
 * `{ canActivate: [authGuard], data: { roles: ['admin'] } }`.
 *
 * Unauthenticated users are sent to the Keycloak login page and returned to
 * the requested URL afterwards.
 */
export const authGuard: CanActivateFn = async (route, state) => {
  // Protected routes are client-rendered (see app.routes.server.ts); never
  // render protected content on the server.
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return false;

  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.authenticated()) {
    await auth.login(state.url);
    return false;
  }

  const required = (route.data['roles'] as string[] | undefined) ?? [];
  return auth.hasRoles(required) ? true : router.parseUrl('/forbidden');
};
