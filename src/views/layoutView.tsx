import { Outlet } from 'react-router-dom';
import { Navbar } from '../navbarPresenter.tsx';

export function LayoutView() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
      <Navbar />
    </div>
  );
}
