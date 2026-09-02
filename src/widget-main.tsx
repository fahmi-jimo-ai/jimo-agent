import * as React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import './styles/global.css';
import './styles/widget.css';
// After widget.css on purpose — it styles slots that stylesheet has no rules
// for, and is deletable in one line if these proposals do not land. See its
// own header.
import './styles/widget-proposals.css';
import './styles/widget-host.css';
import { WidgetPage } from './features/widget/WidgetPage';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WidgetPage />
  </React.StrictMode>
);
