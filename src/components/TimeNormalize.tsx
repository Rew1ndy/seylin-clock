import { TimeData } from "./TimerFunction";

export default function TimeNormalize(time: TimeData): TimeData {
    const normalizedTime: TimeData = { ...time };
    (Object.keys(time) as (keyof TimeData)[]).forEach(key => {
        normalizedTime[key] = String(time[key]).length === 1 ? `0${time[key]}` : `${time[key]}`;
    });
    return normalizedTime;
}