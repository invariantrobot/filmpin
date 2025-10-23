import { observer } from 'mobx-react-lite';
import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapView } from './views/mapView';
import { useFilmMap } from './hooks/useFilmMap';
import { getAllLocations, getAllTitles } from './services/api';
import { transformLocationsWithMovies } from './utils/locationTransform';

/**
 * Dashboard Presenter Component
 * Displays the main discover/map view with film locations
 */
const Dashboard = observer(function DashboardRender() {
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const [shouldNavigateToCenter, setShouldNavigateToCenter] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const hasLoadedData = useRef(false);

  const {
    locations,
    searchQuery,
    mapCenter,
    radiusKm,
    loading,
    error,
    setSearchQuery,
    setLocations,
    setMapCenter,
    filterFunction,
    handleSearch,
    handleLocationClick,
    handleBoundsChange,
  } = useFilmMap();

  console.log('Dashboard: Current mapCenter:', mapCenter);

  // Fetch real data from the backend
  useEffect(() => {
    // Only fetch once, ever
    if (hasLoadedData.current) {
      console.log('Dashboard: Data already loaded, skipping fetch');
      return;
    }

    async function fetchData() {
      try {
        setIsLoadingData(true);
        setLoadError(null);

        // Fetch both locations and movies in parallel
        const [locations, movies] = await Promise.all([
          getAllLocations(),
          getAllTitles(),
        ]);

        // Transform the data to FilmLocation format
        const filmLocations = transformLocationsWithMovies(locations, movies);

        console.log(
          `Loaded ${filmLocations.length} film locations from backend`
        );
        setLocations(filmLocations);
        hasLoadedData.current = true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load data';
        console.error('Error loading film locations:', err);
        setLoadError(errorMessage);
      } finally {
        setIsLoadingData(false);
      }
    }

    fetchData();
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

  if (error || loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-red-600">
          Error loading map: {error || loadError}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Only show loading on initial load when we have no locations */}
      {isLoadingData && locations.length === 0 && (
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
    </div>
  );
});

export { Dashboard };
