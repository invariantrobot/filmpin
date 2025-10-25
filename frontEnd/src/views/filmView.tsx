import '../index.css';
import { MapPin, ArrowLeft, Star, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Movie, Location } from '../services/api';

interface FilmViewProps {
  model: unknown;
  film: Movie | null;
  locations: Location[];
  isLoading: boolean;
}

export function FilmView({ film, locations, isLoading }: FilmViewProps) {
  const [isStarred, setIsStarred] = useState(false);
  const navigate = useNavigate();

  // Generate placeholder poster URL
  function getPlaceholderPoster(title: string): string {
    const colors = ['457b9d', 'e63946', '2a9d8f', 'f4a261', '8338ec', 'fb5607'];
    const colorIndex = title.length % colors.length;
    const initials = title.substring(0, 3).toUpperCase();
    return `https://placehold.co/300x450/${colors[colorIndex]}/white?text=${encodeURIComponent(initials)}`;
  }

  // Get poster URL from server or use placeholder
  function getPosterUrl(imdbId?: string, title?: string): string {
    if (imdbId) {
      return `http://localhost:8989/posters/${imdbId}.jpg`;
    }
    return getPlaceholderPoster(title || 'N/A');
  }

  // Handle location click
  function handleLocationClick(location: Location) {
    navigate('/location', {
      state: {
        location,
        movieTitle: film?.title,
      },
    });
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Show error if no film found
  if (!film) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Film Not Found
        </h2>
        <p className="text-gray-600 mb-4">
          The requested film could not be found.
        </p>
        <button
          onClick={() => window.history.back()}
          className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const posterUrl = getPosterUrl(film.id, film.title);

  // Helper to format duration
  function formatDuration(minutes?: number): string {
    if (!minutes || isNaN(minutes)) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  }

  return (
    <div className="MyFilm">
      <div
        className="relative h-90 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${posterUrl})` }}
      >
        <div className="absolute inset-0 bg-green-900/90 backdrop-blur-md"></div>
        {/* Navigation buttons */}
        <div className="absolute top-8 left-8 right-8 flex justify-between z-20">
          <button
            onClick={() => window.history.back()}
            className="bg-white/50 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/60 transition"
          >
            <ArrowLeft size={28} />
          </button>
          <button
            onClick={() => setIsStarred(!isStarred)}
            className="bg-white/50 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/60 transition"
          >
            <Star
              size={28}
              fill={isStarred ? '#fbbf24' : 'none'}
              color={isStarred ? '#fbbf24' : 'white'}
            />
          </button>
        </div>
        <div className="relative pt-20 rounded-2xl">
          <img
            src={posterUrl}
            alt={film.title}
            className="w-55 h-auto rounded-lg mx-auto"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = getPlaceholderPoster(film.title);
            }}
          />
        </div>
      </div>
      <div className="">
        <h2 className="text-3xl font-bold text-black text-center pt-18 pb-2">
          {film.title}
        </h2>
        <p className="text-md text-gray-600 text-center">
          {film.year || '19XX'}
          {film.runTime && ` | ${formatDuration(film.runTime)}`}
          {film.genre ? ` | ${film.genre}` : ' | genre unknown'}
        </p>
        <p className="px-4 py-2 text-gray-700 text-left max-w-md mx-auto">
          {film.plot || 'No description available.'}
        </p>
      </div>
      <div>
        <div className="mt-4 flex justify-between items-center mx-4">
          <h3 className="text-2xl font-semibold text-gray-800">
            Filming Locations {locations.length > 0 && `(${locations.length})`}
          </h3>
          {locations.length > 0 && (
            <button className="bg-green-200 text-green-900 px-6 py-2 rounded-full flex items-center gap-2">
              <MapPin size={20} />
              View on Map
            </button>
          )}
        </div>
        {locations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p>No filming locations available for this movie.</p>
          </div>
        ) : (
          <ul className="mx-4 mt-2 pb-4">
            {locations.map((location) => (
              <li
                key={location.id}
                onClick={() => handleLocationClick(location)}
                className="flex gap-4 items-center py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 cursor-pointer rounded-lg px-2"
              >
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-blue-100 rounded-md flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-semibold text-gray-900 truncate">
                    {location.place}
                  </h4>
                  {location.info && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {location.info}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
