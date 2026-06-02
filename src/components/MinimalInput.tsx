import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Mic, MicOff } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../lib/i18n';

interface MinimalInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  language: Language;
}

export default function MinimalInput({ onSendMessage, isLoading, language }: MinimalInputProps) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'ja' ? 'ja-JP' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (recognitionRef.current) {
        setIsListening(true);
        recognitionRef.current.start();
      } else {
        alert(language === 'en' ? 'Speech recognition is not supported in this browser.' : 'このブラウザは音声認識に対応していません。');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-mystic-gold/50 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
        
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          placeholder={isLoading ? (language === 'en' ? "Waiting for Aethel's guidance..." : "エーテルの導きを待っています...") : (isListening ? (language === 'en' ? "Listening..." : "お話しください...") : t.chat.placeholder)}
          className={`w-full bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-8 py-5 pr-32 focus:outline-none focus:border-mystic-gold/40 focus:bg-black/60 transition-all text-purple-50 placeholder:text-purple-300/20 text-base shadow-[0_10px_30px_rgba(0,0,0,0.5)] ${isListening ? 'ring-2 ring-mystic-gold/50' : ''}`}
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
          <button
            type="button"
            onClick={toggleListening}
            disabled={isLoading}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500/80 text-white animate-pulse' : 'bg-white/5 text-purple-300 hover:bg-white/10'}`}
            title={isListening ? (language === 'en' ? "Stop" : "停止") : (language === 'en' ? "Voice Input" : "音声入力")}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 rounded-full bg-mystic-gold flex items-center justify-center text-black disabled:opacity-20 disabled:grayscale transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(212,175,55,0.4)]"
          >
            {isLoading ? (
              <Sparkles className="w-5 h-5 animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
