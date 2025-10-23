import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MapGL, { Marker } from 'react-map-gl/maplibre';
import type { MapRef } from 'react-map-gl/maplibre';
import { Search, MapPin } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';

// Types for film location data
export interface FilmLocation {
  id: string;
  movieId: string; // ID of the movie this location belongs to
  latitude: number;
  longitude: number;
  title: string; // Location name (e.g., "Stockholm City Hall")
  movieTitle?: string; // Title of the movie for display
  imageUrl?: string; // Movie poster or location image
}

interface MapViewProps {
  // Film locations data
  locations?: FilmLocation[];
  // Filter function to filter locations
  filterFn?: (location: FilmLocation) => boolean;
  // Starting location (default is Stockholm, Sweden)
  initialCenter?: { latitude: number; longitude: number };
  // Flag to indicate if we should animate to initialCenter (e.g., from search navigation)
  shouldNavigateToCenter?: boolean;
  // Radius in kilometers for loading pins
  radiusKm?: number;
  // Search functionality
  searchQuery?: string;
  onSearchTextChange: (text: string) => void;
  onSearchButtonClick: () => void;
  // Callbacks
  onLocationClick?: (location: FilmLocation) => void;
  onBoundsChange?: (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => void;
  onMapMove?: (center: { latitude: number; longitude: number }) => void;
  // UI control options
  showSearch?: boolean;
  showRecenterButton?: boolean;
  showInfoPanel?: boolean;
}

export function MapView({
  locations = [],
  filterFn,
  initialCenter = { latitude: 59.3293, longitude: 18.0686 }, // Stockholm
  shouldNavigateToCenter = false,
  radiusKm = 10,
  searchQuery,
  onSearchTextChange,
  onSearchButtonClick,
  onLocationClick,
  onBoundsChange,
  onMapMove,
  showSearch = true,
  showRecenterButton = true,
  showInfoPanel = true,
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const navigate = useNavigate();
  // Store the default Stockholm center so reset button always goes back to Stockholm
  const originalInitialCenter = useRef({
    longitude: 18.0686, // Stockholm
    latitude: 59.3293,
  });
  const [viewState, setViewState] = useState({
    longitude: initialCenter.longitude,
    latitude: initialCenter.latitude,
    zoom: 12,
  });
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Track the last initialCenter we flew to
  const lastInitialCenter = useRef({
    longitude: initialCenter.longitude,
    latitude: initialCenter.latitude,
  });

  // Update map center when initialCenter prop changes (e.g., from search navigation)
  useEffect(() => {
    console.log('MapView: initialCenter changed:', initialCenter);
    console.log(
      'MapView: shouldNavigateToCenter prop:',
      shouldNavigateToCenter
    );
    console.log('MapView: mapRef.current exists:', !!mapRef.current);
    console.log('MapView: mapLoaded:', mapLoaded);

    // Only animate if explicitly requested (e.g., from search navigation)
    if (!shouldNavigateToCenter) {
      console.log(
        'MapView: Navigation not requested, updating lastInitialCenter only'
      );
      lastInitialCenter.current = {
        longitude: initialCenter.longitude,
        latitude: initialCenter.latitude,
      };
      return;
    }

    // Check if initialCenter is actually different from the last one we flew to
    // Use a larger threshold (0.01 degrees ≈ 1km) to avoid triggering on small map movements
    const hasChanged =
      Math.abs(lastInitialCenter.current.longitude - initialCenter.longitude) >
        0.01 ||
      Math.abs(lastInitialCenter.current.latitude - initialCenter.latitude) >
        0.01;

    if (!hasChanged) {
      console.log('MapView: initialCenter unchanged, skipping animation');
      return;
    }

    // Update the last center we flew to
    lastInitialCenter.current = {
      longitude: initialCenter.longitude,
      latitude: initialCenter.latitude,
    };

    // Update viewState to match the new center
    setViewState((prev) => ({
      ...prev,
      longitude: initialCenter.longitude,
      latitude: initialCenter.latitude,
    }));

    // Animate to the new center if map is ready and loaded
    if (mapRef.current && mapLoaded) {
      // Use a small delay to ensure state has updated (Chrome fix)
      const timeoutId = setTimeout(() => {
        if (mapRef.current) {
          console.log('MapView: Flying to new location');
          mapRef.current.flyTo({
            center: [initialCenter.longitude, initialCenter.latitude],
            zoom: 14,
            duration: 1500,
            essential: true, // This animation is essential and will not be affected by prefers-reduced-motion
          });
        }
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, [
    initialCenter.latitude,
    initialCenter.longitude,
    mapLoaded,
    shouldNavigateToCenter,
  ]);

  // Recenter to user's current location
  function handleRecenterToCurrentLocation() {
    if (!mapRef.current) return;

    if (!navigator.geolocation) {
      // Default location if geolocation not supported
      mapRef.current.flyTo({
        center: [18.071811849474248, 59.34694977877377],
        zoom: 14,
        duration: 1500,
      });
      return;
    }

    setIsGeolocating(true);

    // Try with high accuracy first
    const tryGetLocation = (enableHighAccuracy: boolean) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log('Got user location:', { latitude, longitude, accuracy });

          if (mapRef.current) {
            mapRef.current.flyTo({
              center: [longitude, latitude],
              zoom: 14,
              duration: 1500,
            });
          }

          setIsGeolocating(false);
        },
        (error) => {
          console.log('Geolocation error:', error, 'Code:', error.code);

          // If high accuracy failed and this was the first attempt, try without high accuracy
          if (enableHighAccuracy && error.code === 2) {
            console.log('Retrying without high accuracy...');
            tryGetLocation(false);
            return;
          }

          // Default to specified location instead of showing error
          console.log('Defaulting to fallback location');
          if (mapRef.current) {
            mapRef.current.flyTo({
              center: [18.071811849474248, 59.34694977877377],
              zoom: 14,
              duration: 1500,
            });
          }

          setIsGeolocating(false);
        },
        {
          enableHighAccuracy,
          timeout: enableHighAccuracy ? 3000 : 5000, // Shorter timeouts for faster fallback
          maximumAge: 300000, // Accept cached position up to 5 minutes old
        }
      );
    };

    // Start with high accuracy
    tryGetLocation(true);
  }

  // Recenter to initial location
  function handleRecenterToInitialLocation() {
    if (!mapRef.current) return;

    mapRef.current.flyTo({
      center: [
        originalInitialCenter.current.longitude,
        originalInitialCenter.current.latitude,
      ],
      zoom: 14,
      duration: 1500,
    });
  }

  // Calculate dynamic radius based on zoom level
  // Higher zoom = closer view = smaller radius
  const dynamicRadius = useMemo(() => {
    const baseRadius = radiusKm;
    const zoomFactor = Math.pow(2, 12 - viewState.zoom);
    return Math.max(1, Math.round(baseRadius * zoomFactor));
  }, [radiusKm, viewState.zoom]);

  // Filter locations based on filter function
  const filteredLocations = filterFn ? locations.filter(filterFn) : locations;

  // Group locations that are very close together for clustering
  const groupedLocations = useCallback(() => {
    const groups = new globalThis.Map<string, FilmLocation[]>();
    const threshold = 0.001; // ~100m threshold for grouping

    filteredLocations.forEach((location) => {
      const key = `${Math.round(location.latitude / threshold) * threshold},${Math.round(location.longitude / threshold) * threshold}`;
      const existing = groups.get(key) || [];
      groups.set(key, [...existing, location]);
    });

    return Array.from(groups.values());
  }, [filteredLocations]);

  // Geocode search query and fly to location
  async function searchLocationACB() {
    if (!searchQuery || !mapRef.current) return;

    try {
      // Using Nominatim for geocoding (free, open source)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        mapRef.current.flyTo({
          center: [parseFloat(lon), parseFloat(lat)],
          zoom: 14,
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  }

  // Update bounds when map moves
  const handleMoveEnd = useCallback(() => {
    if (mapRef.current) {
      const bounds = mapRef.current.getBounds();
      const center = mapRef.current.getCenter();

      if (bounds && onBoundsChange) {
        onBoundsChange({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        });
      }

      // Notify parent of map center change
      if (center && onMapMove) {
        console.log(
          'MapView: Notifying parent of map move to:',
          center.lat,
          center.lng
        );
        onMapMove({
          latitude: center.lat,
          longitude: center.lng,
        });
      }
    }
  }, [onBoundsChange, onMapMove]);

  // Check if location is within visible map bounds
  const isWithinBounds = useCallback((location: FilmLocation) => {
    if (!mapRef.current) return true;
    const bounds = mapRef.current.getBounds();
    if (!bounds) return true;

    return (
      location.latitude >= bounds.getSouth() &&
      location.latitude <= bounds.getNorth() &&
      location.longitude >= bounds.getWest() &&
      location.longitude <= bounds.getEast()
    );
  }, []);

  // Calculate if location is within radius from center
  const isWithinRadius = useCallback(
    (location: FilmLocation) => {
      const R = 6371; // Earth radius in km
      const dLat = ((location.latitude - viewState.latitude) * Math.PI) / 180;
      const dLon = ((location.longitude - viewState.longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((viewState.latitude * Math.PI) / 180) *
          Math.cos((location.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      return distance <= dynamicRadius;
    },
    [viewState.latitude, viewState.longitude, dynamicRadius]
  );

  // Calculate visible locations count (uses map bounds instead of radius)
  const visibleLocationsCount = useMemo(() => {
    return filteredLocations.filter(isWithinBounds).length;
  }, [filteredLocations, isWithinBounds]);

  // Render custom pin marker
  const renderMarker = (group: FilmLocation[]) => {
    const isCluster = group.length > 1;
    const primaryLocation = group[0];

    return (
      <Marker
        key={primaryLocation.id}
        longitude={primaryLocation.longitude}
        latitude={primaryLocation.latitude}
        anchor="bottom"
        onClick={(e) => {
          e.originalEvent.stopPropagation();
          if (onLocationClick) {
            onLocationClick(primaryLocation);
          }
        }}
      >
        <div
          className="cursor-pointer transition-transform hover:scale-110"
          style={{ position: 'relative' }}
        >
          {isCluster ? (
            // Cluster with FilmPin logo and count badge
            <div className="relative">
              <img
                src="/filmpin-logo-sm.png"
                alt="FilmPin"
                className="w-16 h-16 drop-shadow-lg"
              />
              <div
                className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-xs w-5 h-5 flex items-center justify-center rounded-full shadow-md border-2 border-white"
                style={{ pointerEvents: 'none' }}
              >
                {group.length}
              </div>
            </div>
          ) : (
            // Single location with image and white border
            <div className="relative">
              {primaryLocation.imageUrl ? (
                <div className="w-16 h-16 border-5 border-white shadow-lg overflow-hidden bg-gray-200 rounded-lg">
                  <img
                    src={primaryLocation.imageUrl}
                    alt={primaryLocation.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 border-5 border-white shadow-lg bg-blue-500 flex items-center justify-center text-2xl rounded-lg">
                  🎬
                </div>
              )}
            </div>
          )}
        </div>
      </Marker>
    );
  };

  // Handle search bar click - navigate to search view
  function handleSearchBarClickACB(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    console.log('MapView: Search bar clicked, navigating to /search');
    console.log('MapView: Current pathname:', window.location.hash);
    // Force navigation even if already on /search by using a timestamp
    navigate('/search', { state: { timestamp: Date.now() } });
  }

  return (
    <div className="relative w-full h-full">
      {/* Search bar overlay */}
      {showSearch && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-none">
          <div
            className="flex items-center bg-white rounded-4xl shadow-lg p-2 cursor-pointer pointer-events-auto hover:shadow-xl transition-shadow"
            onClick={handleSearchBarClickACB}
          >
            <Search className="h-6 w-6 text-gray-400 ml-2" />
            <input
              type="text"
              placeholder="Search for movies or locations"
              value={searchQuery || ''}
              className="flex-1 px-2 py-2 outline-none cursor-pointer"
              readOnly
              onClick={handleSearchBarClickACB}
            />
          </div>
        </div>
      )}

      {/* Map container - explicitly set lower z-index */}
      <div className="absolute inset-0 z-0">
        <MapGL
          ref={mapRef}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          onMoveEnd={handleMoveEnd}
          onLoad={() => {
            console.log('MapView: Map loaded');
            setMapLoaded(true);
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle={{
            version: 8,
            sources: {
              osm: {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '&copy; OpenStreetMap Contributors',
                maxzoom: 19,
              },
            },
            layers: [
              {
                id: 'osm',
                type: 'raster',
                source: 'osm',
                paint: {
                  'raster-saturation': -1,
                  'raster-contrast': 0.2,
                  'raster-brightness-min': 0.2,
                },
              },
            ],
          }}
          attributionControl={false}
        >
          {/* Render radius circle (optional visualization) */}
          {/* Uncomment to show search radius
        <Source
          id="radius"
          type="geojson"
          data={{
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [viewState.longitude, viewState.latitude],
            },
            properties: {},
          }}
        >
          <Layer {...radiusCircleLayer} />
        </Source>
        */}

          {/* Render location markers */}
          {groupedLocations()
            .filter((group) => isWithinRadius(group[0]))
            .map((group) => renderMarker(group))}
        </MapGL>
      </div>

      {/* Info panel */}
      {showInfoPanel && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10 pointer-events-none">
          <p className="text-sm text-gray-600">
            Showing {visibleLocationsCount} locations within {dynamicRadius}km
          </p>
        </div>
      )}

      {/* Recenter button - bottom right */}
      {showRecenterButton && (
        <button
          onClick={handleRecenterToInitialLocation}
          className="absolute bottom-4 right-4 bg-white hover:bg-gray-50 rounded-full shadow-lg p-4 z-10 transition-all hover:shadow-xl active:scale-95 pointer-events-auto"
          title="Reset map to initial view"
        >
          <MapPin className="w-6 h-6 text-gray-600" />
        </button>
      )}
    </div>
  );
}
