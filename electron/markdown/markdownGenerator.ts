import { Systeminformation } from "systeminformation";
import fs from 'fs';
import { ProcessStats } from "../logger";

export default function generateMarkdownReport(stats: ProcessStats[], loggingStart: Date, loggingEnd: Date, INTERVAL_MS: number) {
  let markdown = `# Process Usage Report\n\n`;
  markdown += `**Generated**: ${new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Europe/Moscow',
  })}\n\n`;
  markdown += `This report shows statistics for user processes during the logging period.\n\n`;

  if (loggingStart && loggingEnd) {
    const durationMs = loggingEnd.getTime() - loggingStart.getTime();
    const durationSec = Math.round(durationMs / 1000);
    markdown += `**Logging Duration**: ${durationSec} seconds (from ${loggingStart.toLocaleString('en-US')} to ${loggingEnd.toLocaleString('en-US')})\n\n`;
  }

  markdown += `## Process Statistics\n\n`;
  markdown += `|       Process       | PID Count | Snapshots | Duration (sec) | Avg CPU (%) | Avg Mem (%) |\n`;
  markdown += `|---------------------|-----------|-----------|----------------|-------------|-------------|\n`;

  stats.forEach(stat => {
    const duration = (stat.snapshots * INTERVAL_MS) / 1000; // Duration in seconds
    const avgCpu = stat.snapshots > 0 ? (stat.totalCpu / stat.snapshots).toFixed(2) : '0.00';
    const avgMem = stat.snapshots > 0 ? (stat.totalMem / stat.snapshots).toFixed(2) : '0.00';
    markdown += `| ${stat.name.padEnd(24)} | ${stat.pids.size.toString().padEnd(9)} | ${stat.snapshots.toString().padEnd(9)} | ${duration.toFixed(0).padEnd(13)} | ${avgCpu.padStart(6)} | ${avgMem.padStart(6)} |\n`;
  });

  markdown += `\n## Notes\n`;
  markdown += `- **Snapshots**: Number of snapshots in which the process was detected.\n`;
  markdown += `- **Duration**: Total active time of the process (snapshots × interval ${INTERVAL_MS / 1000} sec).\n`;
  markdown += `- **Avg CPU/Mem**: Average CPU and memory usage across all snapshots.\n`;

  // Save to file
  fs.writeFileSync('Process_Usage_Report.md', markdown);
  console.log('Report saved to Process_Usage_Report.md');
}