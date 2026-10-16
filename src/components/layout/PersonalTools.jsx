import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import Dropdown from '../ui/Dropdown.jsx';
import Icon from '../ui/Icon.jsx';

function useReturnTo() {
  const { pathname, search, hash } = useLocation();
  if (pathname === '/login' || pathname === '/register') return '';
  return `?returnTo=${encodeURIComponent(pathname + search + hash)}`;
}

export default function PersonalTools() {
  const { user, loading, logout } = useAuth();
  const returnTo = useReturnTo();
  const navigate = useNavigate();

  if (loading) return <div className="w-24" aria-hidden="true" />;

  if (!user) {
    return (
      <>
        <ul className="m-0 hidden list-none items-center gap-3 p-0 text-sm sm:flex" aria-label="Personal tools">
          <li>
            <Link to={`/register${returnTo}`}>Create account</Link>
          </li>
          <li>
            <Link to={`/login${returnTo}`}>Log in</Link>
          </li>
        </ul>
        <div className="sm:hidden">
          <Dropdown
            label="Personal tools"
            align="right"
            buttonClassName="cdx-button cdx-button--quiet px-1.5"
            button={<Icon name="ellipsis" />}
            panelClassName="w-44 py-1"
          >
            {({ close }) => (
              <ul className="m-0 list-none p-0 text-sm">
                <li>
                  <Link className="block px-3 py-1.5" to={`/register${returnTo}`} onClick={close}>
                    Create account
                  </Link>
                </li>
                <li>
                  <Link className="block px-3 py-1.5" to={`/login${returnTo}`} onClick={close}>
                    Log in
                  </Link>
                </li>
              </ul>
            )}
          </Dropdown>
        </div>
      </>
    );
  }

  return (
    <Dropdown
      label="Personal tools"
      align="right"
      buttonClassName="cdx-button cdx-button--quiet gap-1 px-1.5 font-normal"
      button={
        <>
          <Icon name="user" />
          <span className="hidden max-w-[10rem] truncate sm:inline">{user.username}</span>
          <Icon name="expand" size={12} className="hidden sm:block" />
        </>
      }
      panelClassName="w-48 py-1"
    >
      {({ close }) => (
        <ul className="m-0 list-none p-0 text-sm">
          <li className="border-b border-wiki-border-subtle px-3 py-1.5 font-bold sm:hidden">{user.username}</li>
          <li>
            <Link className="flex items-center gap-2 px-3 py-1.5" to="/my-pages" onClick={close}>
              <Icon name="listBullet" size={16} /> My pages
            </Link>
          </li>
          <li>
            <Link className="flex items-center gap-2 px-3 py-1.5" to="/create" onClick={close}>
              <Icon name="add" size={16} /> Create a page
            </Link>
          </li>
          <li>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-wiki-link hover:underline"
              onClick={async () => {
                close();
                await logout();
                navigate('/');
              }}
            >
              <Icon name="previous" size={16} /> Log out
            </button>
          </li>
        </ul>
      )}
    </Dropdown>
  );
}
