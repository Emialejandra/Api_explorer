import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { PeliculasPage } from './peliculas.page';
import { PeliculasService } from '../../services/peliculas.service';
import { FavoritosService } from '../../services/favoritos.service';
import { of } from 'rxjs';

describe('PeliculasPage', () => {
  let component: PeliculasPage;
  let fixture: ComponentFixture<PeliculasPage>;

  const peliculasServiceMock = {
    getPeliculasPopulares: () => of({ page: 1, results: [], total_pages: 1, total_results: 0 }),
    buscarPeliculas: () => of({ page: 1, results: [], total_pages: 1, total_results: 0 }),
    getPeliculasPorGenero: () => of({ page: 1, results: [], total_pages: 1, total_results: 0 }),
    getGeneros: () => of([]),
    getPosterUrl: () => 'assets/placeholder-poster.svg',
    hasValidCredentials: () => true
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeliculasPage],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: PeliculasService, useValue: peliculasServiceMock },
        FavoritosService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PeliculasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create PeliculasPage', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with page 1', () => {
    expect(component.currentPage).toBe(1);
    expect(component.peliculas).toEqual([]);
  });

  it('should reset pagination when searching', () => {
    component.searchQuery = 'Batman';
    component.currentPage = 3;
    component.resetYConsultar();
    expect(component.currentPage).toBe(1);
  });
});
