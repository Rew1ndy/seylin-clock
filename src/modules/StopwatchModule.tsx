import { useRef, useState, useEffect } from "react"
import { TimeData } from "../components/TimerFunction";
import TimeNormalize from "../components/TimeNormalize";
import "./stopwatchmodule.css";

type ExtendedTimeData = TimeData & {
    milliseconds: number | string;
};

export default function StopwatchModule(data) {
    const [time, updateTime] = useState<ExtendedTimeData>({ hours: 0, minutes: 59, seconds: 50, milliseconds: 0 });
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [isPaused, setIsPaused] = useState(0);

    useEffect(() => {
        console.log(time);
        if (Number(time.hours) <= 0) {
            timerIntervalRef.current = setInterval(() => {
                updateTime((prevTime) => {
                    let newMilliseconds = Number(prevTime.milliseconds) + 1;
                    let newSeconds = Number(prevTime.seconds);
                    let newMinutes = Number(prevTime.minutes);
                    let newHours = Number(prevTime.hours);

                    if (newMilliseconds >= 100) {
                        newMilliseconds = 0;
                        newSeconds += 1;
                    }

                    if (newSeconds >= 60) {
                        newSeconds = 0;
                        newMinutes += 1;
                    }

                    if (newMinutes >= 60) {
                        newMinutes = 0;
                        newHours += 1;
                    }

                    let normalized = TimeNormalize({ hours: newHours, minutes: newMinutes, seconds: newSeconds });
                    return {...normalized, milliseconds: newMilliseconds};
                })
            }, 10);
        } else {
            timerIntervalRef.current = setInterval(() => {
                updateTime((prevTime) => {
                    // let newMilliseconds = Number(prevTime.milliseconds);
                    let newSeconds = Number(prevTime.seconds) + 1;
                    let newMinutes = Number(prevTime.minutes);
                    let newHours = Number(prevTime.hours);

                    if (newSeconds >= 60) {
                        newSeconds = 0;
                        newMinutes += 1;
                    }

                    if (newMinutes >= 60) {
                        newMinutes = 0;
                        newHours += 1;
                    }

                    let normalized = TimeNormalize({ hours: newHours, minutes: newMinutes, seconds: newSeconds });
                    return {...normalized, milliseconds: prevTime.milliseconds};
                })
            }, 1000);
        }


        return () => {
            if(timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [time]);

    const handlePauseTime = () => {
        if (timerIntervalRef.current && isPaused === 0) {
            setIsPaused(1);
            clearInterval(timerIntervalRef.current);
            return
        } 

        if (timerIntervalRef.current && isPaused === 1) {
            updateTime((prevTime) => {
                return ({...prevTime, milliseconds: Number(prevTime.milliseconds) + 1});
            })
            setIsPaused(0);
        }
    }

    const handleEndTime = () => {
        if(timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            data.clockType(0);
        }
    }

    return (
        <div className="stopwatch-wrapper set-timer-wrapper">
            <div className="stopwatch-time">
                {time.hours != 0 ? (
                    <>
                        <p>{time.hours}</p>
                        <p>:</p>
                        <p>{time.minutes}</p>
                        <p>:</p>
                        <p>{time.seconds}</p>
                    </>
                    ) : (
                    <>
                        <p>{time.minutes}</p>
                        <p>:</p>
                        <p>{time.seconds}</p>
                        <p>:</p>
                        <p>{time.milliseconds}</p>
                    </>
                )}
            </div>
            <div className="stopwatch-buttons">
                {/* <button className="start" onClick={handlePauseTime}>Pause</button> 0: pause, 1: start */}
                { isPaused === 0 ? 
                    ( <button className="start" onClick={handlePauseTime}>Pause</button> ) 
                    :
                    ( <button className="start" onClick={handlePauseTime}>Continue</button> )
                }
                {/* <button className="start">Stop</button> 0: end, 1: clear */}
                {
                    isPaused === 0 ?
                    ( <button className="start" onClick={handleEndTime}>Stop</button> )
                    :
                    ( <button className="start">Log</button> )
                }
            </div>
        </div>
    )
} 