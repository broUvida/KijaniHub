import { Outlet } from 'react-router';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

/**
 * Root layout — Apple-style app frame.
 * Uses the device's system font (San Francisco on iPhone and Mac) and a
 * light grouped background. The header sits inside the scrolling area so
 * content blurs beneath it, like iOS navigation bars.
 */
const SYSTEM_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export default function Root() {
  return (
    <div
      className="flex h-screen bg-[#F2F2F7] text-[#1D1D1F] antialiased"
      style={{ fontFamily: SYSTEM_FONT }}
    >
      <Sidebar />

      <div className="flex-1 min-w-0 overflow-y-auto">
        <Header />
        <main className="isolate w-full max-w-[1200px] mx-auto px-4 md:px-8 pt-4 pb-28 md:pb-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
