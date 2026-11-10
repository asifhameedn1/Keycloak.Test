import { Component, inject } from '@angular/core';
import { DatePipe, JsonPipe } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { ApiService, describeHttpError } from '../api.service';

@Component({
  selector: 'app-profile',
  imports: [JsonPipe, DatePipe],
  template: `
    <h1 class="text-3xl font-semibold">Profile</h1>
    <dl class="mt-6 grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2">
      <dt class="font-medium">Username</dt>
      <dd>{{ auth.username() }}</dd>
      <dt class="font-medium">Name</dt>
      <dd>{{ auth.displayName() ?? '—' }}</dd>
      <dt class="font-medium">Email</dt>
      <dd>{{ auth.email() ?? '—' }}</dd>
      <dt class="font-medium">Realm roles</dt>
      <dd>{{ auth.realmRoles().join(', ') || '—' }}</dd>
      <dt class="font-medium">Client roles</dt>
      <dd>{{ auth.clientRoles().join(', ') || '—' }}</dd>
      <dt class="font-medium">Token expires</dt>
      <dd>{{ (auth.tokenParsed()?.exp ?? 0) * 1000 | date: 'medium' }}</dd>
    </dl>
    <button
      type="button"
      class="mt-6 rounded border border-gray-300 px-4 py-2 hover:bg-gray-100"
      (click)="auth.accountManagement()"
    >
      Manage account in Keycloak
    </button>
    <h2 class="mt-8 text-xl font-semibold">What the API sees</h2>
    <p class="text-sm text-gray-600">GET /api/values/me on Keycloak.TestApi</p>
    @if (apiMe.isLoading()) {
      <p class="mt-2">Loading…</p>
    } @else if (apiMe.error()) {
      <p class="mt-2 text-red-700">API call failed: {{ errorText(apiMe.error()) }}</p>
    } @else {
      <pre class="mt-2 overflow-x-auto rounded bg-gray-100 p-4 text-sm">{{ apiMe.value() | json }}</pre>
    }
    <details class="mt-6">
      <summary class="cursor-pointer font-medium">Access token claims</summary>
      <pre class="mt-2 overflow-x-auto rounded bg-gray-100 p-4 text-sm">{{ auth.tokenParsed() | json }}</pre>
    </details>
  `,
})
export class Profile {
  protected readonly auth = inject(AuthService);
  protected readonly apiMe = inject(ApiService).me();
  protected readonly errorText = describeHttpError;
}
