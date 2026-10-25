/**
 * Modelos e interfaces TypeScript para la API de The Movie Database (TMDB)
 */

export interface Genero {
  id: number;
  name: string;
}

export interface GenerosResponse {
  genres: Genero[];
}

export interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

/**
 * Representa una película en los listados y búsquedas de TMDB
 */
export interface Pelicula {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids?: number[];
  original_title?: string;
  original_language?: string;
  popularity?: number;
  vote_count?: number;
  adult?: boolean;
  video?: boolean;
}

/**
 * Representa la información detallada de una película de TMDB
 */
export interface DetallePelicula {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genres: Genero[];
  runtime: number | null;
  tagline: string | null;
  status: string;
  budget: number;
  revenue: number;
  homepage: string | null;
  imdb_id: string | null;
  original_language: string;
  popularity: number;
  production_companies?: ProductionCompany[];
  production_countries?: ProductionCountry[];
  spoken_languages?: SpokenLanguage[];
}

/**
 * Representa la estructura de respuesta paginada de TMDB
 */
export interface TmdbRespuestaPaginada<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}
