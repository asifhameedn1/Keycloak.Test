import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type Keycloak from 'keycloak-js';
import type { KeycloakTokenParsed } from 'keycloak-js';
import { KEYCLOAK_SETTINGS } from './keycloak.config';

/** Minimum remaining token validity (seconds) before a refresh is triggered. */
const MIN_TOKEN_VALIDITY = 30;

/**
 * Thin, SSR-safe wrapper around keycloak-js.
 *
 * keycloak-js only works in the browser, so it is loaded lazily and
 * initialised only on the client. On the server every method is a no-op and
 * the user is reported as unauthenticated.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly settings = inject(KEYCLOAK_SETTINGS);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private keycloak?: Keycloak;

  private readonly _authenticated = signal(false);
  private readonly _token = signal<KeycloakTokenParsed | undefined>(undefined);
  private readonly _initError = signal<string | undefined>(undefined);

  readonly authenticated = this._authenticated.asReadonly();
  readonly tokenParsed = this._token.asReadonly();
  readonly initError = this._initError.asReadonly();

  readonly username = computed(() => this._token()?.['preferred_username'] as string | undefined);
  readonly displayName = computed(() => {
    const t = this._token();
    return (t?.['name'] as string | undefined) ?? (t?.['preferred_username'] as string | undefined);
  });
  readonly email = computed(() => this._token()?.['email'] as string | undefined);
  readonly realmRoles = computed(() => this._token()?.realm_access?.roles ?? []);
  readonly clientRoles = computed(
    () => this._token()?.resource_access?.[this.settings.clientId]?.roles ?? [],
  );

  /** Called once from the app initializer. Never rejects so the app still boots if Keycloak is down. */
  async init(): Promise<void> {
    if (!this.isBrowser) return;

    const { default: KeycloakCtor } = await import('keycloak-js');
    const kc = new KeycloakCtor({
      url: this.settings.url,
      realm: this.settings.realm,
      clientId: this.settings.clientId,
    });
    this.keycloak = kc;

    kc.onAuthSuccess = kc.onAuthRefreshSuccess = () => this.sync();
    kc.onAuthLogout = () => this.sync();
    kc.onAuthRefreshError = () => {
      kc.clearToken();
      this.sync();
    };
    kc.onTokenExpired = () => {
      kc.updateToken(MIN_TOKEN_VALIDITY).catch(() => {
        kc.clearToken();
        this.sync();
      });
    };

    try {
      await kc.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
        pkceMethod: 'S256',
        checkLoginIframe: false,
      });
    } catch (err) {
      console.error('Keycloak initialisation failed', err);
      this._initError.set('Could not reach the authentication server.');
    }
    this.sync();
  }

  login(redirectPath?: string): Promise<void> {
    if (!this.keycloak) return Promise.resolve();
    return this.keycloak.login({
      redirectUri: redirectPath ? window.location.origin + redirectPath : undefined,
    });
  }

  logout(): Promise<void> {
    if (!this.keycloak) return Promise.resolve();
    return this.keycloak.logout({ redirectUri: window.location.origin + '/' });
  }

  accountManagement(): Promise<void> {
    return this.keycloak?.accountManagement() ?? Promise.resolve();
  }

  /** Returns a valid access token, refreshing it first if it is about to expire. */
  async getToken(): Promise<string | undefined> {
    const kc = this.keycloak;
    if (!kc?.authenticated) return undefined;
    try {
      await kc.updateToken(MIN_TOKEN_VALIDITY);
    } catch {
      kc.clearToken();
      this.sync();
      return undefined;
    }
    return kc.token;
  }

  /** True if the user has every given role (realm or this client's roles). */
  hasRoles(roles: readonly string[]): boolean {
    const granted = new Set([...this.realmRoles(), ...this.clientRoles()]);
    return roles.every((r) => granted.has(r));
  }

  private sync(): void {
    const kc = this.keycloak;
    this._authenticated.set(!!kc?.authenticated);
    this._token.set(kc?.authenticated ? kc.tokenParsed : undefined);
  }
}
