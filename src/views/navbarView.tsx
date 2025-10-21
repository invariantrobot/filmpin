import '../index.css';

export function NavbarView() {
  return (
    <div className="navbarview bg-red-300">
      <div className="logo">
        <a href="#/">FilmPin Navbar</a>
      </div>
      <div className="pages">
        <ul>
          <li>
            <a href="#/profile">Profile</a>
          </li>
        </ul>
      </div>
    </div>
  );
}
