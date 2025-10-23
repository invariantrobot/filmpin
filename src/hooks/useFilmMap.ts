import { useState, useCallback } from 'react';
import type { FilmLocation } from '../views/mapView';

/**
 * Hook for managing film location map state
 * Use this in your presenters for centralized map logic
 */
export function useFilmMap() {
  const [locations, setLocations] = useState<FilmLocation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<FilmLocation | null>(
    null
  );
  const [filters, setFilters] = useState<{
    genre?: string;
    year?: number;
    director?: string;
  }>({});
  const [mapCenter, setMapCenter] = useState({
    latitude: 59.3293, // Default to Stockholm
    longitude: 18.0686,
  });
  const [radiusKm, setRadiusKm] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch locations from API
  const fetchLocations = useCallback(
    async (bounds?: {
      north: number;
      south: number;
      east: number;
      west: number;
    }) => {
      setLoading(true);
      setError(null);

      try {
        // Replace with your actual API endpoint
        const params = new URLSearchParams();
        if (bounds) {
          params.append('north', bounds.north.toString());
          params.append('south', bounds.south.toString());
          params.append('east', bounds.east.toString());
          params.append('west', bounds.west.toString());
        }

        const response = await fetch(`/api/film-locations?${params}`);
        if (!response.ok) throw new Error('Failed to fetch locations');

        const data = await response.json();
        setLocations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching locations:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Filter locations based on current filters
  const filterFunction = useCallback(
    (_location: FilmLocation) => {
      // Add your custom filtering logic based on the filters state
      // You can filter by movie properties once you have that data
      // Example: check _location.movieId against your movie data
      if (filters.genre || filters.year || filters.director) {
        // Implement your filtering logic based on movieId
        return true; // Return true/false based on your movie data
      }

      return true;
    },
    [filters]
  );

  // Handle search
  const handleSearch = useCallback(() => {
    console.log('Searching for:', searchQuery);
    // The MapView component handles geocoding
    // You can add additional search logic here (e.g., filter by movie title)

    if (searchQuery) {
      const filtered = locations.filter(
        (loc) =>
          loc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          loc.movieTitle?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (filtered.length > 0) {
        // Center map on first result
        setMapCenter({
          latitude: filtered[0].latitude,
          longitude: filtered[0].longitude,
        });
      }
    }
  }, [searchQuery, locations]);

  // Handle location click
  const handleLocationClick = useCallback((location: FilmLocation) => {
    setSelectedLocation(location);
    console.log('Selected location:', location);
  }, []);

  // Handle bounds change (for loading more data)
  const handleBoundsChange = useCallback(
    (bounds: { north: number; south: number; east: number; west: number }) => {
      console.log('Map bounds changed:', bounds);
      // Optionally fetch new locations based on bounds
      // fetchLocations(bounds);
    },
    []
  );

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Add a new location (for testing or manual entry)
  const addLocation = useCallback((location: FilmLocation) => {
    setLocations((prev) => [...prev, location]);
  }, []);

  // Remove a location
  const removeLocation = useCallback((id: string) => {
    setLocations((prev) => prev.filter((loc) => loc.id !== id));
  }, []);

  return {
    // State
    locations,
    searchQuery,
    selectedLocation,
    filters,
    mapCenter,
    radiusKm,
    loading,
    error,

    // Setters
    setLocations,
    setSearchQuery,
    setSelectedLocation,
    setMapCenter,
    setRadiusKm,

    // Functions
    fetchLocations,
    filterFunction,
    handleSearch,
    handleLocationClick,
    handleBoundsChange,
    updateFilters,
    clearFilters,
    addLocation,
    removeLocation,
  };
}
