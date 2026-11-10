import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Authenticated pages depend on browser-side Keycloak state: render them on the client only.
  { path: 'profile', renderMode: RenderMode.Client },
  { path: 'admin', renderMode: RenderMode.Client },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
