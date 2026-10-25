import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { PeliculasService } from './peliculas.service';

describe('PeliculasService', () => {
  let service: PeliculasService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PeliculasService,
        provideHttpClient()
      ]
    });
    service = TestBed.inject(PeliculasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should format poster URLs correctly', () => {
    const url = service.getPosterUrl('/sample.jpg', 'w500');
    expect(url).toContain('/w500/sample.jpg');
  });

  it('should return fallback image when path is null', () => {
    const url = service.getPosterUrl(null);
    expect(url).toContain('placeholder-poster.svg');
  });
});
