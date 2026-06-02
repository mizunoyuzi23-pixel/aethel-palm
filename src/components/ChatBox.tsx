import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Sparkles, Volume2, Loader2 } from 'lucide-react';
import { Interaction, Language } from '../types';
import { cn } from '../lib/utils';
import { generateSpeech } from '../services/geminiService';
import { playPCMAudio } from '../lib/audioUtils';
import { TRANSLATIONS } from '../lib/i18n';

interface ChatBoxProps {
  messages: Interaction[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  language: Language;
}

const TypewriterText = ({ text, speed = 25, onComplete }: { text: string; speed?: number; onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState('');
  const lastTextRef = useRef('');

  useEffect(() => {
    if (!text || (lastTextRef.current && !text.startsWith(lastTextRef.current))) {
      setDisplayedText('');
      lastTextRef.current = '';
    }
  }, [text]);

  useEffect(() => {
    if (displayedText.length < text.length) {
      const charDiff = text.length - displayedText.length;
      const adjustedSpeed = charDiff > 20 ? 5 : charDiff > 10 ? 10 : speed;
      
      const timeout = setTimeout(() => {
        const nextText = text.slice(0, displayedText.length + 1);
        setDisplayedText(nextText);
        lastTextRef.current = nextText;
      }, adjustedSpeed);
      return () => clearTimeout(timeout);
    } else if (onComplete && text.length > 0) {
      onComplete();
    }
  }, [displayedText, text, speed, onComplete]);

  return <span className="whitespace-pre-wrap">{displayedText}</span>;
};

export default function ChatBox({ messages, onSendMessage, isLoading, language }: ChatBoxProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [typingCompleteCount, setTypingCompleteCount] = useState(0);
  const t = TRANSLATIONS[language];

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, typingCompleteCount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const handleSpeak = async (msg: Interaction, id: string) => {
    if (speakingId) return;
    setSpeakingId(id);
    try {
      const base64 = await generateSpeech(msg.content);
      if (base64) {
        await playPCMAudio(base64);
      }
    } catch (error) {
      console.error("Speak error:", error);
    } finally {
      setSpeakingId(null);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-black/40 backdrop-blur-xl rounded-[2rem] border border-white/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth scrollbar-none"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            const isLatestAssistantMessage = msg.role === 'assistant' && i === messages.length - 1;
            
            return (
              <motion.div
                key={msg.timestamp + i}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={cn(
                  "flex w-full group/msg",
                  msg.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn(
                  "max-w-[85%] flex space-x-3",
                  msg.role === 'user' ? "flex-row-reverse space-x-reverse" : "flex-row"
                )}>
                  {/* Avatar Icon */}
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-lg",
                    msg.role === 'user' 
                      ? "bg-mystic-gold/20 border border-mystic-gold/30" 
                      : "bg-purple-900/30 border border-purple-500/30"
                  )}>
                    {msg.role === 'user' 
                      ? <User size={18} className="text-mystic-gold" /> 
                      : <Sparkles size={18} className="text-mystic-gold animate-pulse" />
                    }
                  </div>

                  {/* Speech Bubble */}
                  <div className={cn(
                    "relative px-5 py-4 text-sm leading-loose shadow-xl",
                    msg.role === 'user' 
                      ? "bg-mystic-gold/15 border border-mystic-gold/30 rounded-2xl rounded-tr-none text-mystic-gold shadow-mystic-gold/5" 
                      : "bg-white/5 border border-white/10 rounded-2xl rounded-tl-none text-purple-50 shadow-black/20"
                  )}>
                    {/* Tail for Bubble */}
                    <div className={cn(
                      "absolute top-0 w-2 h-2",
                      msg.role === 'user' 
                        ? "-right-1 border-t border-r border-mystic-gold/30 bg-black" 
                        : "-left-1 border-t border-l border-white/10 bg-black"
                    )} style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)', transform: msg.role === 'user' ? 'none' : 'scaleX(-1)' }} />

                    {isLatestAssistantMessage ? (
                      <TypewriterText 
                        text={msg.content} 
                        onComplete={() => {
                          setTypingCompleteCount(prev => prev + 1);
                          scrollToBottom();
                        }} 
                      />
                    ) : (
                      <span className="whitespace-pre-wrap">{msg.content}</span>
                    )}

                    {msg.role === 'assistant' && (
                      <div className="mt-4 flex justify-start">
                        <button
                          onClick={() => handleSpeak(msg, msg.timestamp + '-' + i)}
                          disabled={!!speakingId}
                          className={cn(
                            "group/btn flex items-center space-x-2 px-3 py-1.5 rounded-full bg-mystic-gold/10 border border-mystic-gold/30 text-mystic-gold hover:bg-mystic-gold hover:text-black transition-all duration-300",
                            speakingId === (msg.timestamp + '-' + i) && "animate-pulse border-mystic-gold shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                          )}
                        >
                          {speakingId === (msg.timestamp + '-' + i) ? (
                            <Loader2 size={14} className="animate-spin text-mystic-gold" />
                          ) : (
                            <Volume2 size={14} className="group-hover/btn:scale-110 transition-transform" />
                          )}
                          <span className="text-[10px] font-bold tracking-widest uppercase">{language === 'en' ? "Hear Aethel's Voice" : "エーテルの声を聴く"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
          
          {isLoading && !messages[messages.length - 1]?.content.startsWith('...') && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start pl-12"
            >
              <div className="flex space-x-2 py-3 px-5 bg-white/5 border border-white/10 rounded-2xl">
                <div className="w-1.5 h-1.5 bg-mystic-gold/60 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-mystic-gold/60 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-mystic-gold/60 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="px-6 py-6 bg-black/40 border-t border-white/10">
        <form onSubmit={handleSubmit} className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={isLoading ? (language === 'en' ? "Waiting for Aethel..." : "エーテルの導きを待っています...") : (language === 'en' ? "Open your heart..." : "あなたの心を開いてください...")}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pr-16 focus:outline-none focus:border-mystic-gold/50 focus:bg-white/10 transition-all text-purple-50 placeholder:text-purple-300/20 text-sm shadow-inner"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-mystic-gold flex items-center justify-center text-black disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-[0_4px_15px_rgba(212,175,55,0.4)]"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
