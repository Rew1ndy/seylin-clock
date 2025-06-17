// main/logger.ts
import si from "systeminformation";
import win32Filter from "../src/components/logging/sys-filters/win32Filter";


let interval: NodeJS.Timeout | null = null;
const log: { time: string; app: string }[] = [];

export async function startLogging() {
  try {
    const processInfo = await si.processes();
    let newProc = removeDuplicates(processInfo);
    // console.log(newProc);
    win32Filter(newProc);

    // console.log(newProc);
    console.log(`Вы используете: ${process.platform}`);
  } catch (error) {
    console.error('Ошибка:', error);
  }

}

export function stopLogging() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}

export function getLog() {
  return log;
}


function removeDuplicates(processInfo: any) {
  const processMap = new Map<string, { name: string; pid: number; cpu: number; memory: number }>();

    processInfo.list.forEach(proc => {
      if (proc.name && proc.pid > 0) {
        const existing = processMap.get(proc.name);

        if (!existing || (proc.cpu > existing.cpu || proc.mem > existing.mem)) {
          processMap.set(proc.name, {
            name: proc.name,
            pid: proc.pid,
            cpu: proc.cpu || 0,
            memory: proc.mem || 0
          });
        }
      }
    });

    return Array.from(processMap.values()).sort((a, b) => b.cpu - a.cpu);
}