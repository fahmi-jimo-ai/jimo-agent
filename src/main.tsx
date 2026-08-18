import * as React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import './styles/global.css';
import { EscalationPage } from './features/escalation/EscalationPage';
import { ToastProvider } from './features/escalation/toast';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <EscalationPage />
    </ToastProvider>
  </React.StrictMode>
);
