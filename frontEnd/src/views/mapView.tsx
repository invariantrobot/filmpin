import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import { useNavigate } from 'react-router-dom';
import MapGL, { Marker } from 'react-map-gl/maplibre';
import type { MapRef } from 'react-map-gl/maplibre';
import { Search, LocateFixed } from 'lucide-react';
import Supercluster from 'supercluster';
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
  info?: string; // Additional info about the location
}

interface MapViewProps {
  // Film locations data
  locations?: FilmLocation[];
  // Filter function to filter locations
  filterFn?: (location: FilmLocation) => boolean;
  // Starting location (default is Stockholm, Sweden)
  initialCenter?: { latitude: number; longitude: number; zoom?: number };
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
  onMapMove?: (center: {
    latitude: number;
    longitude: number;
    zoom: number;
  }) => void;
  // UI control options
  showSearch?: boolean;
  showRecenterButton?: boolean;
  showInfoPanel?: boolean;
}

export function MapView({
  locations = [],
  filterFn,
  initialCenter = { latitude: 59.3292999245142, longitude: 18.068600160651158 }, // Stockholm
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
    longitude: 18.068600160651158, // Stockholm
    latitude: 59.3292999245142,
  });
  const [viewState, setViewState] = useState({
    longitude: initialCenter.longitude,
    latitude: initialCenter.latitude,
    zoom: initialCenter.zoom ?? 14,
  });
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [expandedClusterId, setExpandedClusterId] = useState<string | null>(
    null
  );

  // Generate placeholder poster URL
  function getPlaceholderPoster(title: string): string {
    const colors = ['457b9d', 'e63946', '2a9d8f', 'f4a261', '8338ec', 'fb5607'];
    const colorIndex = title.length % colors.length;
    const initials = title.substring(0, 3).toUpperCase();
    return `https://placehold.co/300x450/${colors[colorIndex]}/white?text=${encodeURIComponent(initials)}`;
  }

  // Get poster URL from server or use placeholder
  function getPosterUrl(movieId?: string, title?: string): string {
    if (movieId) {
      return `http://localhost:8989/posters/${movieId}.jpg`;
    }
    return getPlaceholderPoster(title || 'N/A');
  }

  // Create Supercluster instance
  const superclusterRef = useRef<Supercluster>(
    new Supercluster({
      radius: 75, // Cluster radius in pixels
      maxZoom: 20, // Max zoom to cluster points on
      minZoom: 0,
      minPoints: 2, // Minimum points to form a cluster
    })
  );

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

  console.log('MapView: Received locations:', locations.length);
  console.log('MapView: Filtered locations:', filteredLocations.length);

  // Convert locations to GeoJSON format for Supercluster
  const points = useMemo(() => {
    console.log(
      'MapView: Converting locations to points:',
      filteredLocations.length
    );
    return filteredLocations.map((location) => ({
      type: 'Feature' as const,
      properties: {
        cluster: false,
        locationId: location.id,
        location: location,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [location.longitude, location.latitude],
      },
    }));
  }, [filteredLocations]);

  // Load points into Supercluster
  useEffect(() => {
    console.log('MapView: Loading points into Supercluster:', points.length);
    superclusterRef.current.load(points);
  }, [points]);

  // Get clusters for current viewport
  const clusters = useMemo(() => {
    if (!mapRef.current || !mapLoaded) {
      console.log(
        'MapView: Map not ready, using all points as individual markers'
      );
      // Return all points as individual markers when map isn't ready
      return points.map((point) => ({
        ...point,
        id: point.properties.locationId,
      }));
    }

    const bounds = mapRef.current.getBounds();
    if (!bounds) {
      console.log('MapView: No bounds, using all points as individual markers');
      return points.map((point) => ({
        ...point,
        id: point.properties.locationId,
      }));
    }

    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];

    const zoom = Math.floor(viewState.zoom);

    const result = superclusterRef.current.getClusters(bbox, zoom);
    console.log('MapView: Got clusters:', result.length, 'at zoom:', zoom);
    return result;
  }, [viewState, mapLoaded, points]);

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
          center.lng,
          'zoom:',
          viewState.zoom
        );
        onMapMove({
          latitude: center.lat,
          longitude: center.lng,
          zoom: viewState.zoom,
        });
      }
    }
  }, [onBoundsChange, onMapMove, viewState.zoom]);

  // Calculate visible locations count (count actual locations, not clusters)
  const visibleLocationsCount = useMemo(() => {
    return clusters.reduce((count, cluster) => {
      if ('cluster' in cluster.properties && cluster.properties.cluster) {
        return (
          count +
          ('point_count' in cluster.properties
            ? (cluster.properties.point_count as number)
            : 0)
        );
      }
      return count + 1;
    }, 0);
  }, [clusters]);

  // Calculate spread positions for expanded cluster
  const getSpreadPositions = (
    centerLat: number,
    centerLng: number,
    count: number
  ): Array<{ lat: number; lng: number }> => {
    const positions: Array<{ lat: number; lng: number }> = [];

    // Much larger base radius for visibility
    // Spread should be visually significant at all zoom levels
    const baseRadius = 0.01; // ~1km at zoom 12
    const zoomFactor = Math.pow(2, 12 - viewState.zoom);
    const radius = baseRadius * zoomFactor;

    const angleStep = (2 * Math.PI) / count;

    for (let i = 0; i < count; i++) {
      const angle = i * angleStep;
      positions.push({
        lat: centerLat + radius * Math.cos(angle),
        lng: centerLng + radius * Math.sin(angle),
      });
    }

    return positions;
  };

  // Render custom pin marker for clusters and individual points
  const renderClusterMarker = (
    cluster: ReturnType<Supercluster['getClusters']>[0]
  ) => {
    const [longitude, latitude] = cluster.geometry.coordinates;
    const isCluster =
      'cluster' in cluster.properties && cluster.properties.cluster === true;
    const pointCount =
      isCluster && 'point_count' in cluster.properties
        ? cluster.properties.point_count
        : 0;
    const MAX_SPREADABLE_CLUSTER_SIZE = 8;

    // Handle cluster
    if (isCluster && cluster.id !== undefined) {
      const clusterId = `cluster-${cluster.id}`;
      const isExpanded = expandedClusterId === clusterId;
      const canSpread = pointCount <= MAX_SPREADABLE_CLUSTER_SIZE;

      // If cluster is expanded, get the leaves (individual points in the cluster)
      if (isExpanded && canSpread) {
        const leaves = superclusterRef.current.getLeaves(
          cluster.id as number,
          Infinity
        );

        const spreadPositions = getSpreadPositions(
          latitude,
          longitude,
          leaves.length
        );

        return (
          <React.Fragment key={clusterId}>
            {/* Render center cluster marker (can be clicked to collapse) */}
            <Marker
              longitude={longitude}
              latitude={latitude}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setExpandedClusterId(null); // Collapse
              }}
            >
              <div className="cursor-pointer transition-transform hover:scale-110">
                <div className="relative opacity-50">
                  <img
                    src="/filmpin-logo-sm.png"
                    alt="FilmPin"
                    className="w-16 h-16 drop-shadow-lg"
                  />
                  <div
                    className="absolute -top-1 -right-1 bg-gray-600 text-white font-bold text-xs w-5 h-5 flex items-center justify-center rounded-full shadow-md border-2 border-white"
                    style={{ pointerEvents: 'none' }}
                  >
                    ✕
                  </div>
                </div>
              </div>
            </Marker>

            {/* Render spread individual pins */}
            {leaves.map((leaf, idx) => {
              const location = leaf.properties.location;
              return (
                <Marker
                  key={location.id}
                  longitude={spreadPositions[idx].lng}
                  latitude={spreadPositions[idx].lat}
                  anchor="bottom"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    console.log(
                      'MapView: Spread marker clicked, location:',
                      location
                    );
                    if (onLocationClick) {
                      onLocationClick(location);
                    }
                  }}
                >
                  <div className="cursor-pointer transition-all hover:scale-110 animate-in zoom-in duration-300">
                    <div className="relative">
                      {location.imageUrl || location.movieId ? (
                        <div className="w-14 h-14 border-4 border-white shadow-lg overflow-hidden bg-gray-200 rounded-lg">
                          <img
                            src={
                              location.imageUrl ||
                              getPosterUrl(
                                location.movieId,
                                location.movieTitle || location.title
                              )
                            }
                            alt={location.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = getPlaceholderPoster(
                                location.movieTitle || location.title
                              );
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 border-4 border-white shadow-lg bg-blue-500 flex items-center justify-center text-xl rounded-lg">
                          🎬
                        </div>
                      )}
                    </div>
                  </div>
                </Marker>
              );
            })}
          </React.Fragment>
        );
      }

      // Collapsed cluster marker
      return (
        <Marker
          key={clusterId}
          longitude={longitude}
          latitude={latitude}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation();

            // If cluster has more than 8 locations, zoom in instead of spreading
            if (!canSpread && mapRef.current) {
              const expansionZoom = Math.min(
                superclusterRef.current.getClusterExpansionZoom(
                  cluster.id as number
                ),
                20
              );
              mapRef.current.flyTo({
                center: [longitude, latitude],
                zoom: expansionZoom,
                duration: 500,
              });
            } else {
              // Spread the cluster (8 or fewer items)
              setExpandedClusterId(clusterId);
            }
          }}
        >
          <div className="cursor-pointer transition-transform hover:scale-110">
            <div className="relative">
              <img
                src="/filmpin-logo-sm.png"
                alt="FilmPin"
                className="w-16 h-16 drop-shadow-lg"
              />
              <div
                className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-xs w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white"
                style={{ pointerEvents: 'none' }}
              >
                {pointCount}
              </div>
            </div>
          </div>
        </Marker>
      );
    }

    // Individual location marker
    const location = cluster.properties.location;
    return (
      <Marker
        key={location.id}
        longitude={longitude}
        latitude={latitude}
        anchor="bottom"
        onClick={(e) => {
          e.originalEvent.stopPropagation();
          console.log(
            'MapView: Individual marker clicked, location:',
            location
          );
          if (onLocationClick) {
            onLocationClick(location);
          }
        }}
      >
        <div className="cursor-pointer transition-transform hover:scale-110">
          <div className="relative">
            {location.imageUrl || location.movieId ? (
              <div className="w-16 h-16 border-5 border-white shadow-lg overflow-hidden bg-gray-200 rounded-lg">
                <img
                  src={
                    location.imageUrl ||
                    getPosterUrl(
                      location.movieId,
                      location.movieTitle || location.title
                    )
                  }
                  alt={location.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getPlaceholderPoster(
                      location.movieTitle || location.title
                    );
                  }}
                />
              </div>
            ) : (
              <div className="w-16 h-16 border-5 border-white shadow-lg bg-blue-500 flex items-center justify-center text-2xl rounded-lg">
                🎬
              </div>
            )}
          </div>
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

          {/* Render location markers using Supercluster */}
          {clusters.map((cluster) => renderClusterMarker(cluster))}
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
          <LocateFixed className="w-6 h-6 text-gray-600" />
        </button>
      )}
    </div>
  );
}
