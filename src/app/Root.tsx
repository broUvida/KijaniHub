import { Outlet } from 'react-router';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

/**
 * Root layout component - provides global app structure
 * Includes sidebar navigation and header
 */
export default function Root() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}