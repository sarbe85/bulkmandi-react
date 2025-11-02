import { Toaster } from '@/shared/components/ui/toaster';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
      {/* ✅ Toast notifications container */}
      <Toaster />
    </ThemeProvider>
  </React.StrictMode>,
);
