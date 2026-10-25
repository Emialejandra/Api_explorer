import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { FavoritosPage } from './favoritos.page';
import { FavoritosService } from '../../services/favoritos.service';
import { PeliculasService } from '../../services/peliculas.service';

describe('FavoritosPage', () => {
  let component: FavoritosPage;
  let fixture: ComponentFixture<FavoritosPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoritosPage],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        FavoritosService,
        PeliculasService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FavoritosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create FavoritosPage', () => {
    expect(component).toBeTruthy();
  });

  it('should display empty message when favorites list is empty', () => {
    expect(component.favoritos.length).toBe(0);
  });
});
