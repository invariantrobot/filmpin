import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../navbarPresenter.tsx';
import { useEffect } from 'react';

export function LayoutView() {
  const location = useLocation();

  useEffect(() => {
    console.log('LayoutView: Route changed to:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
      <Navbar />
    </div>
  );
}
