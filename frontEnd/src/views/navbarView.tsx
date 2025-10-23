import '../index.css';
import { ListChecks, MapPin, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export function NavbarView() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/') {
      // Discover is active for both home and search paths
      return location.pathname === '/' || location.pathname === '/search';
    }
    return location.pathname === path;
  };

  const navItems = [
    { path: '/plan', icon: ListChecks, label: 'Plan' },
    { path: '/', icon: MapPin, label: 'Discover' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="navbarview bg-gray-100 border-t border-gray-200 px-6 py-3">
      <nav className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 transition-all duration-200 hover:scale-110 ${
                active ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} />
              <span
                className={`text-xs ${active ? 'font-semibold' : 'font-normal'}`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
