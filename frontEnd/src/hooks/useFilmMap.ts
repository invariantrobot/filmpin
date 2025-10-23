import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FilmLocation } from '../views/mapView';
import type { Location } from '../services/api';

// Global state to persist locations across component unmounts
let globalLocations: FilmLocation[] = [];

/**
 * Hook for managing film location map state
 * Use this in your presenters for centralized map logic
 */
export function useFilmMap() {
  const navigate = useNavigate();
  const [locations, setLocationsState] =
    useState<FilmLocation[]>(globalLocations);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<FilmLocation | null>(
    null
  );
  const [filters, setFilters] = useState<{
    genre?: string;
    year?: number;
    director?: string;
  }>({});

  // Wrapper to update both local state and global state
  const setLocations = useCallback((newLocations: FilmLocation[]) => {
    globalLocations = newLocations;
    setLocationsState(newLocations);
  }, []);

  // Load map center from localStorage or use default
  const getInitialMapCenter = () => {
    try {
      const saved = localStorage.getItem('filmpin_mapCenter');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load map center from localStorage:', e);
    }
    return {
      latitude: 59.3293, // Default to Stockholm
      longitude: 18.0686,
      zoom: 14, // Default zoom level
    };
  };

  const [mapCenter, setMapCenterState] = useState(getInitialMapCenter());

  // Wrapper to save to localStorage when map center changes
  const setMapCenter = useCallback(
    (center: { latitude: number; longitude: number; zoom?: number }) => {
      console.log('useFilmMap: Setting map center to:', center);
      const newCenter = {
        latitude: center.latitude,
        longitude: center.longitude,
        zoom: center.zoom ?? mapCenter.zoom ?? 14, // Keep existing zoom if not provided
      };
      setMapCenterState(newCenter);
      try {
        localStorage.setItem('filmpin_mapCenter', JSON.stringify(newCenter));
      } catch (e) {
        console.error('Failed to save map center to localStorage:', e);
      }
    },
    [mapCenter.zoom]
  );

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

  // Handle location click - navigate to film location page
  const handleLocationClick = useCallback(
    (location: FilmLocation) => {
      console.log(
        'Location clicked, navigating to film location page:',
        location
      );

      // Convert FilmLocation to Location format for the film location view
      const locationData: Location = {
        id: parseInt(location.id.replace('loc-', '')),
        movie_id: location.movieId,
        lat: location.latitude,
        lon: location.longitude,
        place: location.title,
        info: location.info,
      };

      navigate('/location', {
        state: {
          location: locationData,
          movieTitle: location.movieTitle,
        },
      });
    },
    [navigate]
  );

  // Handle bounds change (for loading more data)
  const handleBoundsChange = useCallback(
    (bounds: { north: number; south: number; east: number; west: number }) => {
      console.log('Map bounds changed:', bounds);
      // Don't update mapCenter here - it causes unwanted zoom changes
      // mapCenter is only updated when explicitly navigating (e.g., from search)
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
    const newLocations = [...globalLocations, location];
    globalLocations = newLocations;
    setLocationsState(newLocations);
  }, []);

  // Remove a location
  const removeLocation = useCallback((id: string) => {
    const newLocations = globalLocations.filter((loc) => loc.id !== id);
    globalLocations = newLocations;
    setLocationsState(newLocations);
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
