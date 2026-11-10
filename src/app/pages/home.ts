import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <h1 class="text-3xl font-semibold">Keycloak test app</h1>
    @if (auth.authenticated()) {
      <p class="mt-4">
        Signed in as <strong>{{ auth.displayName() }}</strong>.
        <a routerLink="/profile" class="text-blue-600 underline">View your profile</a>.
      </p>
    } @else {
      <p class="mt-4">You are not signed in.</p>
      <button
        type="button"
        class="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        (click)="auth.login()"
      >
        Sign in with Keycloak
      </button>
    }
  `,
})
export class Home {
  protected readonly auth = inject(AuthService);
}
