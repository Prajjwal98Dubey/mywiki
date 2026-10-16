import { useState } from 'react';
import { useAppearance } from '../../context/AppearanceContext.jsx';
import { BREAKPOINTS, useMediaQuery } from '../../hooks/useMediaQuery.js';
import AppearancePanel from '../appearance/AppearancePanel.jsx';
import SearchBox from '../search/SearchBox.jsx';
import Dropdown from '../ui/Dropdown.jsx';
import Icon from '../ui/Icon.jsx';
import Logo from './Logo.jsx';
import MainMenu from './MainMenu.jsx';
import PersonalTools from './PersonalTools.jsx';

function AppearanceButton() {
  const { pinned, setPinned } = useAppearance();
  const wide = useMediaQuery(BREAKPOINTS.wide);
  if (pinned && wide) return null; // shown as the right-hand column instead
  return (
    <Dropdown
      label="Appearance"
      align="right"
      buttonClassName="cdx-button cdx-button--quiet px-1.5"
      button={<Icon name="appearance" />}
      panelClassName="w-[15rem] px-3 py-2"
    >
      {({ close }) => (
        <AppearancePanel
          pinAction={wide ? 'move to sidebar' : undefined}
          onPinAction={
            wide
              ? () => {
                  close();
                  setPinned(true);
                }
              : undefined
          }
        />
      )}
    </Dropdown>
  );
}

export default function Header() {
  const mobile = useMediaQuery(BREAKPOINTS.mobile);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="page-container relative w-full">
      <div className="flex h-[var(--header-height)] items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-1 sm:gap-2">
          <MainMenu />
          <Logo />
        </div>

        <div className="flex min-w-0 flex-1 justify-end sm:justify-start">
          {mobile ? (
            <button
              type="button"
              className="cdx-button cdx-button--quiet px-1.5"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Icon name="search" />
            </button>
          ) : (
            <SearchBox className="w-full max-w-[32rem] transition-[max-width] duration-200 focus-within:max-w-[40rem]" />
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <AppearanceButton />
          <PersonalTools />
        </div>
      </div>

      {mobile && searchOpen && (
        <div className="absolute inset-x-0 top-0 z-40 flex h-[var(--header-height)] items-center gap-2 bg-wiki-page px-4">
          <SearchBox autoFocus className="flex-1" onDone={() => setSearchOpen(false)} />
          <button
            type="button"
            className="cdx-button cdx-button--quiet px-1.5"
            aria-label="Close search"
            onClick={() => setSearchOpen(false)}
          >
            <Icon name="close" />
          </button>
        </div>
      )}
    </header>
  );
}
