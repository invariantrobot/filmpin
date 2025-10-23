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
} from 'lucide-react';
import { MapView } from './mapView';
import type { FilmLocation } from './mapView';
import { useState } from 'react';

interface FilmLocationViewProps {
  model: unknown;
}

export function FilmLocationView(_props: FilmLocationViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Sample location from mapExample.tsx - Stockholm City Hall
  const location: FilmLocation = {
    id: 'loc-1',
    movieId: 'movie-1',
    latitude: 59.3293,
    longitude: 18.0686,
    title: 'Stockholm City Hall',
    movieTitle: 'The Girl with the Dragon Tattoo',
    imageUrl: 'https://placehold.co/300x300/e63946/white?text=TGW',
  };

  return (
    <div className="MyFilmLocation">
      <div
        className="relative h-100 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/public/test/location-test.jpg)' }}
      >
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
          Film Location Name Here
        </h2>
        <p className="px-4 py-2 text-gray-700 text-left">
          While desperately trying to find ways to get her ADHD medication,
          18-year-old Joanna is trying to figure out her newfound feelings
          towards her classmate Audrey, but also towards herself.
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
            locations={[location]}
            initialCenter={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            radiusKm={1}
            searchQuery={searchQuery}
            onSearchTextChange={setSearchQuery}
            onSearchButtonClick={() => console.log('Search clicked')}
            onLocationClick={(loc) => console.log('Location clicked:', loc)}
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
