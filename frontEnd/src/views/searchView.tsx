import { Search, X, MapPin, Loader2, Film } from 'lucide-react';
import type { Movie } from '../services/api';

export type SearchTab = 'films' | 'locations';

// Geocoded location result from search
export interface GeocodedLocation {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
  };
  type?: string;
  importance?: number;
}

interface SearchViewProps {
  searchQuery: string;
  onSearchTextChange: (text: string) => void;
  activeTab: SearchTab;
  onTabChange: (tab: SearchTab) => void;
  onBackClick: () => void;
  filmResults?: Movie[];
  locationResults?: GeocodedLocation[];
  onLocationClick?: (location: GeocodedLocation) => void;
  onFilmClick?: (film: Movie) => void;
  isSearching?: boolean;
}

export function SearchView({
  searchQuery,
  onSearchTextChange,
  activeTab,
  onTabChange,
  onBackClick,
  filmResults = [],
  locationResults = [],
  onLocationClick,
  onFilmClick,
  isSearching = false,
}: SearchViewProps) {
  // Handle search text change
  function searchTextChangeACB(evt: React.ChangeEvent<HTMLInputElement>) {
    onSearchTextChange(evt.target.value);
  }

  // Handle tab click
  function handleTabClickACB(tab: SearchTab) {
    return () => onTabChange(tab);
  }

  // Handle location click
  function handleLocationClickACB(location: GeocodedLocation) {
    return () => {
      if (onLocationClick) {
        onLocationClick(location);
      }
    };
  }

  // Handle film click
  function handleFilmClickACB(film: Movie) {
    return () => {
      if (onFilmClick) {
        onFilmClick(film);
      }
    };
  }

  // Format address from geocoded location
  function formatAddress(location: GeocodedLocation): string {
    const addr = location.address;
    if (!addr) return location.display_name;

    const parts = [
      addr.road,
      addr.suburb || addr.city,
      addr.state,
      addr.country,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : location.display_name;
  }

  // Generate placeholder poster URL
  function getPlaceholderPoster(title: string): string {
    const colors = ['457b9d', 'e63946', '2a9d8f', 'f4a261', '8338ec', 'fb5607'];
    const colorIndex = title.length % colors.length;
    const initials = title.substring(0, 3).toUpperCase();
    return `https://placehold.co/300x450/${colors[colorIndex]}/white?text=${encodeURIComponent(initials)}`;
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      {/* Search bar */}
      <div className="w-full max-w-md mx-auto px-4 pt-4">
        <div className="flex items-center bg-white rounded-4xl shadow-lg p-2">
          <Search className="h-6 w-6 text-gray-400 ml-2" />
          <input
            onChange={searchTextChangeACB}
            type="text"
            placeholder="Search for movies or locations"
            value={searchQuery}
            className="flex-1 px-2 py-2 outline-none"
            autoFocus
          />
          <button
            onClick={onBackClick}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close search"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mt-2">
        <div className="max-w-2xl mx-auto flex">
          <button
            onClick={handleTabClickACB('films')}
            className={`flex-1 py-4 text-center font-medium transition-colors relative ${
              activeTab === 'films'
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Films
            {activeTab === 'films' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={handleTabClickACB('locations')}
            className={`flex-1 py-4 text-center font-medium transition-colors relative ${
              activeTab === 'locations'
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Locations
            {activeTab === 'locations' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>
      </div>

      {/* Results container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4">
          {activeTab === 'films' ? (
            <div>
              {!searchQuery ? (
                <div className="text-center py-12">
                  <Film className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Search for films by title</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Try searching for your favorite movie
                  </p>
                </div>
              ) : isSearching ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 text-blue-600 mx-auto mb-3 animate-spin" />
                  <p className="text-gray-500">Searching films...</p>
                </div>
              ) : filmResults.length === 0 ? (
                <div className="text-center py-12">
                  <Film className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    No films found for "{searchQuery}"
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Try a different search term
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {filmResults.map((film) => (
                    <button
                      key={film.id}
                      onClick={handleFilmClickACB(film)}
                      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden text-left border border-gray-200 hover:border-blue-400 flex flex-col"
                    >
                      <div className="aspect-[2/3] bg-gray-100 relative overflow-hidden flex-shrink-0">
                        <img
                          src={
                            film.posterUrl || getPlaceholderPoster(film.title)
                          }
                          alt={film.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = getPlaceholderPoster(film.title);
                          }}
                        />
                      </div>
                      <div className="p-3 flex-1 flex flex-col">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1 min-h-[2.5rem]">
                          {film.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-600 mt-auto">
                          {film.year && <span>{film.year}</span>}
                          {film.genre && (
                            <>
                              {film.year && <span>•</span>}
                              <span className="line-clamp-1">{film.genre}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {!searchQuery ? (
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    Search for any address or location
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Try searching for a city, street, or landmark
                  </p>
                </div>
              ) : isSearching ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 text-blue-600 mx-auto mb-3 animate-spin" />
                  <p className="text-gray-500">Searching locations...</p>
                </div>
              ) : locationResults.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    No locations found for "{searchQuery}"
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Try a different search term
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {locationResults.map((location) => (
                    <button
                      key={location.place_id}
                      onClick={handleLocationClickACB(location)}
                      className="w-full bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 text-left border border-gray-200 hover:border-blue-400"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <MapPin className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {location.address?.road ||
                              location.address?.suburb ||
                              location.address?.city ||
                              location.type ||
                              'Location'}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {formatAddress(location)}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {parseFloat(location.lat).toFixed(4)},{' '}
                            {parseFloat(location.lon).toFixed(4)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
