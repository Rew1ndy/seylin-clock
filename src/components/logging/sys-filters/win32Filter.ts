const SYSTEM_PROCESSES = [
  'system', 'idle', 'registry', 'csrss', 'winlogon', 'services', 'lsass',
  'svchost', 'taskhost', 'dwm', 'rundll32', 'conhost', 'runtimebroker', 'lenovo',
  'ntoskrnl', 'kernel', 'kthreadd', 'migration', 'rcu_', 'watchdog', 'amd', 'nvidia', 'smss',
  'nvdisplay', 'startmenu', 'hotkey', 'experiencehost', 'webview', 'esbuild', 'lockapp', 'rtkaud',
  'shellhost', 'wininit', 'sihost', 'winapp', 'dllhost', 'sppsvc', 'fmaudio', 'trustedinstaller',
  'fmservice', 'audiodg', 'ctfmon', 'webhelper', 'atieclxx', 'apsrv', 'sdx', 'wmiprv', 'searchhost'
];

const IS_EXE = ".exe";

export default function win32Filter(processes: Object) {
    processes = processes.filter(process => {
        return process.name.includes(IS_EXE) && 
            !SYSTEM_PROCESSES.some(value => process.name.toLowerCase().includes(value))
            // !SYSTEM_PROCESSES.some(value => (process.name.toLowerCase()).includes(value) ? true : false)
    });

    // processes = processes.slice(0, 10); // Добавить в конце, перед этим нужно настроить выборку.
    console.log(processes);

    return processes
}