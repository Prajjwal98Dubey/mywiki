import { Outlet } from 'react-router';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

export default function WikiLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#content"
        className="sr-only-focusable absolute top-2 left-2 z-[100] rounded-[2px] bg-wiki-page px-3 py-2 shadow-wiki-dropdown"
      >
        Jump to content
      </a>
      <Header />
      <div className="page-container w-full flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
