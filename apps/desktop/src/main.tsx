import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@quiet-rss/ui/src/styles/theme.css'
import '@quiet-rss/ui/src/components/styles/Button.css'
import '@quiet-rss/ui/src/components/styles/Card.css'
import '@quiet-rss/ui/src/components/styles/SearchBar.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
