import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { AppearanceProvider } from './context/AppearanceContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { createRouter } from './App.jsx';
import './styles/index.css';

const router = createRouter();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppearanceProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </AppearanceProvider>
  </StrictMode>,
);
