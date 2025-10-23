import { observer } from 'mobx-react-lite';
import { FilmView } from './views/filmView.tsx';

interface FilmProps {
  model: unknown;
}

const Film = observer(function FilmRender(_props: FilmProps) {
  return (
    <div>
      <FilmView model={_props.model} />
    </div>
  );
});

export { Film };
