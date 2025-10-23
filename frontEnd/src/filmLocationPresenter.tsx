import { observer } from 'mobx-react-lite';
import { useLocation } from 'react-router-dom';
import { FilmLocationView } from './views/filmLocationView.tsx';
import type { Location } from './services/api';

interface FilmLocationProps {
  model: unknown;
}

interface LocationState {
  location?: Location;
  movieTitle?: string;
}

const FilmLocation = observer(function FilmLocationRender(
  _props: FilmLocationProps
) {
  const routerLocation = useLocation();
  const state = routerLocation.state as LocationState;

  return (
    <div>
      <FilmLocationView
        model={_props.model}
        location={state?.location}
        movieTitle={state?.movieTitle}
      />
    </div>
  );
});

export { FilmLocation };
