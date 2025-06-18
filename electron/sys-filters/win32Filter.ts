import { Systeminformation } from "systeminformation";

const SYSTEM_PROCESSES_REGEX = new RegExp(
  '^(system|idle|registry|csrss|winlogon|services|lsass|svchost|taskhost|dwm|' +
  'rundll32|conhost|runtimebroker|lenovo|ntoskrnl|kernel|kthreadd|migration|' +
  'rcu_*|watchdog|amd|nvidia|smss|nvdisplay|startmenu|hotkey|experiencehost|' +
  'webview|esbuild|lockapp|rtkaud|shellhost|wininit|sihost|winapp|dllhost|' +
  'sppsvc|fmaudio|trustedinstaller|fmservice|audiodg|ctfmon|webhelper|atieclxx|' +
  'apsrv|sdx|wmiprv|searchhost|background_*|fnhotkey_*|.*host)',
  'i'
);

const IS_EXE = '.exe';

export default function win32Filter(processes: Systeminformation.ProcessesData): Systeminformation.ProcessesData {
  return processes.filter(process => {
    if (!process.name.endsWith(IS_EXE)) return false;
    
    const nameLower = process.name.slice(0, -4); // Убираем .exe
    return !SYSTEM_PROCESSES_REGEX.test(nameLower);
  }).slice(0, 10);
}