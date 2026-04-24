import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { GameSocketBridge } from './components/GameSocketBridge';
import { router } from './routes/router';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <GameSocketBridge />
    <RouterProvider router={router} />
  </React.StrictMode>,
);