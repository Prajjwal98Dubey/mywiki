import { Link, NavLink, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import SearchBox from '../search/SearchBox.jsx';
import Dropdown from '../ui/Dropdown.jsx';
import Icon from '../ui/Icon.jsx';
import AppLogo from './AppLogo.jsx';
import Avatar from './Avatar.jsx';
import ThemeMenu from './ThemeMenu.jsx';

const navClass = ({ isActive }) =>
  `rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-app-surface-muted text-app-ink' : 'text-app-muted hover:text-app-ink'
  }`;

function UserMenu({ user, onLogout }) {
  return (
    <Dropdown
      variant="app"
      align="right"
      label="Account menu"
      buttonClassName="flex items-center gap-1 rounded-full p-0.5 pr-1.5 hover:bg-app-surface-muted"
      button={
        <>
          <Avatar name={user.username} className="size-8 text-xs" />
          <Icon name="expand" size={10} className="text-app-muted" />
        </>
      }
    >
      {({ close }) => (
        <>
          <div className="border-b border-app-border px-2.5 pt-1.5 pb-2.5">
            <div className="text-sm font-semibold">{user.username}</div>
            {user.email && <div className="truncate text-xs text-app-muted">{user.email}</div>}
          </div>
          <ul className="m-0 list-none p-0 pt-1">
            <li>
              <Link to="/my-pages" className="app-menu-item" onClick={close}>
                <Icon name="article" size={16} /> My pages
              </Link>
            </li>
            <li>
              <Link to="/create" className="app-menu-item" onClick={close}>
                <Icon name="add" size={16} /> Create a page
              </Link>
            </li>
            <li>
              <button
                type="button"
                className="app-menu-item"
                onClick={() => {
                  close();
                  onLogout();
                }}
              >
                <Icon name="logout" size={16} /> Log out
              </button>
            </li>
          </ul>
        </>
      )}
    </Dropdown>
  );
}

function MobileMenu({ user, returnTo, onLogout }) {
  return (
    <Dropdown
      variant="app"
      align="right"
      label="Menu"
      buttonClassName="app-icon-btn md:hidden"
      button={<Icon name="menu" size={18} />}
      panelClassName="w-[min(18rem,calc(100vw-2rem))]"
    >
      {({ close }) => (
        <div className="space-y-1">
          <SearchBox variant="app" onDone={close} className="mb-2" />
          <Link to="/random" className="app-menu-item" onClick={close}>
            <Icon name="sparkle" size={16} /> Random page
          </Link>
          <Link to="/search?q=" className="app-menu-item" onClick={close}>
            <Icon name="search" size={16} /> Search
          </Link>
          {user ? (
            <>
              <Link to="/my-pages" className="app-menu-item" onClick={close}>
                <Icon name="article" size={16} /> My pages
              </Link>
              <button
                type="button"
                className="app-menu-item"
                onClick={() => {
                  close();
                  onLogout();
                }}
              >
                <Icon name="logout" size={16} /> Log out
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 border-t border-app-border pt-2">
              <Link to={`/login${returnTo}`} className="app-btn app-btn-secondary app-btn-sm" onClick={close}>
                Log in
              </Link>
              <Link to={`/register${returnTo}`} className="app-btn app-btn-primary app-btn-sm" onClick={close}>
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </Dropdown>
  );
}

export default function AppHeader() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const returnTo = isAuthPage || pathname === '/' ? '' : `?returnTo=${encodeURIComponent(pathname + search)}`;
  const onLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-app-border/70 bg-app-bg/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <AppLogo />
        <nav aria-label="Main" className="ml-4 hidden items-center gap-1 md:flex">
          <NavLink to="/random" className={navClass}>
            Explore
          </NavLink>
          <NavLink to="/search?q=" className={navClass}>
            Search
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <SearchBox variant="app" className="hidden w-60 lg:block" />
          <ThemeMenu />
          {!loading &&
            (user ? (
              <>
                <Link to="/create" className="app-btn app-btn-primary app-btn-sm hidden sm:inline-flex">
                  <Icon name="add" size={16} /> New page
                </Link>
                <UserMenu user={user} onLogout={onLogout} />
              </>
            ) : (
              <div className="hidden items-center gap-1.5 md:flex">
                <Link to={`/login${returnTo}`} className="app-btn app-btn-ghost app-btn-sm">
                  Log in
                </Link>
                <Link to={`/register${returnTo}`} className="app-btn app-btn-primary app-btn-sm">
                  Get started
                </Link>
              </div>
            ))}
          <MobileMenu user={user} returnTo={returnTo} onLogout={onLogout} />
        </div>
      </div>
    </header>
  );
}
