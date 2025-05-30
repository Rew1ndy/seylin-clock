import React, { useState, useEffect, useRef } from 'react';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import "./timerFunction.css";

export default function TimerFunction() {
    const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
    const [windowOpacity, setWindowOpacity] = useState<number>(0.9);
    const mainRef = useRef<HTMLDivElement>(null);

    const mouseDownHandler = (e: React.MouseEvent) => {
        switch (e.button) {
        case 0:
            if (e.altKey) {
                window.ipcRenderer.send('close-window')
            }
            break;
        case 1:
            window.ipcRenderer.send('close-window')
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

    const wheelHandler = (event: WheelEvent): void => {
        setWindowOpacity((prevOpacity: number) => {
        let newOpacity: number = prevOpacity + (event.deltaY > 0 ? 0.1 : -0.1);
        return Math.min(1, Math.max(0, parseFloat(newOpacity.toFixed(1))));
        });
    };

    useEffect(() => {
        window.addEventListener('wheel', wheelHandler);
        return () => {
            window.removeEventListener("wheel", wheelHandler);
        };
    }, []);
    
    return (
        <div 
            className="timer-wrapper"
            style={{ backgroundColor: `rgba(39, 41, 49, ${windowOpacity})`}}
            onMouseDown={mouseDownHandler}
            onMouseUp={mouseUpHandler}
            onMouseLeave={mouseUpHandler}
            onMouseMove={mouseMoveHandler}
            ref={mainRef}
        >
            <h1>Set time:</h1>
            <div className="set-time">
                <div className="hours time">
                    <button><KeyboardArrowUpIcon /></button>
                    <p>{}00</p>
                    <button><KeyboardArrowDownIcon /></button>
                </div>
                <div className="minutes time">
                    <button><KeyboardArrowUpIcon /></button>
                    <p>{}00</p>
                    <button><KeyboardArrowDownIcon /></button>
                </div>
                <div className="seconds time">
                    <button><KeyboardArrowUpIcon /></button>
                    <p>{}00</p>
                    <button><KeyboardArrowDownIcon /></button>
                </div>
            </div>
            {/* <h1>Таймер</h1>
            <p>Hello Mark</p>
            <p>Сообщение: {message}</p>
            <button onClick={() => window.ipcRenderer.send('close-window')}>
                Закрыть окно
            </button> */}
        </div>
    );
}