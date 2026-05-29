import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';
import { ErrorBoundary } from './lib/error-boundary';
import './styles/index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element introuvable');

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
