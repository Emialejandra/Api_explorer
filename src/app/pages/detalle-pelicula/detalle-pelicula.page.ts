import { Component, OnDestroy, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonSpinner,
  IonTitle,
  IonToast,
  IonToolbar
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  arrowBack,
  calendarOutline,
  cashOutline,
  filmOutline,
  globeOutline,
  heart,
  heartOutline,
  refreshOutline,
  star,
  timeOutline
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { DetallePelicula, Pelicula } from '../../models/pelicula.model';
import { FavoritosService } from '../../services/favoritos.service';
import { PeliculasService } from '../../services/peliculas.service';

@Component({
  selector: 'app-detalle-pelicula',
  templateUrl: './detalle-pelicula.page.html',
  styleUrls: ['./detalle-pelicula.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonButton,
    IonContent,
    IonIcon,
    IonChip,
    IonSpinner,
    IonToast
  ]
})
export class DetallePeliculaPage implements OnInit, OnDestroy {
  movieId?: number;
  pelicula?: DetallePelicula;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  isFavorito: boolean = false;

  // Toast feedback
  showToast: boolean = false;
  toastMessage: string = '';

  private favSubscription?: Subscription;
  private routeSubscription?: Subscription;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private peliculasService = inject(PeliculasService);
  private favoritosService = inject(FavoritosService);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    addIcons({
      arrowBack,
      heart,
      heartOutline,
      star,
      calendarOutline,
      timeOutline,
      globeOutline,
      cashOutline,
      filmOutline,
      alertCircleOutline,
      refreshOutline
    });
  }

  ngOnInit(): void {
    // Lectura inicial por snapshot
    const initialId = this.route.snapshot?.paramMap?.get('id');
    if (initialId) {
      this.movieId = parseInt(initialId, 10);
      if (!isNaN(this.movieId)) {
        this.cargarDetalle(this.movieId);
      }
    }

    // Escuchar cambios reactivos de la ruta si está disponible
    if (this.route.paramMap) {
      this.routeSubscription = this.route.paramMap.subscribe((params) => {
        const idParam = params.get('id');
        if (idParam) {
          const parsed = parseInt(idParam, 10);
          if (!isNaN(parsed) && parsed !== this.movieId) {
            this.movieId = parsed;
            this.cargarDetalle(this.movieId);
          }
        }
      });
    }

    // Suscribirse al estado de favoritos
    this.favSubscription = this.favoritosService.favoritos$.subscribe(() => {
      if (this.movieId) {
        this.isFavorito = this.favoritosService.esFavorito(this.movieId);
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    this.favSubscription?.unsubscribe();
    this.routeSubscription?.unsubscribe();
  }

  /**
   * Consulta los detalles de la película por su ID a TMDB
   */
  cargarDetalle(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.peliculasService.getPeliculaDetalle(id).subscribe({
      next: (detalle) => {
        this.pelicula = detalle;
        this.isFavorito = this.favoritosService.esFavorito(detalle.id);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Error al obtener los detalles de la película.';
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Reintenta cargar el detalle
   */
  reintentar(): void {
    if (this.movieId) {
      this.cargarDetalle(this.movieId);
    }
  }

  /**
   * Agrega o quita la película de favoritos
   */
  async toggleFavorito(): Promise<void> {
    if (!this.pelicula) return;

    const p: Pelicula = {
      id: this.pelicula.id,
      title: this.pelicula.title,
      overview: this.pelicula.overview,
      poster_path: this.pelicula.poster_path,
      backdrop_path: this.pelicula.backdrop_path,
      release_date: this.pelicula.release_date,
      vote_average: this.pelicula.vote_average,
      genre_ids: this.pelicula.genres?.map((g) => g.id) || []
    };

    const added = await this.favoritosService.toggleFavorito(p);
    this.isFavorito = added;
    this.toastMessage = added
      ? `"${p.title}" agregada a favoritos`
      : `"${p.title}" eliminada de favoritos`;
    this.showToast = true;
    this.cdr.markForCheck();
  }

  /**
   * Regresa al catálogo
   */
  regresar(): void {
    this.router.navigate(['/peliculas']);
  }

  getPosterUrl(path?: string | null): string {
    return this.peliculasService.getPosterUrl(path || null, 'w500');
  }

  getBackdropUrl(path?: string | null): string {
    return this.peliculasService.getBackdropUrl(path || null, 'w1280');
  }

  onPosterError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/placeholder-poster.svg';
    }
  }

  onBackdropError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/placeholder-backdrop.svg';
    }
  }

  formatRuntime(minutes?: number | null): string {
    if (!minutes || minutes <= 0) return 'N/D';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  }

  formatCurrency(amount?: number): string {
    if (!amount || amount <= 0) return 'No disponible';
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  }
}
