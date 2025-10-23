import { observer } from 'mobx-react-lite';
import { NavbarView } from './views/navbarView.tsx';

const Navbar = observer(function NavbarRender() {
  return (
    <div>
      <NavbarView />
    </div>
  );
});

export { Navbar };
