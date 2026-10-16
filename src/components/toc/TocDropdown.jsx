import Dropdown from '../ui/Dropdown.jsx';
import Icon from '../ui/Icon.jsx';
import TableOfContents from './TableOfContents.jsx';

/** ☰ button beside the title that opens the TOC when it isn't pinned to the sidebar. */
export default function TocDropdown({ entries, activeId, canPin, onPin }) {
  return (
    <Dropdown
      label="Toggle the table of contents"
      buttonClassName="cdx-button cdx-button--quiet mb-1 px-1.5"
      button={<Icon name="listBullet" />}
      panelClassName="max-h-[70vh] w-[17rem] max-w-[calc(100vw-2rem)] overflow-y-auto px-3 py-2"
    >
      {({ close }) => (
        <TableOfContents
          entries={entries}
          activeId={activeId}
          pinAction={canPin ? 'move to sidebar' : undefined}
          onPinAction={
            canPin
              ? () => {
                  close();
                  onPin();
                }
              : undefined
          }
          onNavigate={close}
        />
      )}
    </Dropdown>
  );
}
