// main/logger.ts
import si, { Systeminformation } from 'systeminformation';
import win32Filter from './sys-filters/win32Filter';
import fs from 'fs';
import generateMarkdownReport from './markdown/markdownGenerator';
import removeDuplicates from './sys-filters/removeDuplicates';

// Type for process
type Process = {
  name: string;
  pid: number;
  cpu: number;
  mem: number;
};

// Type for log entry
type LogEntry = {
  apps: Process[];
};

// Type for process statistics
export type ProcessStats = {
  name: string;
  pids: Set<number>; // Set of PIDs for the process
  snapshots: number; // Number of snapshots (presence)
  totalCpu: number; // Total CPU usage
  totalMem: number; // Total memory usage
};

// Initialization
let interval: NodeJS.Timeout | null = null;
const log: LogEntry[] = [];
const processStats = new Map<string, ProcessStats>(); // For tracking duration and presence
const INTERVAL_MS = 1000; // Interval in milliseconds
let loggingStart: Date = new Date();
let loggingEnd: Date = loggingStart;

// START LOGGING DATA
export async function startLogging(intervalMs: number = INTERVAL_MS) {
  // Check if logging is already running
  if (interval) {
    console.warn('Logging is already running');
    return;
  }
  loggingStart = new Date();

  const collectData = async () => {
    try {
      const processInfo = await si.processes();

      if (!processInfo.list || !Array.isArray(processInfo.list)) {
        throw new Error('Invalid data type from si.processes()');
      }

      let filteredProcesses = removeDuplicates(processInfo);

      switch (process.platform) {
        case 'win32':
          filteredProcesses = win32Filter(filteredProcesses);
          break;
        case 'darwin':
          console.warn('Filtering for macOS is not implemented');
          break;
        case 'linux':
          console.warn('Filtering for Linux is not implemented');
          break;
        default:
          throw new Error(`Unsupported platform: ${process.platform}`);
      }

      const entry: LogEntry = { apps: filteredProcesses };
      log.push(entry);

      filteredProcesses.forEach(proc => {
        const stats = processStats.get(proc.name) || {
          name: proc.name,
          pids: new Set(),
          snapshots: 0,
          totalCpu: 0,
          totalMem: 0,
        };
        stats.pids.add(proc.pid);
        stats.snapshots += 1;
        stats.totalCpu += proc.cpu;
        stats.totalMem += proc.mem;
        processStats.set(proc.name, stats);
      });

      // Limit log size to 1000 entries
      if (log.length > 1000) {
        log.shift();
      }

      // Debug output
      console.log('Processes:', JSON.stringify(filteredProcesses, null, 2));
      console.log('Statistics:', JSON.stringify([...processStats.values()], null, 2));
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
    }
  };

  // Run immediately and then at intervals
  await collectData();
  interval = setInterval(collectData, intervalMs);
}

export function stopLogging(): ProcessStats[] {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }

  loggingEnd = new Date();

  // Generate report only if there is data
  if (processStats.size > 0) {
    generateMarkdownReport([...processStats.values()], loggingStart, loggingEnd, INTERVAL_MS);
  } else {
    console.warn('No process data to generate report');
  }

  // Clear log and stats
  log.length = 0;
  processStats.clear();

  return [...processStats.values()];
}

export function getLog(): LogEntry[] {
  return log;
}

