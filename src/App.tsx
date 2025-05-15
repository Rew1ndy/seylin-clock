// App.tsx - процесс рендеринга
import { useEffect, useState } from 'react';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import './App.css';

function App() {
  const [time, setTime] = useState<string>("");
  const [windowOpacity, setWindowOpacity] = useState<number>(0.5);

  const wheelHandler = (event: WheelEvent): void => {
    setWindowOpacity((prevOpacity: number) => {
      let newOpacity: number = prevOpacity + (event.deltaY > 0 ? 0.1 : -0.1);
      return Math.min(1, Math.max(0, parseFloat(newOpacity.toFixed(1))));
    });
  };
  
  useEffect(() => {
    // Отладка: проверяем, доступен ли ipcRenderer
    if (window.ipcRenderer) {
      console.log("ipcRenderer доступен в рендерере");
    } else {
      console.error("ipcRenderer НЕ доступен в рендерере");
    }

    // Сохраняем функцию-слушатель как ссылку, чтобы потом можно было её удалить
    const updateTimeListener = (_event: any, currentTime: string) => {
      console.log("Получено обновление времени:", currentTime);
      setTime(currentTime);
    };

    // Слушаем событие обновления времени
    window.ipcRenderer.on("update-time", updateTimeListener);
    
    // Отправляем тестовое сообщение при запуске
    console.log("Отправка тестового сообщения");
    window.ipcRenderer.send("test-message", "Hello from renderer!");
    
    window.addEventListener('wheel', wheelHandler);
    return () => {
      window.removeEventListener("wheel", wheelHandler);
      // Удаляем слушателя, передавая ту же функцию-ссылку
      window.ipcRenderer.off("update-time", updateTimeListener);
    };
  }, []);

  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);

  const mouseDownHandler = (e: React.MouseEvent) => {
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const mouseMoveHandler = (e: React.MouseEvent) => {
    if (startPos) {
      // Отправляем событие перемещения в основной процесс
      window.ipcRenderer.send("move-window", {
        deltaX: e.movementX, 
        deltaY: e.movementY
      });      
      setStartPos({ x: e.clientX, y: e.clientY });
    }
  };

  const mouseUpHandler = () => {
    setStartPos(null);
  };

  return (
    <div 
      className="clock-wrapper" 
      style={{ backgroundColor: `rgba(39, 41, 49, ${windowOpacity})`}}
      onMouseDown={mouseDownHandler}
      onMouseUp={mouseUpHandler}
      onMouseLeave={mouseUpHandler}
      onMouseMove={mouseMoveHandler}  
    >
      <p className="time-stamp unselectable">{time}</p>
      {/* <p 
        className="move-icon"
        onMouseDown={mouseDownHandler}
        onMouseUp={mouseUpHandler}
        onMouseLeave={mouseUpHandler}
        onMouseMove={mouseMoveHandler}
      ><DragIndicatorIcon /></p> */}
    </div>
  );
}

export default App;

// Определяем типы для TypeScript
declare global {
  interface Window {
    ipcRenderer: {
      send: (channel: string, ...args: any[]) => void;
      on: (channel: string, listener: (event: any, ...args: any[]) => void) => void;
      off: (channel: string, listener?: (event: any, ...args: any[]) => void) => void;
      invoke: (channel: string, ...args: any[]) => Promise<any>;
    };
  }
}