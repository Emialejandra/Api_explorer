import { Component, OnDestroy, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSpinner,
  IonTitle,
  IonToolbar
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  closeCircleOutline,
  filmOutline,
  heart,
  heartOutline,
  refreshOutline,
  searchOutline,
  star
} from 'ionicons/icons';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Genero, Pelicula } from '../../models/pelicula.model';
import { FavoritosService } from '../../services/favoritos.service';
import { PeliculasService } from '../../services/peliculas.service';

@Component({
  selector: 'app-peliculas',
  templateUrl: './peliculas.page.html',
  styleUrls: ['./peliculas.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonSearchbar,
    IonChip,
    IonBadge,
    IonIcon,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSpinner,
    IonRefresher,
    IonRefresherContent
  ]
})
export class PeliculasPage implements OnInit, OnDestroy {
  // Lista acumulada de películas
  peliculas: Pelicula[] = [];

  // Paginación y control de carga
  currentPage: number = 1;
  totalPages: number = 1;
  isLoading: boolean = false;
  isInitialLoading: boolean = true;
  isInfiniteDisabled: boolean = false;

  // Búsqueda y debounce
  searchQuery: string = '';
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  private favSubscription?: Subscription;

  // Filtros por género
  generos: Genero[] = [];
  selectedGeneroId: number | null = null;

  // Manejo de errores
  errorMessage: string | null = null;
  isAuthError: boolean = false;

  // Contador de favoritos para el badge de navegación
  totalFavoritos: number = 0;

  // Conjunto de IDs de favoritos para verificación rápida O(1)
  favoritosIds = new Set<number>();

  private peliculasService = inject(PeliculasService);
  private favoritosService = inject(FavoritosService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    addIcons({
      heart,
      heartOutline,
      star,
      searchOutline,
      closeCircleOutline,
      filmOutline,
      alertCircleOutline,
      refreshOutline
    });
  }

  ngOnInit(): void {
    // Suscripción reactiva al cambio de favoritos
    this.favSubscription = this.favoritosService.favoritos$.subscribe((favs) => {
      this.totalFavoritos = favs.length;
      this.favoritosIds = new Set(favs.map((f) => f.id));
      this.cdr.markForCheck();
    });

    // Configuración del debounce para la búsqueda
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe((query) => {
        this.searchQuery = query;
        this.resetYConsultar();
      });

    // Cargar catálogo inicial y géneros
    this.cargarGeneros();
    this.cargarPeliculas(1);
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.favSubscription?.unsubscribe();
  }

  /**
   * Carga los géneros oficiales de TMDB para el selector de filtros
   */
  cargarGeneros(): void {
    this.peliculasService.getGeneros().subscribe({
      next: (genres) => {
        this.generos = genres;
        this.cdr.markForCheck();
      },
      error: () => {
        this.generos = [];
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Carga películas (populares o por búsqueda) para una página específica
   */
  cargarPeliculas(page: number, event?: any): void {
    if (this.isLoading) {
      if (event) event.target.complete();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.isAuthError = false;
    this.cdr.markForCheck();

    let request$;
    if (this.searchQuery.trim().length > 0) {
      request$ = this.peliculasService.buscarPeliculas(this.searchQuery, page);
    } else if (this.selectedGeneroId !== null) {
      request$ = this.peliculasService.getPeliculasPorGenero(this.selectedGeneroId, page);
    } else {
      request$ = this.peliculasService.getPeliculasPopulares(page);
    }

    request$.subscribe({
      next: (resp) => {
        this.currentPage = resp.page;
        this.totalPages = resp.total_pages;

        // Evitar películas duplicadas mediante Set de IDs
        const existingIds = new Set(this.peliculas.map((p) => p.id));
        const newUniqueMovies = resp.results.filter((p) => !existingIds.has(p.id));

        if (page === 1) {
          this.peliculas = [...resp.results];
        } else {
          this.peliculas = [...this.peliculas, ...newUniqueMovies];
        }

        // Deshabilitar infinite scroll si se alcanzaron todas las páginas disponibles
        this.isInfiniteDisabled = this.currentPage >= this.totalPages || this.peliculas.length === 0;

        this.isLoading = false;
        this.isInitialLoading = false;
        if (event) event.target.complete();
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.isInitialLoading = false;
        this.errorMessage = err.message || 'Error al conectar con TMDB.';
        this.isAuthError =
          err.message.includes('401') ||
          err.message.toLowerCase().includes('credencial');
        if (event) event.target.complete();
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * R2: Infinite Scrolling
   */
  loadMore(event: any): void {
    if (this.currentPage >= this.totalPages || this.isLoading) {
      event.target.complete();
      this.isInfiniteDisabled = true;
      return;
    }
    this.cargarPeliculas(this.currentPage + 1, event);
  }

  /**
   * Pull to refresh
   */
  doRefresh(event: any): void {
    this.currentPage = 1;
    this.isInfiniteDisabled = false;
    this.cargarPeliculas(1, event);
  }

  /**
   * R3: Evento disparado al escribir en ion-searchbar
   */
  onSearchChange(event: any): void {
    const value = event?.detail?.value ?? '';
    this.searchSubject.next(value);
  }

  /**
   * Limpia la barra de búsqueda y recarga populares
   */
  limpiarBusqueda(): void {
    this.searchQuery = '';
    this.resetYConsultar();
  }

  /**
   * Reinicia la paginación y vuelve a consultar
   */
  resetYConsultar(): void {
    this.currentPage = 1;
    this.totalPages = 1;
    this.peliculas = [];
    this.isInfiniteDisabled = false;
    this.isInitialLoading = true;
    this.cargarPeliculas(1);
  }

  /**
   * Filtro por género remoto desde TMDB
   */
  seleccionarGenero(generoId: number | null): void {
    if (this.selectedGeneroId === generoId) return;
    this.selectedGeneroId = generoId;
    this.searchQuery = '';
    this.resetYConsultar();
  }

  /**
   * Nombre del género actualmente filtrado
   */
  get nombreGeneroSeleccionado(): string {
    if (!this.selectedGeneroId) return '';
    const g = this.generos.find((item) => item.id === this.selectedGeneroId);
    return g ? g.name : '';
  }

  /**
   * Lista de películas a mostrar
   */
  get peliculasFiltradas(): Pelicula[] {
    return this.peliculas;
  }

  /**
   * R4: Navegación hacia el detalle de una película
   */
  verDetalle(id: number): void {
    this.router.navigate(['/detalle-pelicula', id]);
  }

  /**
   * Navegación a la página de favoritos
   */
  irAFavoritos(): void {
    this.router.navigate(['/favoritos']);
  }

  /**
   * R6: Agrega o quita de favoritos
   */
  async toggleFavorito(event: Event, pelicula: Pelicula): Promise<void> {
    event.stopPropagation();
    await this.favoritosService.toggleFavorito(pelicula);
    this.cdr.markForCheck();
  }

  esFavorito(id: number): boolean {
    return this.favoritosIds.has(id);
  }

  getPosterUrl(path: string | null): string {
    return this.peliculasService.getPosterUrl(path, 'w500');
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/placeholder-poster.svg';
    }
  }

  getYear(releaseDate?: string): string {
    if (!releaseDate) return 'N/D';
    return releaseDate.split('-')[0] || 'N/D';
  }
}
