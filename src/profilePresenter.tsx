import { observer } from 'mobx-react-lite';
import { ProfileView } from './views/profileView.tsx';

interface ProfileProps {
  model: unknown;
}

const Profile = observer(function ProfileRender(_props: ProfileProps) {
  return (
    <div>
      <ProfileView model={_props.model} />
    </div>
  );
});

export { Profile };
