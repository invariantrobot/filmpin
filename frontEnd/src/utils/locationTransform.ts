import type { Location, Movie } from '../services/api';
import type { FilmLocation } from '../views/mapView';

/**
 * Transform backend Location and Movie data into FilmLocation format for the map
 */
export function transformToFilmLocation(
  location: Location,
  movie?: Movie
): FilmLocation {
  return {
    id: `loc-${location.id}`,
    movieId: location.movie_id,
    latitude: location.lat,
    longitude: location.lon,
    title: location.place,
    movieTitle: movie?.title || 'Unknown Movie',
    // Don't set imageUrl - let the map view load posters from server
    imageUrl: undefined,
    info: location.info,
  };
}

/**
 * Transform multiple locations with their associated movies
 */
export function transformLocationsWithMovies(
  locations: Location[],
  movies: Movie[]
): FilmLocation[] {
  // Create a map of movie ID (IMDB ID) to movie for quick lookup
  const movieMap = new Map<string, Movie>();
  movies.forEach((movie) => movieMap.set(movie.id, movie));

  return locations.map((location) => {
    const movie = movieMap.get(location.movie_id);
    return transformToFilmLocation(location, movie);
  });
}
