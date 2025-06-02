import React from 'react';
import ReactDOM from 'react-dom/client';
import TimerFunction from './components/TimerFunction';
import './index.css';

// Для отладки
console.log("Загрузка таймера...");

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TimerFunction />
  </React.StrictMode>
);

// Подписка на сообщения от основного процесса
window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log("Сообщение в таймере:", message);
});