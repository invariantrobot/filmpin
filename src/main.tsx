import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { observable } from 'mobx';

import './index.css';

import { model } from './FilmModel.tsx';
import { ReactRoot } from './ReactRoot.tsx';

// Extend Window interface for global properties
declare global {
  interface Window {
    React: unknown;
    myModel: unknown;
  }
}

// make React available globally for JSX to work
window.React = { createElement };

const reactiveModel = observable(model);

// mount the app in the browser page.
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<ReactRoot model={reactiveModel} />);
}

// Make model available globally for debugging
window.myModel = reactiveModel;
