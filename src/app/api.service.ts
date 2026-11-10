import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { KEYCLOAK_SETTINGS } from './auth/keycloak.config';

export interface ApiMe {
  name: string;
  subject: string;
  roles: string[];
}

export function describeHttpError(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'API unreachable (is Keycloak.TestApi running? CORS?)';
    if (err.status === 401) return '401 Unauthorized (token rejected — check audience/issuer)';
    if (err.status === 403) return '403 Forbidden (missing role)';
    return `${err.status} ${err.statusText}`;
  }
  return String(err);
}

/** Calls to Keycloak.TestApi. The auth interceptor attaches the bearer token. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = inject(KEYCLOAK_SETTINGS).apiUrl;

  /** GET /api/values/me — must be called in an injection context (e.g. a field initializer). */
  me() {
    return httpResource<ApiMe>(() => `${this.baseUrl}/api/values/me`);
  }

  /** GET /api/values/admin — requires the "admin" role. */
  admin() {
    return httpResource<{ message: string }>(() => `${this.baseUrl}/api/values/admin`);
  }
}
