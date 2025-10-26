import '../index.css';
import {
  MapPin,
  ArrowLeft,
  Plus,
  Users,
  Clock,
  DollarSign,
  Cloud,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { MapView } from './mapView';
import type { FilmLocation } from './mapView';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Location } from '../services/api';
import { getLocationPictureById } from '../services/api';

interface FilmLocationViewProps {
  model: unknown;
  location?: Location;
  movieTitle?: string;
}

export function FilmLocationView({
  location,
  movieTitle,
}: FilmLocationViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const DEFAULT_IMAGE = '/public/test/location-test.jpg';
  const TIMEOUT_MS = 5000; // 5 seconds timeout

  console.log('FilmLocationView: Received location:', location);
  console.log('FilmLocationView: Received movieTitle:', movieTitle);

  // Fetch Mapillary background image when location is available
  useEffect(() => {
    let currentImageUrl: string | null = null;
    let isCancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    if (location?.id) {
      setIsLoading(true);

      // Set a timeout to fall back to default image
      timeoutId = setTimeout(() => {
        if (!isCancelled) {
          console.log('Mapillary image loading timed out, using default');
          setBackgroundImage(DEFAULT_IMAGE);
          setIsLoading(false);
        }
      }, TIMEOUT_MS);

      getLocationPictureById(location.id)
        .then((imageUrl) => {
          if (!isCancelled) {
            clearTimeout(timeoutId);
            if (imageUrl) {
              currentImageUrl = imageUrl;
              setBackgroundImage(imageUrl);
            } else {
              // API returned null, use default
              setBackgroundImage(DEFAULT_IMAGE);
            }
            setIsLoading(false);
          }
        })
        .catch((error) => {
          if (!isCancelled) {
            clearTimeout(timeoutId);
            console.error('Error loading Mapillary image:', error);
            setBackgroundImage(DEFAULT_IMAGE);
            setIsLoading(false);
          }
        });
    } else {
      // No location ID, use default immediately
      setBackgroundImage(DEFAULT_IMAGE);
      setIsLoading(false);
    }

    // Cleanup blob URL when component unmounts or location changes
    return () => {
      isCancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (currentImageUrl && currentImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentImageUrl);
      }
    };
  }, [location?.id]);

  // Handler to navigate to dashboard map centered on this location
  const handlePinClick = (loc: FilmLocation) => {
    console.log('Pin clicked, navigating to dashboard with location:', loc);
    navigate('/', {
      state: {
        mapCenter: {
          latitude: loc.latitude,
          longitude: loc.longitude,
        },
        selectedLocationName: loc.title,
        timestamp: Date.now(), // Force state update
      },
    });
  };

  // Use provided location or fallback to sample location
  const filmLocation: FilmLocation = location
    ? {
        id: `loc-${location.id}`,
        movieId: location.movie_id,
        latitude: location.lat,
        longitude: location.lon,
        title: location.place,
        movieTitle: movieTitle || 'Unknown Movie',
        imageUrl: 'https://placehold.co/300x300/e63946/white?text=LOC',
      }
    : {
        id: 'loc-1',
        movieId: 'movie-1',
        latitude: 59.3293,
        longitude: 18.0686,
        title: 'Stockholm City Hall',
        movieTitle: 'The Girl with the Dragon Tattoo',
        imageUrl: 'https://placehold.co/300x300/e63946/white?text=TGW',
      };

  console.log('FilmLocationView: Using filmLocation:', filmLocation);

  return (
    <div className="MyFilmLocation">
      <div
        className="relative h-100 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
          backgroundColor: isLoading ? '#1a1a1a' : undefined,
        }}
      >
        {/* Loading spinner overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-10">
            <Loader2 className="w-16 h-16 text-white animate-spin" />
          </div>
        )}

        {/* Navigation buttons */}
        <div className="absolute top-8 left-8 right-8 flex justify-between z-20">
          <button
            onClick={() => window.history.back()}
            className="bg-black/50 backdrop-blur-sm rounded-full p-3 text-white hover:bg-black/60 transition"
          >
            <ArrowLeft size={28} />
          </button>
          <button className="bg-black/50 backdrop-blur-sm rounded-full p-3 text-white hover:bg-black/60 transition">
            <div className="relative">
              <MapPin size={28} />
              <Plus
                size={16}
                className="absolute -top-1 -right-1 bg-white text-green-600 rounded-full"
                strokeWidth={3}
              />
            </div>
          </button>
        </div>
      </div>
      <div className="">
        <h2 className="text-3xl font-bold text-black text-left pt-8 pb-2 ml-4">
          {filmLocation.title}
        </h2>
        <p className="px-4 py-2 text-gray-700 text-left">
          {location?.info ||
            'No additional information available for this location.'}
        </p>
      </div>
      <div>
        <div className="mt-4 flex justify-between items-center mx-4">
          <h3 className="text-2xl font-semibold text-gray-800">Pin Location</h3>
          <button className="bg-gray-200 text-gray-700 px-6 py-2 rounded-full flex items-center gap-2">
            <Users size={20} />
            24 people visited
          </button>
        </div>
        <div className="px-0 py-0 mx-4 rounded mt-6 h-60 overflow-hidden">
          <MapView
            locations={[filmLocation]}
            initialCenter={{
              latitude: filmLocation.latitude,
              longitude: filmLocation.longitude,
            }}
            radiusKm={1}
            searchQuery={searchQuery}
            onSearchTextChange={setSearchQuery}
            onSearchButtonClick={() => console.log('Search clicked')}
            onLocationClick={handlePinClick}
            showSearch={false}
            showRecenterButton={false}
            showInfoPanel={false}
          />
        </div>
      </div>
      <div className="my-8 mx-4">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
          Good to know
        </h3>
        <div className="flex flex-col gap-3">
          <button className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-4 rounded-lg hover:bg-gray-300 transition w-full">
            <Clock size={20} />
            <span>Timetable</span>
            <ChevronDown size={16} className="ml-auto" />
          </button>
          <button className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-4 rounded-lg hover:bg-gray-300 transition w-full">
            <DollarSign size={20} />
            <span>Prices</span>
            <ChevronDown size={16} className="ml-auto" />
          </button>
          <button className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-4 rounded-lg hover:bg-gray-300 transition w-full">
            <Cloud size={20} />
            <span>Weather</span>
            <ChevronDown size={16} className="ml-auto" />
          </button>
        </div>
      </div>
    </div>
  );
}
