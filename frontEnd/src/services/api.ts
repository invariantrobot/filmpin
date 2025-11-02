// API service for fetching data from the backend

const API_BASE_URL = 'http://localhost:8989/api';

export interface Location {
  id: number;
  movie_id: string; // IMDB ID like "tt0073486"
  place: string;
  lat: number;
  lon: number;
  info?: string;
  movieTitle: string;
}

export interface Movie {
  id: string; // IMDB ID like "tt0073486"
  title: string;
  genre?: string;
  year?: number;
  posterUrl?: string; // URL to movie poster
  rating?: number;
  runTime?: number; // Duration in minutes
  plot?: string; // Film description
  // Add other movie fields as needed
}

/**
 * Fetch all locations from the backend
 */
export async function getAllLocations(): Promise<Location[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/getAllLocations`);
    const data = await response.json();

    if (data.success && data.allLocations) {
      return data.allLocations as Location[];
    }

    throw new Error('Failed to fetch locations');
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
}

/**
 * Fetch all movie titles from the backend
 */
export async function getAllTitles(): Promise<Movie[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/getAllTitles`);
    const data = await response.json();

    if (data.success && data.allMovies) {
      return data.allMovies as Movie[];
    }

    throw new Error('Failed to fetch movies');
  } catch (error) {
    console.error('Error fetching movies:', error);
    throw error;
  }
}

/**
 * Fetch locations for specific movie IDs
 */
export async function getLocationsByID(
  ids: string[]
): Promise<Record<string, Location[]>> {
  try {
    const queryString = ids.map((id) => `id=${id}`).join('&');
    const response = await fetch(
      `${API_BASE_URL}/getLocationsByID?${queryString}`
    );
    const data = await response.json();

    if (data.success && data.locations) {
      return data.locations;
    }

    throw new Error('Failed to fetch locations by ID');
  } catch (error) {
    console.error('Error fetching locations by ID:', error);
    throw error;
  }
}

/**
 * Search movies by title
 */
export async function getByTitle(title: string): Promise<Movie[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/getByTitle?title=${encodeURIComponent(title)}`
    );
    const data = await response.json();

    if (data.success && data.allTitles) {
      return data.allTitles as Movie[];
    }

    return [];
  } catch (error) {
    console.error('Error searching by title:', error);
    throw error;
  }
}

/**
 * Search locations by place name
 */
export async function getByLocation(place: string): Promise<Location[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/getByLocation?place=${encodeURIComponent(place)}`
    );
    const data = await response.json();

    if (data.success && data.allLocations) {
      return data.allLocations as Location[];
    }

    return [];
  } catch (error) {
    console.error('Error searching by location:', error);
    throw error;
  }
}

/**
 * Fetch locations within a certain distance from coordinates
 */
export async function getClose(
  coordinates: [number, number],
  distance: number
): Promise<Location[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/getClose?coordinates=${coordinates[0]},${coordinates[1]}&distance=${distance}`
    );
    const data = await response.json();

    if (data.success && data.places) {
      return data.places as Location[];
    }

    return [];
  } catch (error) {
    console.error('Error fetching nearby locations:', error);
    throw error;
  }
}

/**
 * Fetch movies by genre
 */
export async function getTitleByGenre(genre: string): Promise<Movie[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/getTitleByGenre?genre=${encodeURIComponent(genre)}`
    );
    const data = await response.json();

    if (data.success && data.allMovies) {
      return data.allMovies as Movie[];
    }

    return [];
  } catch (error) {
    console.error('Error fetching by genre:', error);
    throw error;
  }
}

/**
 * Fetch all available genres
 */
export async function getGenres(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/getGenres`);
    const data = await response.json();

    if (data.success && data.genres) {
      return data.genres.map((g: { genre: string }) => g.genre);
    }

    return [];
  } catch (error) {
    console.error('Error fetching genres:', error);
    throw error;
  }
}

/**
 * Fetch location background image from Mapillary by location ID
 * Returns the image URL if successful, null if failed
 */
export async function getLocationPictureById(
  locationId: number
): Promise<string | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/locationPictureById?id=${locationId}`
    );

    if (!response.ok) {
      console.error('Failed to fetch location picture:', response.status);
      return null;
    }

    // The endpoint returns the image directly as a blob
    const blob = await response.blob();
    // Create a blob URL that can be used as an image source
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error fetching location picture:', error);
    return null;
  }
}
