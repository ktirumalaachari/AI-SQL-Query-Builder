// Web Speech API wrapper for speech-to-text voice input

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

export class VoiceInputManager {
  private recognition: any = null;
  public isSupported = false;

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.isSupported = true;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }
  }

  public startListening(
    onResult: (result: SpeechRecognitionResult) => void,
    onEnd: () => void,
    onError: (err: string) => void
  ) {
    if (!this.isSupported || !this.recognition) {
      onError('Speech recognition is not supported in this browser.');
      return;
    }

    this.recognition.onresult = (event: any) => {
      let transcript = '';
      let isFinal = false;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          isFinal = true;
        }
      }

      onResult({ transcript, isFinal });
    };

    this.recognition.onerror = (event: any) => {
      onError(event.error || 'Speech recognition error');
    };

    this.recognition.onend = () => {
      onEnd();
    };

    try {
      this.recognition.start();
    } catch (e: any) {
      onError(e.message || 'Could not start microphone');
    }
  }

  public stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
  }
}
