import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

//屏蔽鼠标右键
document.oncontextmenu = function () {
  return false;
};

function UI() {
  if (window.location.hash === '#development' || window.location.hash === '#dev') {
    return <App />
  }
  if (window.location.host !== 'licat233.github.io') {
    return <></>
  }
  return <App />
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <UI />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
