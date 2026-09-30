import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AppProvider } from './context/AppContext';

/**
 * KijaniSense - IoT Dashboard for Circular Economy
 * Main entry point for the application
 */
function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}

export default App;