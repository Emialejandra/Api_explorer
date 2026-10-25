import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  DetallePelicula,
  Genero,
  GenerosResponse,
  Pelicula,
  TmdbRespuestaPaginada
} from '../models/pelicula.model';

@Injectable({
  providedIn: 'root'
})
export class PeliculasService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.tmdbBaseUrl || 'https://api.themoviedb.org/3';
  private readonly imageBase = environment.imageBaseUrl || 'https://image.tmdb.org/t/p';

  /**
   * Verifica si existe una credencial (API Key o Bearer Token) configurada en environment
   */
  hasValidCredentials(): boolean {
    const key = (environment.tmdbApiKey || '').trim();
    const token = (environment.tmdbReadAccessToken || '').trim();
    return key.length > 0 || token.length > 0;
  }

  /**
   * Genera los headers y params necesarios para autenticar la petición en TMDB
   */
  private getAuthContext(additionalParams: Record<string, string | number> = {}): {
    headers: HttpHeaders;
    params: HttpParams;
  } {
    let headers = new HttpHeaders({
      'Accept': 'application/json'
    });

    let params = new HttpParams().set('language', 'es-ES');

    const token = (environment.tmdbReadAccessToken || '').trim();
    const apiKey = (environment.tmdbApiKey || '').trim();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    } else if (apiKey) {
      params = params.set('api_key', apiKey);
    }

    Object.keys(additionalParams).forEach((key) => {
      params = params.set(key, additionalParams[key].toString());
    });

    return { headers, params };
  }

  /**
   * R1 & R2: Obtiene el listado de películas populares con paginación
   */
  getPeliculasPopulares(page: number = 1): Observable<TmdbRespuestaPaginada<Pelicula>> {
    if (!this.hasValidCredentials()) {
      return throwError(() => new Error(
        'Credencial de TMDB no configurada. Por favor, agrega tu API Key o Token de TMDB en src/environments/environment.ts'
      ));
    }

    const { headers, params } = this.getAuthContext({ page });
    const url = `${this.baseUrl}/movie/popular`;

    return this.http
      .get<TmdbRespuestaPaginada<Pelicula>>(url, { headers, params })
      .pipe(catchError((err) => this.handleError(err, 'obtener películas populares')));
  }

  /**
   * R3: Busca películas por título con paginación
   */
  buscarPeliculas(query: string, page: number = 1): Observable<TmdbRespuestaPaginada<Pelicula>> {
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      return this.getPeliculasPopulares(page);
    }

    if (!this.hasValidCredentials()) {
      return throwError(() => new Error(
        'Credencial de TMDB no configurada. Por favor, agrega tu API Key o Token de TMDB en src/environments/environment.ts'
      ));
    }

    const { headers, params } = this.getAuthContext({
      query: cleanQuery,
      page,
      include_adult: 'false'
    });
    const url = `${this.baseUrl}/search/movie`;

    return this.http
      .get<TmdbRespuestaPaginada<Pelicula>>(url, { headers, params })
      .pipe(catchError((err) => this.handleError(err, `buscar películas con "${cleanQuery}"`)));
  }

  /**
   * Obtiene películas filtradas por género desde TMDB mediante discover/movie
   */
  getPeliculasPorGenero(generoId: number, page: number = 1): Observable<TmdbRespuestaPaginada<Pelicula>> {
    if (!this.hasValidCredentials()) {
      return throwError(() => new Error(
        'Credencial de TMDB no configurada. Por favor, agrega tu API Key o Token de TMDB en src/environments/environment.ts'
      ));
    }

    const { headers, params } = this.getAuthContext({
      with_genres: generoId,
      page,
      sort_by: 'popularity.desc'
    });
    const url = `${this.baseUrl}/discover/movie`;

    return this.http
      .get<TmdbRespuestaPaginada<Pelicula>>(url, { headers, params })
      .pipe(catchError((err) => this.handleError(err, `obtener películas del género #${generoId}`)));
  }

  /**
   * R4: Obtiene los detalles completos de una película por su identificador
   */
  getPeliculaDetalle(movieId: number): Observable<DetallePelicula> {
    if (!this.hasValidCredentials()) {
      return throwError(() => new Error(
        'Credencial de TMDB no configurada. Por favor, agrega tu API Key o Token de TMDB en src/environments/environment.ts'
      ));
    }

    const { headers, params } = this.getAuthContext();
    const url = `${this.baseUrl}/movie/${movieId}`;

    return this.http
      .get<DetallePelicula>(url, { headers, params })
      .pipe(catchError((err) => this.handleError(err, `consultar detalle de película #${movieId}`)));
  }

  /**
   * Obtiene la lista oficial de géneros de TMDB para filtrado y etiquetas
   */
  getGeneros(): Observable<Genero[]> {
    if (!this.hasValidCredentials()) {
      return of([]);
    }

    const { headers, params } = this.getAuthContext();
    const url = `${this.baseUrl}/genre/movie/list`;

    return this.http
      .get<GenerosResponse>(url, { headers, params })
      .pipe(
        map((res) => res.genres || []),
        catchError(() => of([]))
      );
  }

  /**
   * Construye la URL completa del póster respetando los tamaños soportados por TMDB
   * Tamaños admitidos: 'w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original'
   */
  getPosterUrl(path: string | null | undefined, size: 'w185' | 'w342' | 'w500' | 'w780' = 'w500'): string {
    if (!path) {
      return 'assets/placeholder-poster.svg';
    }
    return `${this.imageBase}/${size}${path}`;
  }

  /**
   * Construye la URL completa del backdrop (imagen de fondo)
   * Tamaños admitidos: 'w300', 'w780', 'w1280', 'original'
   */
  getBackdropUrl(path: string | null | undefined, size: 'w780' | 'w1280' | 'original' = 'w1280'): string {
    if (!path) {
      return 'assets/placeholder-backdrop.svg';
    }
    return `${this.imageBase}/${size}${path}`;
  }

  /**
   * Centraliza y formatea el manejo de errores HTTP
   */
  private handleError(error: HttpErrorResponse | Error, context: string): Observable<never> {
    let mensaje = 'Ocurrió un error inesperado al procesar la solicitud.';

    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        mensaje = 'No se pudo conectar con TMDB. Por favor, revisa tu conexión a Internet.';
      } else if (error.status === 401) {
        mensaje = 'Error de autenticación en TMDB (401). La API Key o Token es inválida o ha expirado.';
      } else if (error.status === 404) {
        mensaje = 'La película o recurso solicitado no existe en TMDB (404).';
      } else if (error.status === 429) {
        mensaje = 'Se superó el límite de peticiones a TMDB. Por favor, espera unos momentos.';
      } else if (error.status >= 500) {
        mensaje = 'El servidor de TMDB reportó un error interno. Intenta nuevamente más tarde.';
      } else if (error.error && typeof error.error === 'object' && error.error.status_message) {
        mensaje = error.error.status_message;
      }
    } else if (error && error.message) {
      mensaje = error.message;
    }

    console.error(`[PeliculasService] Error al ${context}:`, mensaje);
    return throwError(() => new Error(mensaje));
  }
}
