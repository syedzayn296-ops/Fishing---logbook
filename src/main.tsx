import '@vitejs/plugin-react/preamble';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Auto-register service worker for offline tide & weather caching
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('TideCast SA: New update available.');
  },
  onOfflineReady() {
    console.log('TideCast SA: Offline mode ready with full tide charts & cached weather.');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
