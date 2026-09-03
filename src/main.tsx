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
import { ExperienceIndexPage } from './features/experiences/ExperienceIndexPage';
import { ExperienceDetailPage } from './features/experiences/ExperienceDetailPage';
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

          {/* Experiences. Twelve literal routes rather than a `.map` over
              EXPERIENCE_TYPES or a single `/experiences/:type`: `/tours` should
              be greppable, and a `:type` param would make every unknown segment
              a valid Experiences page, pushing a runtime guard into the
              component where this list makes the six types a compile-time fact.

              They hang off the PRIMARY rail, which already ships all six as
              peers of the Agent — see navConfig's PRIMARY_NAV_ROUTES. */}
          <Route path="/tours" element={<ExperienceIndexPage type="tour" />} />
          <Route path="/tours/:id" element={<ExperienceDetailPage type="tour" />} />
          <Route path="/surveys" element={<ExperienceIndexPage type="survey" />} />
          <Route path="/surveys/:id" element={<ExperienceDetailPage type="survey" />} />
          <Route path="/banners" element={<ExperienceIndexPage type="banner" />} />
          <Route path="/banners/:id" element={<ExperienceDetailPage type="banner" />} />
          <Route path="/hints" element={<ExperienceIndexPage type="hint" />} />
          <Route path="/hints/:id" element={<ExperienceDetailPage type="hint" />} />
          <Route path="/checklists" element={<ExperienceIndexPage type="checklist" />} />
          <Route path="/checklists/:id" element={<ExperienceDetailPage type="checklist" />} />
          <Route
            path="/resource-centers"
            element={<ExperienceIndexPage type="resource-center" />}
          />
          <Route
            path="/resource-centers/:id"
            element={<ExperienceDetailPage type="resource-center" />}
          />

          <Route path="*" element={<Navigate to="/escalation" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  </React.StrictMode>
);
