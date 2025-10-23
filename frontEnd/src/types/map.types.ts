/**
 * Type definitions for FilmPin map features
 */

// Main film location data structure
export interface FilmLocation {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  imageUrl?: string;
  films?: string[];
}

// Extended film location with additional metadata
export interface ExtendedFilmLocation extends FilmLocation {
  genre?: string[];
  year?: number;
  director?: string;
  description?: string;
  rating?: number;
  visitCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Map bounds
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Map center coordinates
export interface MapCenter {
  latitude: number;
  longitude: number;
}

// Filter options
export interface MapFilters {
  genre?: string;
  year?: number;
  director?: string;
  minRating?: number;
  searchQuery?: string;
}

// API response types
export interface LocationsApiResponse {
  locations: FilmLocation[];
  total: number;
  page?: number;
  pageSize?: number;
}

export interface LocationDetailApiResponse {
  location: ExtendedFilmLocation;
  nearbyLocations?: FilmLocation[];
}

// Geocoding types
export interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
  address?: {
    city?: string;
    country?: string;
    state?: string;
  };
}

// Map view state
export interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
}

// Cluster data
export interface LocationCluster {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  locations: FilmLocation[];
}
