import * as React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import './styles/global.css';
import './styles/widget.css';
import './styles/widget-media.css';
import './styles/widget-host.css';
import { WidgetPage } from './features/widget/WidgetPage';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WidgetPage />
  </React.StrictMode>
);
