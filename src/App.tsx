// App.tsx - процесс рендеринга
import { useEffect, useRef, useState } from 'react';
import { IpcRenderer, IpcRendererEvent } from 'electron';
import { TimeData } from './components/TimerFunction';
import TimerModule from './modules/TimerModule';
import ClockModule from './modules/ClockModule';
import './App.css';
import StopwatchModule from './modules/StopwatchModule';

export default function App() {
  const [timerData, setTimerData] = useState<TimeData>({ hours: 0, minutes: 0, seconds: 0 });
  const [clockType, setClockType] = useState<number>(0); // 0: clock, 1: timer; 2: stopwatch;
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
        setClockType(2);
        /// Stopwatch page, not component;
        // window.ipcRenderer.send("pos-event-button", { pos: 2 });
        break;
      default:
        break;
    }
  }

  const updateTimeListener = (_event: IpcRendererEvent, currentTime: string) => {
    setTime(currentTime);
  };

  const timerFunctionOperation = (_event: IpcRendererEvent, timeData: TimeData) => {
    if (timeData) {
        console.log("Timer recived!", timeData);
        setTimerData(timeData);
        setClockType(1);
      }
  }
  
  useEffect(() => {
    if (window.ipcRenderer) {
      console.log("ipcRenderer loaded!");
    } else {
      console.error("ipcRenderer Error (Not found!)");
    }
    
    window.ipcRenderer.on('timer-function-start', timerFunctionOperation);
    window.ipcRenderer.on("update-time", updateTimeListener);
        
    window.addEventListener('wheel', wheelHandler);
    return () => {
      window.removeEventListener("wheel", wheelHandler);
      window.ipcRenderer.off("update-time", updateTimeListener);
      window.ipcRenderer.off('timer-function-start', timerFunctionOperation);
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

    {clockType == 0 && (
      <ClockModule time={time} handleEventOption={handleEventOption} />
    )}

    {clockType == 1 && (
      <TimerModule timerData={timerData} timerStatus={setClockType} />
    )}

    {clockType == 2 && (
      <StopwatchModule clockType={setClockType} />
    )}
    
    </div>
  );
}

declare global {
  interface Window {
    ipcRenderer: IpcRenderer;
  }
}