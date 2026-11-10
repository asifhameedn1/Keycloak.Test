import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { KEYCLOAK_SETTINGS } from './keycloak.config';

/** Adds a fresh bearer token to requests targeting the configured API prefixes. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const { bearerUrlPrefixes } = inject(KEYCLOAK_SETTINGS);
  if (!bearerUrlPrefixes.some((prefix) => req.url.startsWith(prefix))) {
    return next(req);
  }

  const auth = inject(AuthService);
  return from(auth.getToken()).pipe(
    switchMap((token) =>
      next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req),
    ),
  );
};
