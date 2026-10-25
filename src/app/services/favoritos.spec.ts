import { TestBed } from '@angular/core/testing';
import { FavoritosService } from './favoritos.service';
import { Pelicula } from '../models/pelicula.model';

describe('FavoritosService', () => {
  let service: FavoritosService;

  const mockPelicula: Pelicula = {
    id: 999,
    title: 'Test Movie',
    overview: 'A test synopsis',
    poster_path: '/test.jpg',
    backdrop_path: '/backdrop.jpg',
    release_date: '2024-01-01',
    vote_average: 8.5,
    genre_ids: [28, 12]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FavoritosService]
    });
    service = TestBed.inject(FavoritosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add and remove favorite correctly', async () => {
    // Agregar
    const added = await service.toggleFavorito(mockPelicula);
    expect(added).toBe(true);
    expect(service.esFavorito(mockPelicula.id)).toBe(true);

    // Quitar
    const removed = await service.toggleFavorito(mockPelicula);
    expect(removed).toBe(false);
    expect(service.esFavorito(mockPelicula.id)).toBe(false);
  });
});
