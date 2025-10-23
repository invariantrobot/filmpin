import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapView } from './views/mapView';
import { useFilmMap } from './hooks/useFilmMap';
import type { FilmLocation } from './views/mapView';

// Sample film locations data - each location is tied to one movie
const sampleLocations: FilmLocation[] = [
  {
    id: 'loc-1',
    movieId: 'movie-1',
    latitude: 59.3293,
    longitude: 18.0686,
    title: 'Stockholm City Hall',
    movieTitle: 'The Girl with the Dragon Tattoo',
    imageUrl: 'https://placehold.co/300x300/e63946/white?text=TGW',
  },
  {
    id: 'loc-2',
    movieId: 'movie-2',
    latitude: 59.3251,
    longitude: 18.0711,
    title: 'Gamla Stan',
    movieTitle: 'Mission Impossible',
    imageUrl: 'https://placehold.co/300x300/457b9d/white?text=MI',
  },
  {
    id: 'loc-3',
    movieId: 'movie-3',
    latitude: 59.3252,
    longitude: 18.0712,
    title: 'Royal Palace',
    movieTitle: 'The Crown',
    imageUrl: 'https://placehold.co/300x300/1d3557/white?text=TC',
  },
  {
    id: 'loc-4',
    movieId: 'movie-1',
    latitude: 59.3326,
    longitude: 18.0649,
    title: 'Sergels Torg',
    movieTitle: 'The Girl with the Dragon Tattoo',
    imageUrl: 'https://placehold.co/300x300/e63946/white?text=TGW',
  },
  {
    id: 'loc-5',
    movieId: 'movie-4',
    latitude: 59.3321,
    longitude: 18.0644,
    title: 'Kulturhuset',
    movieTitle: 'Let the Right One In',
    imageUrl: 'https://placehold.co/300x300/a8dadc/333?text=LTR',
  },
];

/**
 * Dashboard Presenter Component
 * Displays the main discover/map view with film locations
 */
const Dashboard = observer(function DashboardRender() {
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const [shouldNavigateToCenter, setShouldNavigateToCenter] = useState(false);

  const {
    locations,
    searchQuery,
    selectedLocation,
    mapCenter,
    radiusKm,
    loading,
    error,
    setSearchQuery,
    setLocations,
    setSelectedLocation,
    setMapCenter,
    filterFunction,
    handleSearch,
    handleLocationClick,
    handleBoundsChange,
  } = useFilmMap();

  console.log('Dashboard: Current mapCenter:', mapCenter);

  // Initialize with sample data
  useEffect(() => {
    setLocations(sampleLocations);
  }, [setLocations]);

  // Handle navigation from search with location data
  useEffect(() => {
    const state = routerLocation.state as {
      mapCenter?: { latitude: number; longitude: number };
      selectedLocationName?: string;
      timestamp?: number;
    } | null;

    // Only update mapCenter if we have explicit location data from search
    if (state?.mapCenter) {
      console.log(
        'Dashboard: Navigation effect triggered - setting map center to:',
        state.mapCenter
      );
      // Force a new object reference to ensure the useEffect in MapView triggers
      const newCenter = {
        latitude: state.mapCenter.latitude,
        longitude: state.mapCenter.longitude,
      };
      setMapCenter(newCenter);
      setShouldNavigateToCenter(true);

      // Clear the navigation state and flag after a delay
      const clearStateTimeout = setTimeout(() => {
        navigate('/', { replace: true, state: {} });
        setShouldNavigateToCenter(false);
      }, 100);

      return () => clearTimeout(clearStateTimeout);
    }
  }, [routerLocation.state, setMapCenter, navigate]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-red-600">Error loading map: {error}</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-lg">Loading locations...</div>
        </div>
      )}

      <MapView
        locations={locations}
        filterFn={filterFunction}
        initialCenter={mapCenter}
        shouldNavigateToCenter={shouldNavigateToCenter}
        radiusKm={radiusKm}
        searchQuery={searchQuery}
        onSearchTextChange={setSearchQuery}
        onSearchButtonClick={handleSearch}
        onLocationClick={handleLocationClick}
        onBoundsChange={handleBoundsChange}
        onMapMove={setMapCenter}
      />

      {/* Optional: Show selected location details */}
      {selectedLocation && (
        <div className="absolute top-20 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-20 pointer-events-auto">
          <button
            onClick={() => setSelectedLocation(null)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
          <h3 className="font-bold text-lg mb-2">{selectedLocation.title}</h3>
          {selectedLocation.imageUrl && (
            <img
              src={selectedLocation.imageUrl}
              alt={selectedLocation.title}
              className="w-full h-48 object-cover rounded mb-2"
            />
          )}
          {selectedLocation.movieTitle && (
            <div>
              <p className="font-semibold text-sm mb-1">Movie:</p>
              <p className="text-sm text-gray-600">
                {selectedLocation.movieTitle}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export { Dashboard };
