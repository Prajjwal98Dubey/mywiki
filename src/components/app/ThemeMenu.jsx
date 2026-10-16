import { useAppearance } from '../../context/AppearanceContext.jsx';
import Dropdown from '../ui/Dropdown.jsx';
import Icon from '../ui/Icon.jsx';

const OPTIONS = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'auto', label: 'System', icon: 'appearance' },
];

export default function ThemeMenu() {
  const { theme, resolvedTheme, setTheme } = useAppearance();
  return (
    <Dropdown
      variant="app"
      align="right"
      label="Theme"
      buttonClassName="app-icon-btn"
      button={<Icon name={resolvedTheme === 'dark' ? 'moon' : 'sun'} size={18} />}
      panelClassName="min-w-40"
    >
      {({ close }) => (
        <ul className="m-0 list-none p-0" aria-label="Theme">
          {OPTIONS.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                className="app-menu-item"
                aria-pressed={theme === o.value}
                onClick={() => {
                  setTheme(o.value);
                  close();
                }}
              >
                <Icon name={o.icon} size={16} />
                <span className="flex-1">{o.label}</span>
                {theme === o.value && <Icon name="check" size={16} className="text-app-accent" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Dropdown>
  );
}
