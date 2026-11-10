import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  imports: [RouterLink],
  template: `
    <h1 class="text-3xl font-semibold">Access denied</h1>
    <p class="mt-4">You don't have the role required to view that page.</p>
    <a routerLink="/" class="mt-4 inline-block text-blue-600 underline">Back to home</a>
  `,
})
export class Forbidden {}
