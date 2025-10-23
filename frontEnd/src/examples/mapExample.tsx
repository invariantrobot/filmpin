import { useState } from 'react';
import { MapView } from '../views/mapView';
import type { FilmLocation } from '../views/mapView';

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

export function MapExample() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locations] = useState<FilmLocation[]>(sampleLocations);

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

  return (
    <div className="w-full h-full">
      {/* Map - full screen */}
      <div className="w-full h-full relative">
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
