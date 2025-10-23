import { observer } from 'mobx-react-lite';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FilmView } from './views/filmView.tsx';
import {
  getAllTitles,
  getLocationsByID,
  type Movie,
  type Location,
} from './services/api';

interface FilmProps {
  model: unknown;
}

const Film = observer(function FilmRender(_props: FilmProps) {
  const { filmId } = useParams<{ filmId?: string }>();
  const [film, setFilm] = useState<Movie | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFilmData() {
      if (!filmId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch all movies to find the one with matching ID
        console.log('Fetching film with ID:', filmId);
        const allMovies = await getAllTitles();
        const foundFilm = allMovies.find((m) => m.id === filmId);
        console.log('Found film:', foundFilm);

        if (foundFilm) {
          setFilm(foundFilm);

          // Fetch locations for this film
          console.log('Fetching locations for film ID:', filmId);
          const locationsData = await getLocationsByID([filmId]);
          console.log('Locations data received:', locationsData);
          console.log('Locations for this film:', locationsData[filmId]);
          setLocations(locationsData[filmId] || []);
        }
      } catch (error) {
        console.error('Error fetching film data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFilmData();
  }, [filmId]);

  return (
    <div>
      <FilmView
        model={_props.model}
        film={film}
        locations={locations}
        isLoading={isLoading}
      />
    </div>
  );
});

export { Film };
