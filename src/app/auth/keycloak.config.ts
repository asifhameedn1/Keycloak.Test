import { InjectionToken } from '@angular/core';

export interface KeycloakSettings {
  /** Base URL of the Keycloak server, e.g. http://localhost:8080 */
  url: string;
  /** Realm name */
  realm: string;
  /** Public client ID (Client authentication OFF, Standard flow ON) */
  clientId: string;
  /**
   * Requests whose URL starts with one of these prefixes get an
   * `Authorization: Bearer <token>` header. Keep this to your own APIs so
   * tokens are never sent to third parties.
   */
  bearerUrlPrefixes: string[];
  /** Base URL of the backend API (Keycloak.TestApi). */
  apiUrl: string;
}

export const KEYCLOAK_SETTINGS = new InjectionToken<KeycloakSettings>('KEYCLOAK_SETTINGS');

/**
 * Keycloak.TestApi "https" launch profile. Don't use its http URL (5136) while
 * the https profile is running: it redirects to https, and browsers reject
 * redirected CORS preflights.
 */
const apiUrl = 'https://localhost:7159';

/** Adjust these to match your Keycloak realm and client. */
export const keycloakSettings: KeycloakSettings = {
  url: 'http://localhost:8080',
  realm: 'test-realm',
  clientId: 'keycloak-test-app',
  // Trailing slash so e.g. http://localhost:51360 can't match.
  bearerUrlPrefixes: [`${apiUrl}/`],
  apiUrl,
};
