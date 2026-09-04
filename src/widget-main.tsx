import * as React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import './styles/global.css';
import './styles/widget.css';
// After widget.css, always: it is a 1:1 port and this sheet is what this repo
// adds on top of it.
import './styles/widget-citations.css';
import './styles/widget-host.css';
import { WidgetPage } from './features/widget/WidgetPage';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WidgetPage />
  </React.StrictMode>
);
