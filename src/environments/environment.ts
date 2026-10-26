// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  /**
   * Clave de la API de TMDB (v3 auth)
   */
  tmdbApiKey: '6d77e6b2a39234cd1c130e431ae58b98',

  /**
   * Token de lectura v4 (Bearer)
   */
  tmdbReadAccessToken: '',

  /** URL base de la API de TMDB v3 */
  tmdbBaseUrl: 'https://api.themoviedb.org/3',

  /** URL base del CDN de imágenes de TMDB */
  imageBaseUrl: 'https://image.tmdb.org/t/p'
};
