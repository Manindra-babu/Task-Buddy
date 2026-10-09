import { spawn, ChildProcess } from 'child_process';

export interface VoiceOptions {
  volume?: number; // 0 to 1
  rate?: number; // 0.5 to 1.5
  voiceEnabled?: boolean;
}

export class WindowsVoiceService {
  private currentProcess: ChildProcess | null = null;

  /**
   * Speak reminder text using offline Windows System.Speech.Synthesis
   */
  async speak(text: string, options: VoiceOptions = {}): Promise<boolean> {
    if (options.voiceEnabled === false) {
      return false;
    }

    // Stop any speech currently playing
    this.stop();

    const cleanText = text
      .replace(/["`$\\]/g, '') // sanitize for command line safety
      .replace(/\r?\n|\r/g, ' ')
      .trim();

    if (!cleanText) return false;

    const rate = Math.round(((options.rate ?? 1.0) - 1.0) * 5); // SAPI rate -10 to +10, default 0
    const volume = Math.round((options.volume ?? 0.9) * 100); // 0 to 100

    return new Promise((resolve) => {
      // Offline Windows PowerShell SAPI script
      const psScript = `
        Add-Type -AssemblyName System.Speech;
        $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;
        $speak.Volume = ${volume};
        $speak.Rate = ${rate};
        $speak.Speak("${cleanText}");
      `;

      try {
        const proc = spawn('powershell.exe', [
          '-NoProfile',
          '-NonInteractive',
          '-ExecutionPolicy',
          'Bypass',
          '-Command',
          psScript,
        ]);

        this.currentProcess = proc;

        proc.on('close', (code) => {
          if (this.currentProcess === proc) {
            this.currentProcess = null;
          }
          resolve(code === 0);
        });

        proc.on('error', (err) => {
          console.warn('Windows SAPI speech synthesizer warning/error:', err.message);
          this.currentProcess = null;
          resolve(false);
        });
      } catch (err) {
        console.warn('Failed to spawn Windows speech process:', err);
        resolve(false);
      }
    });
  }

  /**
   * Stop ongoing speech immediately
   */
  stop(): void {
    if (this.currentProcess) {
      try {
        this.currentProcess.kill('SIGKILL');
      } catch {
        // ignore
      }
      this.currentProcess = null;
    }
  }
}
