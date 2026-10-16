import { Link } from 'react-router';
import Dropdown from '../ui/Dropdown.jsx';
import Icon from '../ui/Icon.jsx';

const ITEMS = [
  { to: '/', label: 'Main page' },
  { to: '/create', label: 'Create a page' },
  { to: '/random', label: 'Random page' },
  { to: '/my-pages', label: 'My pages' },
];

export default function MainMenu() {
  return (
    <Dropdown
      label="Main menu"
      buttonClassName="cdx-button cdx-button--quiet px-1.5"
      button={<Icon name="menu" />}
      panelClassName="w-[13rem] px-3 py-2"
    >
      {({ close }) => (
        <nav aria-label="Main menu" className="text-sm">
          <div className="mb-1 border-b border-wiki-border-subtle pb-1 font-bold">Main menu</div>
          <div className="mt-2 mb-1 text-xs font-bold text-wiki-subtle-text">Navigation</div>
          <ul className="m-0 list-none p-0">
            {ITEMS.map((item) => (
              <li key={item.to}>
                <Link to={item.to} onClick={close} className="block py-1">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </Dropdown>
  );
}
