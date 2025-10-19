import { useState, useEffect, useRef, useCallback } from 'react';

// Extend Window interface for browser compatibility
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface UseSpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

export const useSpeechRecognition = (options: UseSpeechRecognitionOptions = {}) => {
  const {
    continuous = true,
    interimResults = true,
    lang = 'en-US',
    onResult,
    onError,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      // Configure recognition
      recognitionRef.current.continuous = continuous;
      recognitionRef.current.interimResults = interimResults;
      recognitionRef.current.lang = lang;
      recognitionRef.current.maxAlternatives = 1;

      // Handle results
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece + ' ';
          } else {
            interimText += transcriptPiece;
          }
        }

        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
          setInterimTranscript('');
          onResult?.(finalTranscript.trim(), true);
        } else if (interimText) {
          setInterimTranscript(interimText);
          onResult?.(interimText, false);
        }
      };

      // Handle errors
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        
        // Ignore aborted errors - these are expected when we manually stop
        if (event.error === 'aborted') {
          setIsListening(false);
          return;
        }
        
        let errorMessage = 'Speech recognition error';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please speak louder or closer to the microphone.';
            break;
          case 'audio-capture':
            errorMessage = 'No microphone found. Please check your microphone connection.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow microphone access in your browser settings.';
            break;
          case 'network':
            errorMessage = 'Network error. Speech recognition requires an internet connection.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech recognition service is not available. Please try again.';
            break;
          default:
            // Don't show error for minor issues
            console.warn('Speech recognition issue:', event.error);
            setIsListening(false);
            return;
        }
        
        setError(errorMessage);
        setIsListening(false);
        onError?.(errorMessage);
      };

      // Handle end of recognition
      recognitionRef.current.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      // Handle start
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError(null);
      };
    } else {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [continuous, interimResults, lang, onResult, onError]);

  // Start listening
  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    if (!isListening && recognitionRef.current) {
      try {
        // Request microphone permission first
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        setTranscript('');
        setInterimTranscript('');
        setError(null);
        recognitionRef.current.start();
      } catch (err: any) {
        console.error('Error starting recognition:', err);
        
        if (err.name === 'NotAllowedError') {
          setError('Microphone access denied. Please allow microphone access in your browser settings.');
        } else if (err.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone and try again.');
        } else {
          setError('Failed to start speech recognition. Please check your microphone.');
        }
        
        onError?.(err.message);
      }
    }
  }, [isSupported, isListening, onError]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  // Abort (immediate stop without processing final results)
  const abortListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      setIsListening(false);
      setInterimTranscript('');
    }
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    abortListening,
  };
};

