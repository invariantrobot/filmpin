import { useState, useEffect } from 'react';
import { MapView } from '../views/mapView';
import type { FilmLocation } from '../views/mapView';
import { getAllLocations, getAllTitles } from '../services/api';
import { transformLocationsWithMovies } from '../utils/locationTransform';

export function MapExample() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locations, setLocations] = useState<FilmLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real data from the backend
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch both locations and movies in parallel
        const [locationsData, moviesData] = await Promise.all([
          getAllLocations(),
          getAllTitles(),
        ]);

        // Transform the data to FilmLocation format
        const filmLocations = transformLocationsWithMovies(
          locationsData,
          moviesData
        );

        console.log(
          `Loaded ${filmLocations.length} film locations from backend`
        );
        setLocations(filmLocations);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load data';
        console.error('Error loading film locations:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Handle location click - will be used for navigation later
  const handleLocationClick = (location: FilmLocation) => {
    console.log('Clicked location:', location);
    // TODO: Navigate to location detail view
  };

  // Handle map bounds change
  const handleBoundsChange = (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => {
    console.log('Map bounds changed:', bounds);
    // You can fetch new locations from backend based on these bounds
  };

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-red-600">Error loading locations: {error}</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {/* Map - full screen */}
      <div className="w-full h-full relative">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
            <div className="text-lg">Loading locations...</div>
          </div>
        )}
        <MapView
          locations={locations}
          initialCenter={{ latitude: 59.3293, longitude: 18.0686 }}
          radiusKm={10}
          searchQuery={searchQuery}
          onSearchTextChange={setSearchQuery}
          onSearchButtonClick={() =>
            console.log('Search clicked:', searchQuery)
          }
          onLocationClick={handleLocationClick}
          onBoundsChange={handleBoundsChange}
        />
      </div>
    </div>
  );
}
