import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { DetallePeliculaPage } from './detalle-pelicula.page';
import { PeliculasService } from '../../services/peliculas.service';
import { FavoritosService } from '../../services/favoritos.service';
import { of } from 'rxjs';
import { DetallePelicula } from '../../models/pelicula.model';

describe('DetallePeliculaPage', () => {
  let component: DetallePeliculaPage;
  let fixture: ComponentFixture<DetallePeliculaPage>;

  const mockDetalle: DetallePelicula = {
    id: 101,
    title: 'Pelicula de Prueba',
    original_title: 'Test Movie',
    overview: 'Sinopsis de prueba',
    poster_path: '/poster.jpg',
    backdrop_path: '/backdrop.jpg',
    release_date: '2024-05-10',
    vote_average: 8.4,
    vote_count: 1200,
    genres: [{ id: 28, name: 'Acción' }],
    runtime: 125,
    tagline: 'El mejor estreno',
    status: 'Released',
    budget: 50000000,
    revenue: 150000000,
    homepage: null,
    imdb_id: null,
    original_language: 'es',
    popularity: 95
  };

  const peliculasServiceMock = {
    getPeliculaDetalle: () => of(mockDetalle),
    getPosterUrl: () => 'assets/placeholder-poster.svg',
    getBackdropUrl: () => 'assets/placeholder-backdrop.svg',
    hasValidCredentials: () => true
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallePeliculaPage],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: PeliculasService, useValue: peliculasServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? '101' : null)
              }
            }
          }
        },
        FavoritosService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetallePeliculaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create DetallePeliculaPage', () => {
    expect(component).toBeTruthy();
  });

  it('should load movie detail on init', () => {
    expect(component.movieId).toBe(101);
    expect(component.pelicula).toBeDefined();
    expect(component.pelicula?.title).toBe('Pelicula de Prueba');
  });

  it('should format runtime correctly', () => {
    expect(component.formatRuntime(125)).toBe('2h 5m');
    expect(component.formatRuntime(45)).toBe('45m');
    expect(component.formatRuntime(null)).toBe('N/D');
  });
});
