import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/globals.css';
import './styles/global.css';
import { EscalationPage } from './features/escalation/EscalationPage';
import { KnowledgePage } from './features/knowledge/KnowledgePage';
import { StatisticsPage } from './features/statistics/StatisticsPage';
import { ConversationsPage } from './features/conversations/ConversationsPage';
import { SkillsPage } from './features/skills/SkillsPage';
import { ToastProvider } from './components/app/toast';
import { installJimo } from './lib/jimo';
import { installIntercom } from './lib/intercom';

// Jimo and Intercom, both on the dashboard only — see src/lib/jimo.ts for why
// neither is in widget.html and why they run here rather than in a useEffect.
installJimo();
installIntercom();

// ToastProvider sits OUTSIDE the router so a toast raised just before a nav
// (e.g. "Escalation enabled") is not unmounted by the route change.
// The widget is deliberately not a route — it is its own Vite entry
// (widget.html) because it opens in a separate tab. See openWidget.ts.
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Every page has its own path — the index is a redirect, not a
              page, so no page is privileged by being "the" root. */}
          <Route path="/" element={<Navigate to="/escalation" replace />} />
          <Route path="/escalation" element={<EscalationPage />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
          <Route path="/skills" element={<SkillsPage />} />
          {/* Figma draws Statistics and Conversations as two tabs of one
              "Analyze" page. They are two routes here, because the sidebar has
              always listed them as two peer items — see StatisticsPage. */}
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/conversations" element={<ConversationsPage />} />
          <Route path="*" element={<Navigate to="/escalation" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  </React.StrictMode>
);
