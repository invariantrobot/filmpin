import { observer } from 'mobx-react-lite';
import { NavbarView } from './views/navbarView.tsx';

interface NavbarProps {
  model: unknown;
}

const Navbar = observer(function NavbarRender(_props: NavbarProps) {
  return (
    <div>
      <NavbarView />
    </div>
  );
});

export { Navbar };
