/**
 * Plantilla de configuración de variables de entorno para CineExplorer
 * Copia este archivo o actualiza `src/environments/environment.ts`
 * con tus credenciales de la API de The Movie Database (TMDB).
 */

export const environment = {
  production: false,

  /**
   * TMDB API Key v3:
   * 1. Crea una cuenta gratuita en https://www.themoviedb.org/signup
   * 2. Ve a Configuración de Cuenta -> API (https://www.themoviedb.org/settings/api)
   * 3. Solicita una clave API (Developer) y pega aquí el valor de "API Key (v3 auth)":
   */
  tmdbApiKey: 'TU_API_KEY_AQUI',

  /**
   * Opcional: TMDB API Read Access Token v4 (Bearer auth):
   * Si prefieres autenticación Bearer por cabecera HTTP, pega aquí tu token de lectura.
   */
  tmdbReadAccessToken: '',

  /** URL base para endpoints de TMDB v3 */
  tmdbBaseUrl: 'https://api.themoviedb.org/3',

  /** URL base para CDN de imágenes de TMDB */
  imageBaseUrl: 'https://image.tmdb.org/t/p'
};
