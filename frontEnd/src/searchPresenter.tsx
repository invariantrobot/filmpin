import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchView } from './views/searchView';
import type { SearchTab } from './views/searchView';
import { getByTitle, type Movie, type Location, getByLocation } from './services/api';

// Type for geocoding results from Nominatim API
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

export function SearchPresenter() {
  console.log('SearchPresenter: Component rendering');

  // Restore state from sessionStorage on mount
  const [searchQuery, setSearchQuery] = useState(() => {
    const saved = sessionStorage.getItem('searchQuery');
    return saved || '';
  });
  const [activeTab, setActiveTab] = useState<SearchTab>(() => {
    const saved = sessionStorage.getItem('searchActiveTab');
    return (saved as SearchTab) || 'films';
  });
  const [filmResults, setFilmResults] = useState<Movie[]>(() => {
    const saved = sessionStorage.getItem('searchFilmResults');
    return saved ? JSON.parse(saved) : [];
  });
  const [locationResults, setLocationResults] = useState<Location[]>(
    () => {
      const saved = sessionStorage.getItem('searchLocationResults');
      return saved ? JSON.parse(saved) : [];
    }
  );
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  // Save search state to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('searchQuery', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    sessionStorage.setItem('searchActiveTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    sessionStorage.setItem('searchFilmResults', JSON.stringify(filmResults));
  }, [filmResults]);

  useEffect(() => {
    sessionStorage.setItem(
      'searchLocationResults',
      JSON.stringify(locationResults)
    );
  }, [locationResults]);

  // Log mount/unmount for debugging
  useEffect(() => {
    console.log('SearchPresenter: Component mounted');
    return () => {
      console.log('SearchPresenter: Component unmounting');
    };
  }, []);

  // Search films from backend API
  const searchFilms = useCallback(async (query: string) => {
    setIsSearching(true);
    try {
      const films = await getByTitle(query);
      setFilmResults(films);
    } catch (error) {
      console.error('Error searching films:', error);
      setFilmResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Search locations using Nominatim API (OpenStreetMap)
  const searchLocations = useCallback(async (query: string) => {
    setIsSearching(true);
    try {
      const locations = await getByLocation(query);
      setLocationResults(locations);
    } catch (error) {
      console.error('Error searching locations:', error);
      setLocationResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);



  // Debounced search for films tab
  useEffect(() => {
    if (activeTab !== 'films' || !searchQuery.trim()) {
      // Only clear results if we're changing the query to empty
      if (!searchQuery.trim()) {
        setFilmResults([]);
      }
      return;
    }

    // Skip search if we already have cached results from sessionStorage
    if (filmResults.length > 0) {
      return;
    }

    const timeoutId = setTimeout(() => {
      searchFilms(searchQuery);
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeTab, searchFilms, filmResults.length]);

  // Debounced geocoding search for locations tab
  useEffect(() => {
    if (activeTab !== 'locations' || !searchQuery.trim()) {
      // Only clear results if we're changing the query to empty
      if (!searchQuery.trim()) {
        setLocationResults([]);
      }
      return;
    }

    // Skip search if we already have cached results from sessionStorage
    if (locationResults.length > 0) {
      return;
    }

    const timeoutId = setTimeout(() => {
      searchLocations(searchQuery);
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeTab, searchLocations, locationResults.length]);

  function handleSearchTextChange(text: string) {
    setSearchQuery(text);
    // Clear cached results when user types a new query
    // This allows the search effect to run again
    if (text !== searchQuery) {
      setFilmResults([]);
      setLocationResults([]);
    }
  }

  function handleTabChange(tab: SearchTab) {
    setActiveTab(tab);
    // Search query persists across tabs
    // Clear results when switching tabs
    if (tab !== 'locations') {
      setLocationResults([]);
    }
    if (tab !== 'films') {
      setFilmResults([]);
    }
  }

  function handleBackClick() {
    // Clear search state when explicitly going back to dashboard
    sessionStorage.removeItem('searchQuery');
    sessionStorage.removeItem('searchActiveTab');
    sessionStorage.removeItem('searchFilmResults');
    sessionStorage.removeItem('searchLocationResults');
    sessionStorage.removeItem('searchScrollPosition');
    navigate('/');
  }

  function handleLocationClick(location: Location) {
    console.log('SearchPresenter: Location clicked:', location);
    const mapCenter = {
      latitude: parseFloat(location.lat),
      longitude: parseFloat(location.lon),
    };
    console.log('SearchPresenter: Navigating with center:', mapCenter);

    // Navigate to dashboard with the selected location
    navigate('/', {
      state: {
        mapCenter,
        selectedLocationName: location.place,
      },
    });
  }

  function handleFilmClick(film: Movie) {
    console.log('SearchPresenter: Film clicked:', film);
    // Navigate to film detail page (you can adjust the route as needed)
    navigate(`/film/${film.id}`);
  }

  return (
    <SearchView
      searchQuery={searchQuery}
      onSearchTextChange={handleSearchTextChange}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onBackClick={handleBackClick}
      filmResults={filmResults}
      locationResults={locationResults}
      onLocationClick={handleLocationClick}
      onFilmClick={handleFilmClick}
      isSearching={isSearching}
    />
  );
}
