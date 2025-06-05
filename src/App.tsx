// App.tsx - процесс рендеринга
import { useEffect, useRef, useState } from 'react';
import { IpcRenderer, IpcRendererEvent } from 'electron';
import { TimeData } from './components/TimerFunction';
import TimerModule from './modules/TimerModule';
import './App.css';

function App() {
  const [timerData, setTimerData] = useState<TimeData>({ hours: 0, minutes: 0, seconds: 0 });
  const [clockType, setClockType] = useState<number>(0); // 0: clock, 1: timer;
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
    // console.log("Main.Window.Updated")
    // window.ipcRenderer.on("timer-function-start", (_event, message) => {
    //   console.log(message);
    // })

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

  useEffect(() => {
    window.ipcRenderer.on('timer-function-start', (_event, timeData) => timerFunctionOperation(_event, timeData));

    return () => {
        // window.ipcRenderer.removeAllListeners('timer-function-start');
        window.ipcRenderer.removeListener('timer-function-start', timerFunctionOperation);
    };
  }, []);

  const timerFunctionOperation = (_event: IpcRendererEvent, timeData: TimeData) => {
    if (timeData) {
        console.log("Timer recived!", timeData);
        setTimerData(timeData);
        setClockType(1);
      }
  }

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

    {clockType == 0 && (
       <div className="timeModule">
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
      </div>
    )}

    {clockType == 1 && (
      <TimerModule />
    )}
    
    </div>
  );
}

export default App;

declare global {
  interface Window {
    ipcRenderer: IpcRenderer;
  }
}