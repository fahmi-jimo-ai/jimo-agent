import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/globals.css';
import './styles/global.css';
import { EscalationPage } from './features/escalation/EscalationPage';
import { KnowledgePage } from './features/knowledge/KnowledgePage';
import { ToastProvider } from './components/app/toast';

// ToastProvider sits OUTSIDE the router so a toast raised just before a nav
// (e.g. "Escalation enabled") is not unmounted by the route change.
// The widget is deliberately not a route — it is its own Vite entry
// (widget.html) because it opens in a separate tab. See openWidget.ts.
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<EscalationPage />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  </React.StrictMode>
);
