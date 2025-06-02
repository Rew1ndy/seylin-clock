// App.tsx - процесс рендеринга
import { useEffect, useRef, useState } from 'react';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import './App.css';
import { IpcRenderer } from 'electron';

function App() {
  const [time, setTime] = useState<string>("");
  const [windowOpacity, setWindowOpacity] = useState<number>(0.5);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  const wheelHandler = (event: WheelEvent): void => {
    setWindowOpacity((prevOpacity: number) => {
      let newOpacity: number = prevOpacity + (event.deltaY > 0 ? 0.1 : -0.1);
      return Math.min(1, Math.max(0, parseFloat(newOpacity.toFixed(1))));
    });
  };

  const mouseDownHandler = (e: React.MouseEvent) => {
    switch (e.button) {
      case 0:
        if (e.altKey) {
          mainRef.current?.classList.toggle("unbound-window");
          window.ipcRenderer.send("toggle-window", mainRef.current?.classList.contains("unbound-window"));
        }
        break;
      case 1:
        console.log("Window closing");
        window.ipcRenderer.send('close-window');
        break;
      case 2:
        setStartPos({ x: e.clientX, y: e.clientY });
        break;
      default:
        break;
    }
  };

  const mouseMoveHandler = (e: React.MouseEvent) => {
    if (startPos) {
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

  const handleEventOption = (event: any) => {
    console.log(event.target.id);
    switch (event.target.id) {
      case "left-button":
        window.ipcRenderer.send("pos-event-button", { pos: 0 });
        break;
      case "mid-button":
        window.ipcRenderer.send("pos-event-button", { pos: 1 });
        break;
      case "right-button":
        window.ipcRenderer.send("pos-event-button", { pos: 2 });
        break;
      default:
        break;
    }
  }
  
  useEffect(() => {
    if (window.ipcRenderer) {
      console.log("ipcRenderer доступен в рендерере");
    } else {
      console.error("ipcRenderer НЕ доступен в рендерере");
    }

    // Сохраняем функцию-слушатель как ссылку, чтобы потом можно было её удалить
    const updateTimeListener = (_event: any, currentTime: string) => {
      setTime(currentTime);
    };

    window.ipcRenderer.on("update-time", updateTimeListener);
        
    window.addEventListener('wheel', wheelHandler);
    return () => {
      window.removeEventListener("wheel", wheelHandler);
      // Удаляем слушателя, передавая ту же функцию-ссылку
      window.ipcRenderer.off("update-time", updateTimeListener);
    };
  }, []);

  return (
    <div 
      className="clock-wrapper" 
      style={{ backgroundColor: `rgba(39, 41, 49, ${windowOpacity})`}}
      onMouseDown={mouseDownHandler}
      onMouseUp={mouseUpHandler}
      onMouseLeave={mouseUpHandler}
      onMouseMove={mouseMoveHandler}
      ref={mainRef}
    >
      <div 
        className="block-left glass-left glass unselectable"
        onClick={handleEventOption}
        id="left-button"
      ></div>
      <div 
        className="block-mid glass-mid glass unselectable"
        onClick={handleEventOption}
        id="mid-button"
      ></div>
      <div 
        className="block-right glass-right glass unselectable"
        onClick={handleEventOption}
        id="right-button"
      ></div>
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

// типы для TypeScript
declare global {
  interface Window {
    ipcRenderer: IpcRenderer;
    // {
    //   send: (channel: string, ...args: any[]) => void;
    //   on: (channel: string, listener: (event: any, ...args: any[]) => void) => void;
    //   off: (channel: string, listener?: (event: any, ...args: any[]) => void) => void;
    //   invoke: (channel: string, ...args: any[]) => Promise<any>;
    // };
  }
}