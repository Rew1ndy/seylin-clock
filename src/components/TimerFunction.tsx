import React, { useState, useEffect, useRef } from 'react';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import "./timerFunction.css";
import TimeNormalize from './TimeNormalize';

export type TimeData = {
    hours: number | string,
    minutes: number | string,
    seconds: number | string,
};

export function TimerFunction() {
    const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
    const [windowOpacity, setWindowOpacity] = useState<number>(0.9);
    const mainRef = useRef<HTMLDivElement>(null);
    const [timeData, setTimeData] = useState<TimeData>(TimeNormalize({hours: 0, minutes: 0, seconds: 0}));

    const mouseDownHandler = (e: React.MouseEvent) => {
        switch (e.button) {
        case 0:
            if (e.altKey) {
                window.ipcRenderer.send('close-window');
            }
            break;
        case 1:
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

    const calculateTime = (timeData: TimeData): TimeData => {
        let { hours, minutes, seconds } = { ...timeData };
        {
            hours = Number(hours),
            minutes = Number(minutes),
            seconds = Number(seconds)
        }

        if (Number(seconds) >= 60) {
            minutes += Math.floor(seconds / 60);
            seconds %= 60;
        } else if (seconds < 0) {
            minutes -= Math.ceil(Math.abs(seconds) / 60);
            seconds = (seconds + 60) % 60;
        }

        if (minutes >= 60) {
            hours += Math.floor(minutes / 60);
            minutes %= 60;
        } else if (minutes < 0) {
            hours -= Math.ceil(Math.abs(minutes) / 60);
            minutes = (minutes + 60) % 60;
        }

        if (hours < 0) {
            hours = 0;
        }

        return {hours, minutes, seconds};
    };

    const handleTime = (time: keyof TimeData, type: number) => {
        let newTime: TimeData = { ...timeData };
        newTime = {
            hours : Number(newTime.hours),
            minutes : Number(newTime.minutes),
            seconds : Number(newTime.seconds),
        }
        newTime[time] = Number(newTime[time]) + type;

        setTimeData(TimeNormalize(calculateTime(newTime)));
    }

    const sendTimer = () => {
        if (Number(timeData.hours) > 0 || Number(timeData.minutes) > 0 || Number(timeData.seconds) > 0) {
            window.ipcRenderer.send("timer-function-start", timeData);
            window.ipcRenderer.send("close-window");
        }
    }
    
    return (
        <div 
            className="set-timer-wrapper"
            style={{ backgroundColor: `rgba(39, 41, 49, ${windowOpacity})`}}
            onMouseDown={mouseDownHandler}
            onMouseUp={mouseUpHandler}
            onMouseLeave={mouseUpHandler}
            onMouseMove={mouseMoveHandler}
            ref={mainRef}
        >
            <div className="set-time">
                <div className="hours time">
                    <button onClick={() => handleTime('hours', 1)}><KeyboardArrowUpIcon /></button>
                    <p>{timeData.hours}</p>
                    <button onClick={() => handleTime('hours', -1)}><KeyboardArrowDownIcon /></button>
                </div>
                <p className="time-sep">:</p>
                <div className="minutes time">
                    <button onClick={() => handleTime('minutes', 1)}><KeyboardArrowUpIcon /></button>
                    <p>{timeData.minutes}</p>
                    <button onClick={() => handleTime('minutes', -1)}><KeyboardArrowDownIcon /></button>
                </div>
                <p className="time-sep">:</p>
                <div className="seconds time">
                    <button onClick={() => handleTime('seconds', 1)}><KeyboardArrowUpIcon /></button>
                    <p>{timeData.seconds}</p>
                    <button onClick={() => handleTime('seconds', -1)}><KeyboardArrowDownIcon /></button>
                </div>
            </div>
            <button className='start' onClick={sendTimer}>Start</button>
        </div>
    );
}