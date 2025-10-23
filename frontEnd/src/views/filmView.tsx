import '../index.css';
import { MapPin, ArrowLeft, Star } from 'lucide-react';
import { useState } from 'react';

interface FilmViewProps {
  model: unknown;
}

export function FilmView(_props: FilmViewProps) {
  const [isStarred, setIsStarred] = useState(false);

  const pins = [
    {
      id: 1,
      image: 'https://placehold.co/300x300/ffa101/white?text=ABC',
      name: 'Pin Location Name',
      description:
        'While desperately trying to find ways to get her ADHD medication, 18-year-old...',
    },
    {
      id: 2,
      image: 'https://placehold.co/300x300/d72a23/white?text=DEF',
      name: 'Pin Location Name',
      description:
        'While desperately trying to find ways to get her ADHD medication, 18-year-old...',
    },
    {
      id: 3,
      image: 'https://placehold.co/300x300/b692e1/white?text=GHI',
      name: 'Pin Location Name',
      description:
        'While desperately trying to find ways to get her ADHD medication, 18-year-old...',
    },
    {
      id: 4,
      image: 'https://placehold.co/300x300/f53e10/white?text=JKL',
      name: 'Pin Location Name',
      description:
        'While desperately trying to find ways to get her ADHD medication, 18-year-old...',
    },
    {
      id: 5,
      image: 'https://placehold.co/300x300/d78792/white?text=MNO',
      name: 'Pin Location Name',
      description:
        'While desperately trying to find ways to get her ADHD medication, 18-year-old...',
    },
    {
      id: 6,
      image: 'https://placehold.co/300x300/d5578e/white?text=PQR',
      name: 'Pin Location Name',
      description:
        'While desperately trying to find ways to get her ADHD medication, 18-year-old...',
    },
  ];

  return (
    <div className="MyFilm">
      <div
        className="relative h-90 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/public/test/easygoing-poster.jpg)' }}
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
            src="/public/test/easygoing-poster.jpg"
            alt="Film Poster"
            className="w-55 h-auto rounded-lg mx-auto"
          />
        </div>
      </div>
      <div className="">
        <h2 className="text-3xl font-bold text-black text-center pt-14 pb-2">
          Easy Going
        </h2>
        <p className="text-md text-gray-600 text-center">2022 | 1h 31m</p>
        <p className="px-4 py-2 text-gray-700 text-left max-w-md mx-auto">
          While desperately trying to find ways to get her ADHD medication,
          18-year-old Joanna is trying to figure out her newfound feelings
          towards her classmate Audrey, but also towards herself.
        </p>
      </div>
      <div>
        <div className="mt-4 flex justify-between items-center mx-4">
          <h3 className="text-2xl font-semibold text-gray-800">Movie Pins</h3>
          <button className="bg-green-200 text-green-900 px-6 py-2 rounded-full flex items-center gap-2">
            <MapPin size={20} />
            Pins on Map
          </button>
        </div>
        <ul className="mx-4 mt-2 pb-4">
          {pins.map((pin) => (
            <li
              key={pin.id}
              className="flex gap-4 items-center py-2 hover:scale-102 transition-transform duration-200 cursor-pointer"
            >
              <div>
                <img
                  src={pin.image}
                  width="90"
                  height="90"
                  className="rounded-md"
                  alt={pin.name}
                />
              </div>
              <div>
                <h4 className="text-xl font-semibold">{pin.name}</h4>
                <p>{pin.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
