import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'peliculas',
    pathMatch: 'full',
  },
  {
    path: 'peliculas',
    loadComponent: () => import('./pages/peliculas/peliculas.page').then((m) => m.PeliculasPage)
  },
  {
    path: 'detalle-pelicula/:id',
    loadComponent: () => import('./pages/detalle-pelicula/detalle-pelicula.page').then((m) => m.DetallePeliculaPage)
  },
  {
    path: 'favoritos',
    loadComponent: () => import('./pages/favoritos/favoritos.page').then((m) => m.FavoritosPage)
  },
  // Redirecciones de compatibilidad hacia las rutas definitivas en español
  {
    path: 'movies',
    redirectTo: 'peliculas',
    pathMatch: 'full'
  },
  {
    path: 'movies-details',
    redirectTo: 'peliculas',
    pathMatch: 'full'
  },
  {
    path: 'favorits',
    redirectTo: 'favoritos',
    pathMatch: 'full'
  },
  {
    path: 'home',
    redirectTo: 'peliculas',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'peliculas'
  }
];
