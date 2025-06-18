import { Systeminformation } from 'systeminformation';

export default function removeDuplicates(processInfo: Systeminformation.ProcessesData) {
  const processMap = new Map<string, { name: string; pid: number; cpu: number; mem: number }>();

  processInfo.list.forEach(proc => {
    if (proc.name && proc.pid > 0) {
      const existing = processMap.get(proc.name);

      if (!existing || (proc.cpu > existing.cpu || proc.mem > existing.mem)) {
        processMap.set(proc.name, {
          name: proc.name,
          pid: proc.pid,
          cpu: proc.cpu || 0,
          mem: proc.mem || 0,
        });
      }
    }
  });

  return Array.from(processMap.values()).sort((a, b) => b.cpu - a.cpu);
}