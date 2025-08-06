import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import '@quiet-rss/ui/src/styles/theme.css';
import '@quiet-rss/ui/src/components/styles/button.css';
import '@quiet-rss/ui/src/components/styles/card.css';
import '@quiet-rss/ui/src/components/styles/modal.css';
import '@quiet-rss/ui/src/components/styles/search-bar.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
