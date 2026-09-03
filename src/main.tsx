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
import { GeneralPage } from './features/settings/general/GeneralPage';
import { AccountPage } from './features/settings/account/AccountPage';
import { NotificationsPage } from './features/settings/notifications/NotificationsPage';
import { TeamPage } from './features/settings/team/TeamPage';
import { RateLimitPage } from './features/settings/rate-limit/RateLimitPage';
import { InstallPage } from './features/settings/install/InstallPage';
import { IntegrationsPage } from './features/settings/integrations/IntegrationsPage';
import { WebhooksPage } from './features/settings/integrations/WebhooksPage';
import { EnvironmentsPage } from './features/settings/environments/EnvironmentsPage';
import { TroubleshootPage } from './features/settings/troubleshoot/TroubleshootPage';
import { ThemesPage } from './features/settings/themes/ThemesPage';
import { PlanPage } from './features/settings/plan/PlanPage';
import { BillingPage } from './features/settings/billing/BillingPage';
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
          {/* /settings is the Jimo PLATFORM's settings, a second product surface
              inside the same shell — not the agent's own configuration, which
              stays in Escalation's Configure modal. Each sidebar item is a real
              route rather than internal tab state: a sidebar is the same nav
              affordance as Escalation/Knowledge/Skills, and the Help Center
              links to these paths as addresses. Paths mirror the docs' own URLs.
              `Events` has no route on purpose — see settingsNav.tsx. */}
          <Route path="/settings" element={<Navigate to="/settings/general" replace />} />
          <Route path="/settings/general" element={<GeneralPage />} />
          <Route path="/settings/themes" element={<ThemesPage />} />
          <Route path="/settings/installation" element={<InstallPage />} />
          <Route path="/settings/rate-limit" element={<RateLimitPage />} />
          <Route path="/settings/team" element={<TeamPage />} />
          <Route path="/settings/integrations" element={<IntegrationsPage />} />
          <Route path="/settings/integrations/webhooks" element={<WebhooksPage />} />
          <Route path="/settings/environments" element={<EnvironmentsPage />} />
          <Route path="/settings/troubleshoot" element={<TroubleshootPage />} />
          <Route path="/settings/plan" element={<PlanPage />} />
          <Route path="/settings/billing" element={<BillingPage />} />
          <Route path="/settings/account" element={<AccountPage />} />
          <Route path="/settings/notifications" element={<NotificationsPage />} />
          <Route path="*" element={<Navigate to="/escalation" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  </React.StrictMode>
);
