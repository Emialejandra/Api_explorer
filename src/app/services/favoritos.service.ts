import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject, Observable } from 'rxjs';
import { Pelicula } from '../models/pelicula.model';

const STORAGE_KEY = 'cineexplorer_favoritos';

@Injectable({
  providedIn: 'root'
})
export class FavoritosService {
  private favoritosSubject = new BehaviorSubject<Pelicula[]>([]);
  public favoritos$: Observable<Pelicula[]> = this.favoritosSubject.asObservable();
  private initPromise: Promise<Pelicula[]>;

  constructor() {
    this.initPromise = this.cargarFavoritos();
  }

  /**
   * Asegura que los favoritos almacenados se hayan leído antes de operar
   */
  async asegurarInicializado(): Promise<Pelicula[]> {
    return this.initPromise;
  }

  /**
   * Carga los favoritos almacenados en Capacitor Preferences
   */
  async cargarFavoritos(): Promise<Pelicula[]> {
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEY });
      if (value) {
        const parsed: Pelicula[] = JSON.parse(value);
        if (Array.isArray(parsed)) {
          this.favoritosSubject.next(parsed);
          return parsed;
        }
      }
      this.favoritosSubject.next([]);
      return [];
    } catch (error) {
      console.error('Error al cargar favoritos de Preferences:', error);
      this.favoritosSubject.next([]);
      return [];
    }
  }

  /**
   * Obtiene la lista actual de películas favoritas de forma síncrona
   */
  getFavoritosSnapshot(): Pelicula[] {
    return this.favoritosSubject.getValue();
  }

  /**
   * Comprueba si una película está marcada como favorita por su ID
   */
  esFavorito(id: number): boolean {
    return this.favoritosSubject.getValue().some((p) => p.id === id);
  }

  /**
   * Agrega o remueve una película de favoritos
   * @returns true si ahora es favorita, false si fue removida
   */
  async toggleFavorito(pelicula: Pelicula): Promise<boolean> {
    await this.initPromise;

    const list = [...this.favoritosSubject.getValue()];
    const index = list.findIndex((p) => p.id === pelicula.id);

    if (index >= 0) {
      list.splice(index, 1);
      await this.guardar(list);
      return false;
    } else {
      const peliculaLimpia: Pelicula = {
        id: pelicula.id,
        title: pelicula.title,
        overview: pelicula.overview || '',
        poster_path: pelicula.poster_path,
        backdrop_path: pelicula.backdrop_path,
        release_date: pelicula.release_date || '',
        vote_average: pelicula.vote_average || 0,
        genre_ids: pelicula.genre_ids || []
      };
      list.unshift(peliculaLimpia);
      await this.guardar(list);
      return true;
    }
  }

  /**
   * Agrega una película a favoritos evitando duplicados
   */
  async agregarFavorito(pelicula: Pelicula): Promise<void> {
    await this.initPromise;
    const list = [...this.favoritosSubject.getValue()];
    if (!list.some((p) => p.id === pelicula.id)) {
      list.unshift(pelicula);
      await this.guardar(list);
    }
  }

  /**
   * Elimina una película de favoritos por su ID
   */
  async eliminarFavorito(id: number): Promise<void> {
    await this.initPromise;
    const list = this.favoritosSubject.getValue().filter((p) => p.id !== id);
    await this.guardar(list);
  }

  /**
   * Limpia todos los favoritos
   */
  async limpiarTodos(): Promise<void> {
    await this.initPromise;
    await this.guardar([]);
  }

  private async guardar(list: Pelicula[]): Promise<void> {
    try {
      this.favoritosSubject.next(list);
      await Preferences.set({
        key: STORAGE_KEY,
        value: JSON.stringify(list)
      });
    } catch (error) {
      console.error('Error al guardar favoritos en Preferences:', error);
    }
  }
}
