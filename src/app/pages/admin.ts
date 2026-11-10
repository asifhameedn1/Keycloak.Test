import { Component, inject } from '@angular/core';
import { ApiService, describeHttpError } from '../api.service';

@Component({
  selector: 'app-admin',
  template: `
    <h1 class="text-3xl font-semibold">Admin</h1>
    <p class="mt-4">Only users with the <code>admin</code> role can see this page.</p>
    <h2 class="mt-8 text-xl font-semibold">API check</h2>
    <p class="text-sm text-gray-600">GET /api/values/admin on Keycloak.TestApi</p>
    @if (result.isLoading()) {
      <p class="mt-2">Loading…</p>
    } @else if (result.error()) {
      <p class="mt-2 text-red-700">API call failed: {{ errorText(result.error()) }}</p>
    } @else {
      <p class="mt-2 text-green-700">{{ result.value()?.message }}</p>
    }
  `,
})
export class Admin {
  protected readonly result = inject(ApiService).admin();
  protected readonly errorText = describeHttpError;
}
