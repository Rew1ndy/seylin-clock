import { useState, useEffect } from 'react';
import { TimeData } from '../components/TimerFunction';
import timerSound from '../assets/timer-sound.mp3';

type DataType = {
    timerData: TimeData,
    timerStatus: Function
};

export default function TimerModule(data: DataType) {
  const [time, setTime] = useState<TimeData>({ ...data.timerData });
  const sound = new Audio(timerSound);

  useEffect(() => {
    setTime({ ...data.timerData });
  }, [data.timerData]);

  useEffect(() => {
    console.log(time);
    if (time.minutes <= 0 && time.seconds <= 0) return;

    const timerInterval = setInterval(() => {
      setTime((prevTime) => {
        let newSeconds = prevTime.seconds - 1;
        let newMinutes = prevTime.minutes;
        let newHours = prevTime.hours;

        if (newSeconds < 0) {
          newSeconds = 59;
          newMinutes -= 1;
        }

        if (newMinutes < 0) {
          newMinutes = 59;
          newHours -= 1;
        }

        if (newHours <= 0 && newMinutes <= 0 && newSeconds <= 0) {
          clearInterval(timerInterval);
          data.timerStatus(0);
          sound.play().catch((error) => console.error('Error playing sound:', error));
          return { hours: 0, minutes: 0, seconds: 0 };
        }

        return { hours: newHours, minutes: newMinutes, seconds: newSeconds };
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [time, data.timerStatus]);

    return(
        <div className="timer-wrapper">
            {time.hours != 0 ? (
                <>
                    <p>{time.hours}</p> :
                    <p>{time.minutes}</p> :
                    <p>{time.seconds}</p>
                </>
            ) : (
                <>
                    <p>{time.minutes}</p> :
                    <p>{time.seconds}</p>
                </>
            )}
        </div>
    )
}