import type { FilmLocation } from '../views/mapView';

/**
 * Calculate distance between two geographic coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check if a location is within a given radius from a center point
 * @param location Film location to check
 * @param center Center point coordinates
 * @param radiusKm Radius in kilometers
 * @returns true if location is within radius
 */
export function isLocationWithinRadius(
  location: FilmLocation,
  center: { latitude: number; longitude: number },
  radiusKm: number
): boolean {
  const distance = calculateDistance(
    location.latitude,
    location.longitude,
    center.latitude,
    center.longitude
  );
  return distance <= radiusKm;
}

/**
 * Get the center point (centroid) of an array of locations
 * @param locations Array of film locations
 * @returns Center point coordinates
 */
export function getCenterOfLocations(locations: FilmLocation[]): {
  latitude: number;
  longitude: number;
} {
  if (locations.length === 0) {
    return { latitude: 0, longitude: 0 };
  }

  const sum = locations.reduce(
    (acc, loc) => ({
      latitude: acc.latitude + loc.latitude,
      longitude: acc.longitude + loc.longitude,
    }),
    { latitude: 0, longitude: 0 }
  );

  return {
    latitude: sum.latitude / locations.length,
    longitude: sum.longitude / locations.length,
  };
}

/**
 * Filter locations by search query (searches location title and movie title)
 * @param locations Array of film locations
 * @param query Search query string
 * @returns Filtered array of locations
 */
export function filterLocationsByQuery(
  locations: FilmLocation[],
  query: string
): FilmLocation[] {
  if (!query.trim()) return locations;

  const lowerQuery = query.toLowerCase();
  return locations.filter(
    (loc) =>
      loc.title.toLowerCase().includes(lowerQuery) ||
      loc.movieTitle?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Sort locations by distance from a center point
 * @param locations Array of film locations
 * @param center Center point coordinates
 * @returns Sorted array (closest first)
 */
export function sortLocationsByDistance(
  locations: FilmLocation[],
  center: { latitude: number; longitude: number }
): FilmLocation[] {
  return [...locations].sort((a, b) => {
    const distA = calculateDistance(
      a.latitude,
      a.longitude,
      center.latitude,
      center.longitude
    );
    const distB = calculateDistance(
      b.latitude,
      b.longitude,
      center.latitude,
      center.longitude
    );
    return distA - distB;
  });
}

/**
 * Get bounds that contain all given locations
 * @param locations Array of film locations
 * @returns Bounds object with north, south, east, west
 */
export function getBoundsForLocations(locations: FilmLocation[]): {
  north: number;
  south: number;
  east: number;
  west: number;
} {
  if (locations.length === 0) {
    return { north: 0, south: 0, east: 0, west: 0 };
  }

  const lats = locations.map((loc) => loc.latitude);
  const lngs = locations.map((loc) => loc.longitude);

  return {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs),
  };
}

/**
 * Generate a zoom level based on the distance between two points
 * @param distance Distance in kilometers
 * @returns Appropriate zoom level (higher = more zoomed in)
 */
export function getZoomForDistance(distance: number): number {
  // Rough approximation of zoom levels for distances
  if (distance < 0.5) return 16;
  if (distance < 2) return 14;
  if (distance < 5) return 13;
  if (distance < 10) return 12;
  if (distance < 20) return 11;
  if (distance < 50) return 10;
  if (distance < 100) return 9;
  if (distance < 200) return 8;
  return 7;
}

/**
 * Geocode a location name to coordinates using Nominatim
 * @param query Location name to search
 * @returns Coordinates if found, null otherwise
 */
export async function geocodeLocation(query: string): Promise<{
  latitude: number;
  longitude: number;
  displayName: string;
} | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
    );
    const data = await response.json();

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to a location name using Nominatim
 * @param latitude Latitude
 * @param longitude Longitude
 * @returns Location name if found, null otherwise
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    );
    const data = await response.json();

    if (data && data.display_name) {
      return data.display_name;
    }
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

/**
 * Format coordinates as a readable string
 * @param latitude Latitude
 * @param longitude Longitude
 * @param precision Number of decimal places
 * @returns Formatted coordinate string
 */
export function formatCoordinates(
  latitude: number,
  longitude: number,
  precision: number = 4
): string {
  const lat = latitude.toFixed(precision);
  const lng = longitude.toFixed(precision);
  const latDir = latitude >= 0 ? 'N' : 'S';
  const lngDir = longitude >= 0 ? 'E' : 'W';
  return `${Math.abs(parseFloat(lat))}°${latDir}, ${Math.abs(parseFloat(lng))}°${lngDir}`;
}

/**
 * Create a GeoJSON FeatureCollection from film locations
 * @param locations Array of film locations
 * @returns GeoJSON FeatureCollection
 */
export function locationsToGeoJSON(locations: FilmLocation[]) {
  return {
    type: 'FeatureCollection' as const,
    features: locations.map((location) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [location.longitude, location.latitude],
      },
      properties: {
        id: location.id,
        movieId: location.movieId,
        title: location.title,
        movieTitle: location.movieTitle,
        imageUrl: location.imageUrl,
      },
    })),
  };
}

/**
 * Group locations by movie ID
 * @param locations Array of film locations
 * @returns Map of movieId to locations array
 */
export function groupLocationsByMovie(
  locations: FilmLocation[]
): globalThis.Map<string, FilmLocation[]> {
  const grouped = new globalThis.Map<string, FilmLocation[]>();

  locations.forEach((location) => {
    const existing = grouped.get(location.movieId) || [];
    grouped.set(location.movieId, [...existing, location]);
  });

  return grouped;
}

/**
 * Get all unique movies from locations
 * @param locations Array of film locations
 * @returns Array of unique movie IDs with titles
 */
export function getUniqueMovies(locations: FilmLocation[]): Array<{
  movieId: string;
  movieTitle: string;
  locationCount: number;
}> {
  const movieMap = new globalThis.Map<
    string,
    { title: string; count: number }
  >();

  locations.forEach((location) => {
    const existing = movieMap.get(location.movieId);
    if (existing) {
      existing.count++;
    } else {
      movieMap.set(location.movieId, {
        title: location.movieTitle || 'Unknown',
        count: 1,
      });
    }
  });

  return Array.from(movieMap.entries()).map(([movieId, data]) => ({
    movieId,
    movieTitle: data.title,
    locationCount: data.count,
  }));
}
