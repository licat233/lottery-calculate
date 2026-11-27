/*
 * @Author: licat
 * @Date: 2022-12-15 15:22:22
 * @LastEditors: licat
 * @LastEditTime: 2026-11-27
 * @Description: lottery calculate entry
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Disable the browser context menu.
document.oncontextmenu = function () {
  return false;
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
