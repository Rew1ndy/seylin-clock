// src/main.tsx (обновленная версия)
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import TimerFunction from './components/TimerFunction'
import './index.css'

// Получаем параметр из URL или хэша
const getWindowType = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const paramType = urlParams.get('window');
  
  // Если нет в параметрах, ищем в хэше (для production build)
  if (!paramType && window.location.hash) {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    return hashParams.get('window') || 'main';
  }
  
  return paramType || 'main';
};

const windowType = getWindowType();

// Выбираем компонент для рендеринга в зависимости от параметра
const ComponentToRender = () => {
  switch (windowType) {
    case 'timer':
      return <TimerFunction />;
    case 'main':
    default:
      return <App />;
  }
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ComponentToRender />
  </React.StrictMode>,
)

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message)
})