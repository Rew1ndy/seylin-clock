import { useState, useEffect, useRef } from 'react';
import { TimeData } from '../components/TimerFunction';
import timerSound from '../assets/timer-sound.mp3';
import "./timermodule.css";
import TimeNormalize from '../components/TimeNormalize';

type DataType = {
  timerData: TimeData;
  timerStatus: Function;
};

export default function TimerModule(data: DataType) {
  const [time, setTime] = useState<TimeData>({ ...data.timerData });
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null); // Для хранения интервала
  const sound = new Audio(timerSound);

  useEffect(() => {
    setTime({ ...data.timerData });
  }, [data.timerData]);

  useEffect(() => {
    if (Number(time.minutes) <= 0 && Number(time.seconds) <= 0 && Number(time.hours) <= 0) {
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setTime((prevTime) => {
        let newSeconds = Number(prevTime.seconds) - 1;
        let newMinutes = Number(prevTime.minutes);
        let newHours = Number(prevTime.hours);

        if (newSeconds < 0) {
          newSeconds = 59;
          newMinutes -= 1;
        }
        if (newMinutes < 0) {
          newMinutes = 59;
          newHours -= 1;
        }
        if (newHours <= 0 && newMinutes <= 0 && newSeconds <= 0) {
          endTimer();
          return { hours: 0, minutes: 0, seconds: 0 };
        }

        return TimeNormalize({ hours: newHours, minutes: newMinutes, seconds: newSeconds });
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [time, data.timerStatus]);

  // Функция завершения таймера
  const endTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setTime({ hours: 0, minutes: 0, seconds: 0 });
    data.timerStatus(0);
    sound.play().catch((error) => console.error('Error playing sound:', error));
  };

  // Обработчик кнопки
  const handleTimerEnd = () => {
    endTimer();
  };

  return (
    <div className="timer-wrapper set-timer-wrapper">
      <div className="timer-time">
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
            <p></p>
            <p>{time.minutes}</p>
            <p>:</p>
            <p>{time.seconds}</p>
            <p></p>
          </>
        )}
      </div>
      <button className="start" onClick={handleTimerEnd}>
        End
      </button>
    </div>
  );
}