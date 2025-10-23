import { observer } from 'mobx-react-lite';
import { FilmLocationView } from './views/filmLocationView.tsx';

interface FilmLocationProps {
  model: unknown;
}

const FilmLocation = observer(function FilmLocationRender(
  _props: FilmLocationProps
) {
  return (
    <div>
      <FilmLocationView model={_props.model} />
    </div>
  );
});

export { FilmLocation };
