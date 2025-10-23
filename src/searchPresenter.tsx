import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchView } from './views/searchView';
import type { SearchTab } from './views/searchView';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('films');
  const [locationResults, setLocationResults] = useState<GeocodedLocation[]>(
    []
  );
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  // Log mount/unmount for debugging
  useEffect(() => {
    console.log('SearchPresenter: Component mounted');
    return () => {
      console.log('SearchPresenter: Component unmounting');
    };
  }, []);

  // Search locations using Nominatim API (OpenStreetMap)
  const searchLocations = useCallback(async (query: string) => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/nominatim/search?` +
          new URLSearchParams({
            q: query,
            format: 'json',
            addressdetails: '1',
            limit: '10',
          }),
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to search locations: ${response.status}`);
      }

      const data: GeocodedLocation[] = await response.json();
      setLocationResults(data);
    } catch (error) {
      console.error('Error searching locations:', error);
      // Show user-friendly error message
      setLocationResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced geocoding search for locations tab
  useEffect(() => {
    if (activeTab !== 'locations' || !searchQuery.trim()) {
      setLocationResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchLocations(searchQuery);
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeTab, searchLocations]);

  function handleSearchTextChange(text: string) {
    setSearchQuery(text);
  }

  function handleTabChange(tab: SearchTab) {
    setActiveTab(tab);
    // Search query persists across tabs
    // Just clear location results when switching away from locations
    if (tab !== 'locations') {
      setLocationResults([]);
    }
  }

  function handleBackClick() {
    navigate('/');
  }

  function handleLocationClick(location: GeocodedLocation) {
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
        selectedLocationName: location.display_name,
      },
    });
  }

  return (
    <SearchView
      searchQuery={searchQuery}
      onSearchTextChange={handleSearchTextChange}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onBackClick={handleBackClick}
      locationResults={locationResults}
      onLocationClick={handleLocationClick}
      isSearching={isSearching}
    />
  );
}
