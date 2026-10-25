import { Component, OnDestroy, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonAlert,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToast,
  IonToolbar
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBack,
  filmOutline,
  heart,
  heartDislikeOutline,
  star,
  trashOutline
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { Pelicula } from '../../models/pelicula.model';
import { FavoritosService } from '../../services/favoritos.service';
import { PeliculasService } from '../../services/peliculas.service';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
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
    IonToast,
    IonAlert
  ]
})
export class FavoritosPage implements OnInit, OnDestroy {
  favoritos: Pelicula[] = [];
  private subscription?: Subscription;

  // Toast feedback
  showToast: boolean = false;
  toastMessage: string = '';

  // Confirmación de limpiar todo
  showAlertConfirm: boolean = false;
  alertButtons = [
    {
      text: 'Cancelar',
      role: 'cancel'
    },
    {
      text: 'Eliminar todos',
      role: 'destructive',
      handler: () => {
        this.limpiarTodos();
      }
    }
  ];

  private favoritosService = inject(FavoritosService);
  private peliculasService = inject(PeliculasService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    addIcons({
      arrowBack,
      heart,
      heartDislikeOutline,
      trashOutline,
      star,
      filmOutline
    });
  }

  ngOnInit(): void {
    this.subscription = this.favoritosService.favoritos$.subscribe((list) => {
      this.favoritos = list;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  /**
   * Elimina una película específica de la lista de favoritos
   */
  async eliminar(event: Event, pelicula: Pelicula): Promise<void> {
    event.stopPropagation();
    await this.favoritosService.eliminarFavorito(pelicula.id);
    this.toastMessage = `"${pelicula.title}" eliminada de tus favoritos`;
    this.showToast = true;
    this.cdr.markForCheck();
  }

  /**
   * Limpia toda la lista de favoritos
   */
  async limpiarTodos(): Promise<void> {
    await this.favoritosService.limpiarTodos();
    this.toastMessage = 'Se han eliminado todos los favoritos';
    this.showToast = true;
    this.cdr.markForCheck();
  }

  /**
   * Abre los detalles de una película seleccionada
   */
  verDetalle(id: number): void {
    this.router.navigate(['/detalle-pelicula', id]);
  }

  /**
   * Navega de vuelta al catálogo
   */
  irACatalogo(): void {
    this.router.navigate(['/peliculas']);
  }

  getPosterUrl(path?: string | null): string {
    return this.peliculasService.getPosterUrl(path || null, 'w500');
  }

  onPosterError(event: Event): void {
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
