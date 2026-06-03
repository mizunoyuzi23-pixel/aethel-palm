import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Moon, Stars, History } from 'lucide-react';
import { Interaction, TarotCard, ReadingResult, Language } from './types';
import { getOracleResponse, getOracleResponseStream, interpretReading, validatePalm } from './services/geminiService';
import { memoryService } from './services/memoryService';
import { AFFILIATE_OFFERS, AffiliateOffer } from './constants/affiliates';
import AIPortrait from './components/AIPortrait';
import ChatBox from './components/ChatBox';
import MinimalInput from './components/MinimalInput';
import DiagnosisResult from './components/DiagnosisResult';

import CosmicBackground from './components/CosmicBackground';
import { cn } from './lib/utils';
import { TRANSLATIONS } from './lib/i18n';

import { PalmCamera } from './components/PalmCamera';

type AppState = 'chat' | 'camera' | 'interpreting' | 'result';

// Set your AI portrait image URL here after uploading to public folder
const AETHEL_IMAGE_URL = "/aethel.png"; 

const TypewriterText = ({ text, isStreaming = false }: { text: string; isStreaming?: boolean }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [chunkIndex, setChunkIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  // Reset indices when text changes fundamentally
  useEffect(() => {
    setDisplayedText('');
    setChunkIndex(0);
    setCharIndex(0);
  }, [text]);

  // Split text into readable chunks for the "2-line display"
  const chunks = useMemo(() => {
    if (!text) return [""];
    if (isStreaming) return [text];

    const result: string[] = [];
    const sentences = text.match(/[^。！？\n]+[。！？\n]?|\n/g) || [text];
    let currentChunk = "";

    sentences.forEach((s) => {
      if (currentChunk.length + s.length > 45) {
        if (currentChunk) result.push(currentChunk.trim());
        currentChunk = s;
      } else {
        currentChunk += s;
      }
    });
    if (currentChunk) result.push(currentChunk.trim());
    return result.length > 0 ? result : [text];
  }, [text, isStreaming]);

  useEffect(() => {
    const currentChunkText = chunks[chunkIndex] || "";

    if (charIndex < currentChunkText.length) {
      const charDelay = isStreaming ? 20 : 50;
      
      const timeout = setTimeout(() => {
        setDisplayedText(currentChunkText.slice(0, charIndex + 1));
        setCharIndex(prev => prev + 1);
      }, charDelay);
      return () => clearTimeout(timeout);
    } else if (!isStreaming && chunkIndex < chunks.length - 1) {
      // Transition to next chunk
      const delay = 3500;

      const pause = setTimeout(() => {
        setDisplayedText('');
        setCharIndex(0);
        setChunkIndex(prev => prev + 1);
      }, delay); 
      return () => clearTimeout(pause);
    } else if (!isStreaming && chunks.length > 1 && chunkIndex === chunks.length - 1) {
      // Loop back only if it's very short flavor text, otherwise just stay on the last chunk
      if (text.length < 30) {
        const loop = setTimeout(() => {
          setDisplayedText('');
          setCharIndex(0);
          setChunkIndex(0);
        }, 8000);
        return () => clearTimeout(loop);
      }
    }
  }, [charIndex, chunkIndex, chunks, isStreaming]);

  return <span className="block min-h-[4.5rem] leading-relaxed whitespace-pre-wrap">{displayedText}</span>;
};

export default function App() {
  const [state, setState] = useState<AppState>('chat');
  const [messages, setMessages] = useState<Interaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);
  const [readingResult, setReadingResult] = useState<string | null>(null);
  const [palmHandType, setPalmHandType] = useState<'left' | 'right' | null>(null);
  const [featuredOffer, setFeaturedOffer] = useState<AffiliateOffer | null>(null);
  const [userProfile, setUserProfile] = useState(memoryService.getProfile());
  const [palmImage, setPalmImage] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('ja');

  useEffect(() => {
    // Initial language detection from IP/Headers on the server
    fetch('/api/geo')
      .then(res => res.json())
      .then(data => {
        if (data.language) {
          setLanguage(data.language);
        }
      })
      .catch(err => {
        console.error("Geo detection failed", err);
        // Fallback to browser language if API fails
        const browserLang = navigator.language.split('-')[0];
        setLanguage(browserLang === 'en' ? 'en' : 'ja');
      });
  }, []);

  const t = TRANSLATIONS[language];

  // Initial greeting
  useEffect(() => {
    const init = async () => {
      if (messages.length > 0) return; // DON'T re-greet if we already have a conversation context

      const profile = memoryService.getProfile();
      setUserProfile(profile);

      if (profile.history.length === 0) {
        const welcome = language === 'en' ? "Welcome to the oracle chamber. Let us weave the threads of destiny." : "占いの館へようこそ。運命の糸を、手繰り寄せましょう。";
        setMessages([{ role: 'assistant', content: welcome, timestamp: Date.now() }]);
      } else {
        setMessages(profile.history);
      }
    };
    init();
  }, [language]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Abort previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const newUserMsg: Interaction = { role: 'user', content, timestamp: Date.now() };
    const streamMsg: Interaction = { role: 'assistant', content: '', timestamp: Date.now() };
    
    // We update messages, potentially removing the last partial assistant message if it was "interrupted"
    setMessages(prev => {
      return [...prev, newUserMsg, streamMsg];
    });
    memoryService.addInteraction(newUserMsg);

    setIsLoading(true);
    setIsStreaming(true);
    
    const historyForAI: { role: 'user' | 'model'; parts: { text: string }[] }[] = messages.slice(-6).map(m => ({ 
      role: m.role === 'user' ? 'user' : 'model', 
      parts: [{ text: m.content }] 
    }));
    
    let fullContent = '';
    try {
      const stream = getOracleResponseStream(
        content, 
        historyForAI, 
        userProfile.summary,
        controller.signal,
        language
      );
      
      for await (const chunk of stream) {
        if (isLoading) setIsLoading(false);
        fullContent += chunk;
        setMessages(prev => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[updated.length - 1] = { ...updated[updated.length - 1], content: fullContent };
          }
          return updated;
        });
      }
      
      const finalMsg = { role: 'assistant' as const, content: fullContent, timestamp: Date.now() };
      memoryService.addInteraction(finalMsg);
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      console.error("Stream error:", error);
      const errorMsg = language === 'en' ? "I am sorry, the connection with the sea of stars has been temporarily severed." : "申し訳ありません、星の海との接続が一時的に途切れてしまいました。";
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], content: errorMsg };
        return updated;
      });
   } finally {
     // Only reset loading and ref if this call is still the active one
     if (abortControllerRef.current === controller) {
       setIsLoading(false);
       setIsStreaming(false);
       abortControllerRef.current = null;
     }
   }
  };

  const handleStartReading = async (capturedImage: string, handType: 'left' | 'right') => {
    setPalmImage(capturedImage);
    setPalmHandType(handType);

    // Select an offer based on chat context
    // We target only the last 4 to 6 messages of user utterances
    const userUtterances = messages.filter(m => m.role === 'user');
    const last6UserMsgs = userUtterances.slice(-6);
    const last2UserMsgs = userUtterances.slice(-2);
    
    let selected: AffiliateOffer | undefined;
    
    // 1. Check if there are exact keyword matches in the last 2 user messages (starting from most recent)
    for (let i = last2UserMsgs.length - 1; i >= 0; i--) {
      const msgText = last2UserMsgs[i].content.toLowerCase();
      const matchingOffers = AFFILIATE_OFFERS.filter(offer =>
        offer.keywords.some(kw => msgText.includes(kw.toLowerCase()))
      );
      if (matchingOffers.length > 0) {
        selected = matchingOffers[Math.floor(Math.random() * matchingOffers.length)];
        break;
      }
    }
    
    // 2. If no match in the last 2 messages, count keyword occurrences across the last 6 messages
    if (!selected && last6UserMsgs.length > 0) {
      const categoryCounts: Record<string, number> = {
        career: 0,
        love: 0,
        finance: 0,
        wellness: 0,
        fortune: 0
      };
      
      last6UserMsgs.forEach(msg => {
        const msgText = msg.content.toLowerCase();
        AFFILIATE_OFFERS.forEach(offer => {
          let countForOffer = 0;
          offer.keywords.forEach(kw => {
            if (msgText.includes(kw.toLowerCase())) {
              countForOffer++;
            }
          });
          if (countForOffer > 0) {
            categoryCounts[offer.category] += countForOffer;
          }
        });
      });
      
      let maxCount = 0;
      let bestCategory: string | null = null;
      Object.entries(categoryCounts).forEach(([cat, count]) => {
        if (count > maxCount) {
          maxCount = count;
          bestCategory = cat;
        }
      });
      
      if (bestCategory) {
        const offersInCat = AFFILIATE_OFFERS.filter(o => o.category === bestCategory);
        if (offersInCat.length > 0) {
          selected = offersInCat[Math.floor(Math.random() * offersInCat.length)];
        }
      }
    }
    
    // 3. Fallback to random specific offer if no match found (including finance category in the pool)
    if (!selected) {
      const specificOffers = AFFILIATE_OFFERS.filter(o => o.category !== 'fortune');
      selected = specificOffers[Math.floor(Math.random() * specificOffers.length)];
    }
    
    setFeaturedOffer(selected);
    setState('interpreting');
    
    // Track scanning progress for better UX
    setReadingResult(language === 'en' ? "Calibrating the celestial alignment... Please hold." : "星の並びを調整しています... そのままお待ちください。");

    // Palm quality validation!
    const validation = await validatePalm(capturedImage);
    if (!validation || !validation.valid) {
      // Return to chat with Ether's message
      const cancelMsg = language === 'en'
        ? "The cosmic alignment cannot trace your palm...\nPlease spread your hand fully to fill the camera frame and try again."
        : "星の導きが読み取れないようです…\n手のひらをカメラいっぱいに広げて、もう一度試してみてください。";
      
      const assistantCancelMsg: Interaction = { role: 'assistant', content: cancelMsg, timestamp: Date.now() };
      
      setMessages(prev => {
        const list = [...prev];
        // Remove empty placeholder loading assistant message if any
        if (list.length > 0 && list[list.length - 1].role === 'assistant' && !list[list.length - 1].content) {
          list[list.length - 1] = assistantCancelMsg;
        } else {
          list.push(assistantCancelMsg);
        }
        return list;
      });
      memoryService.addInteraction(assistantCancelMsg);
      setState('chat');
      return;
    }

    const userStory = messages.filter(m => m.role === 'user').map(m => m.content).join('\n');
    
    const interpretation = await interpretReading(
      userStory, 
      [], 
      userProfile.summary, 
      capturedImage,
      handType,
      language
    );
    
    if (!interpretation) {
      const errorMsg = language === 'en' 
        ? "I am sorry, but the cosmic mists are too thick to read your palm right now. Please try again in a moment."
        : "申し訳ありません、星の霧が深くあなたの掌を読み解くことができません。少し時間を置いてから、もう一度お試しください。";
      setReadingResult(errorMsg);
    } else {
      setReadingResult(interpretation);
      const summary = `Cosmic Insight on ${new Date().toLocaleDateString()}: ${interpretation.slice(0, 200)}...`;
      memoryService.updateSummary(summary);
    }
    setState('result');
  };

  const handleReset = () => {
    setState('chat');
    setSelectedCards([]);
    setReadingResult(null);
    setPalmHandType(null);
    setFeaturedOffer(null);
    setPalmImage(null);
  };

  return (
    <div className="min-h-screen relative font-sans text-purple-50 overflow-hidden bg-black selection:bg-mystic-gold selection:text-mystic-purple">
      {/* Absolute Overlays */}
      <div className="fixed top-4 right-4 z-[110] flex items-center space-x-2">
        <div className="flex bg-black/40 backdrop-blur-md border border-mystic-gold/20 rounded-full p-1 h-10">
          <button 
            onClick={() => setLanguage('ja')}
            className={cn(
              "px-3 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all",
              language === 'ja' ? "bg-mystic-gold text-black shadow-lg" : "text-white/40 hover:text-white"
            )}
          >
            JP
          </button>
          <button 
            onClick={() => setLanguage('en')}
            className={cn(
              "px-3 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all",
              language === 'en' ? "bg-mystic-gold text-black shadow-lg" : "text-white/40 hover:text-white"
            )}
          >
            EN
          </button>
        </div>
      </div>

    <AnimatePresence mode="wait">
        <motion.div
          key="main-app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "linear" }}
          className="fixed inset-0 w-full h-screen overflow-hidden bg-black"
        >
          {/* Layer 0: Stars & Deep Space */}
          <div className="absolute inset-0 z-0 bg-[#050510]" />
          <div className={`stars-bg z-10 transition-opacity duration-1000 ${(state === 'camera' || state === 'interpreting') ? 'opacity-0' : 'opacity-60'}`} />

            <AnimatePresence>
              {(state === 'camera' || state === 'interpreting') && (
                <CosmicBackground key="cosmic-bg" />
              )}
            </AnimatePresence>

      {/* Layer 20: Atmosphere - Hidden in space mode to reveal background */}
      <div className={`fixed inset-0 z-[42] bg-gradient-to-t from-black via-transparent to-black/20 pointer-events-none transition-opacity duration-1000 ${(state === 'camera' || state === 'interpreting') ? 'opacity-0' : 'opacity-100'}`} />

      {/* Layer 45: Main Character Image (Hidden when in space/reading mode) */}
      <div className={`fixed inset-0 z-[45] pointer-events-none overflow-hidden transition-all duration-1000 ${(state === 'camera' || state === 'interpreting') ? 'opacity-0 scale-125 blur-3xl' : 'opacity-100 scale-100 blur-0'}`}>
        <motion.div
           initial={{ opacity: 1, scale: 1.1 }}
           animate={{ 
             opacity: 1, 
             scale: isLoading ? [1.1, 1.14, 1.1] : [1.1, 1.12, 1.1],
             y: isLoading ? [0, -25, 0] : [0, -15, 0],
             x: isLoading ? [-8, 8, -8] : [-3, 3, -3],
             rotate: isLoading ? [-2, 2, -2] : [-0.5, 0.5, -0.5],
             filter: isLoading 
               ? ["brightness(1) contrast(1.1)", "brightness(1.25) contrast(1.2)", "brightness(1) contrast(1.1)"]
               : ["brightness(0.9) contrast(1)", "brightness(1.05) contrast(1.02)", "brightness(0.9) contrast(1)"]
           }}
           transition={{ 
             opacity: { duration: 1.5 },
             scale: { duration: isLoading ? 5 : 8, repeat: Infinity, ease: "easeInOut" },
             y: { duration: isLoading ? 6 : 10, repeat: Infinity, ease: "easeInOut" },
             x: { duration: isLoading ? 8 : 20, repeat: Infinity, ease: "easeInOut" },
             rotate: { duration: isLoading ? 4 : 15, repeat: Infinity, ease: "easeInOut" },
             filter: { 
               duration: isLoading ? 3 : 6, 
               repeat: Infinity, 
               ease: "easeInOut" 
             }
           }}
           className="h-full w-full relative"
        >
          <div className="absolute inset-0 z-10 pointer-events-none">
            {/* Subtle Divine Aura Pulse */}
            <motion.div
              animate={{ 
                opacity: isLoading ? [0.1, 0.3, 0.1] : [0.05, 0.15, 0.05],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-mystic-gold)_0%,_transparent_60%)] mix-blend-screen"
            />
          </div>
          <img 
            src={AETHEL_IMAGE_URL} 
            className="h-full w-full object-cover object-[center_bottom] scale-125 md:scale-100 md:object-center" 
            alt="エーテル"
            onError={(e) => {
              // Fallback to a high-quality mystical woman image
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1600";
            }}
          />
        </motion.div>
      </div>

      {/* Layer 70: Speech Bubble (Mystic Oracle Style) */}
      {state === 'chat' && (
        <div className="fixed bottom-[32%] left-4 right-4 md:top-[6%] md:left-[6%] md:bottom-auto md:right-auto pointer-events-auto z-[70] w-auto max-w-[90vw] md:max-w-[280px]">
          <motion.div 
            key={messages.filter(m => m.role === 'assistant').slice(-1)[0]?.timestamp || 'default'}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="relative p-5 md:p-6 bg-black/70 backdrop-blur-xl border border-mystic-gold/40 rounded-2xl shadow-[0_0_50px_rgba(212,175,55,0.2)] ring-1 ring-white/10"
          >
            {/* Decorative Corners */}
            <div className="absolute top-2 left-2 text-mystic-gold/40">
              <Sparkles size={12} />
            </div>
            <div className="absolute bottom-2 right-2 text-mystic-gold/40">
              <Moon size={10} />
            </div>
            
            {/* Elegant Indicator (Pointer) - Hidden on mobile for cleaner look */}
            <div className="hidden md:block absolute -bottom-1.5 right-12 w-3 h-3 bg-black/70 border-r border-b border-mystic-gold/40 transform rotate-45 backdrop-blur-xl" />
            
            <div className="relative z-10">
              <div className="text-sm md:text-base font-medium leading-relaxed font-serif text-white/95 italic tracking-wide text-left min-h-[4.5rem]">
                 <TypewriterText 
                   text={messages.filter(m => m.role === 'assistant').slice(-1)[0]?.content || (isLoading ? "" : t.chat.aethelThinking)} 
                   isStreaming={isStreaming}
                 />
              </div>
              <div className="mt-3 flex items-center space-x-2 border-t border-white/10 pt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-mystic-gold animate-pulse shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
                <span className="text-[9px] font-bold text-mystic-gold/60 uppercase tracking-[0.2em]">Palm Echo</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <main className={`relative z-[60] h-screen w-full flex flex-col items-center px-4 pt-4 pb-8 md:p-12 ${(state === 'camera' || state === 'interpreting') ? 'justify-center overflow-visible pointer-events-auto' : state === 'result' ? 'justify-start overflow-y-auto pointer-events-auto' : 'justify-end overflow-hidden pointer-events-auto'}`}>
        <div className={`w-full flex flex-col items-center ${state === 'camera' || state === 'interpreting' ? '' : 'mb-4'} ${state === 'result' ? 'min-h-full py-8' : ''}`}>
          <AnimatePresence mode="wait">
            {state === 'chat' && (
              <motion.div 
                key="minimal-input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full pointer-events-auto flex flex-col items-center"
              >
                {/* Celestial Quick Suggestion Chips */}
                <div className="flex flex-wrap md:flex-nowrap justify-center gap-2 max-w-full overflow-x-auto scrollbar-none px-4 mb-4">
                  {(language === 'en' ? [
                    { text: "💼 Career change & suitable jobs", value: "Please read my fortune regarding career changes or what jobs are suitable for me." },
                    { text: "🏢 Tell Aether my current job", value: "I want to share my current occupation/profession to see what the stars say about my professional path." },
                    { text: "🔮 Discover my celestial talents", value: "Could you read the palm lines that indicate my greatest strengths and inner talents?" },
                    { text: "❤️ Love & wealth alignment", value: "What do the stars reveal about my alignment in love or monetary wealth?" },
                  ] : [
                    { text: "💼 転職相談・適職について占う", value: "転職の運勢や、私に向いている適職について占ってください。" },
                    { text: "🏢 現在のお仕事・職業を伝える", value: "現在の私の職業についてお話しして、今後の仕事のゆくえを聞きたいです。" },
                    { text: "🔮 自分の隠れた才能・強みを知る", value: "私の掌から、まだ見ぬ強みや、天から授かった才能を解き明かしてください。" },
                    { text: "❤️ 恋愛や金運を占う", value: "仕事だけでなく、私の恋愛や金運についてのアライメントも教えてください。" },
                  ]).map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip.value)}
                      disabled={isLoading}
                      className="px-4 py-2 rounded-full border border-mystic-gold/20 bg-black/50 hover:bg-mystic-gold/15 hover:border-mystic-gold/50 cursor-pointer text-[11px] font-medium text-purple-200 transition-all duration-300 pointer-events-auto whitespace-nowrap backdrop-blur-md disabled:opacity-50 disabled:pointer-events-none active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                    >
                      {chip.text}
                    </button>
                  ))}
                </div>

                <div className="w-full mb-4 md:mb-8">
                  <MinimalInput 
                    onSendMessage={handleSendMessage} 
                    isLoading={isLoading} 
                    language={language}
                  />
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center"
                >
                  <button 
                    onClick={() => setState('camera')}
                    className="group relative px-12 py-4 bg-gradient-to-r from-mystic-gold via-yellow-200 to-mystic-gold text-black rounded-full text-sm font-black tracking-[0.15em] uppercase hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_40px_rgba(212,175,55,0.5)] overflow-hidden pointer-events-auto border-2 border-white/20"
                  >
                    <div className="absolute inset-0 bg-white/40 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 opacity-30" />
                    <span className="relative flex items-center justify-center space-x-3">
                       <Sparkles size={18} className="animate-pulse" />
                       <span>{t.chat.startReading}</span>
                       <Sparkles size={18} className="animate-pulse" />
                    </span>
                  </button>
                </motion.div>
              </motion.div>
            )}



            {state === 'camera' && (
              <motion.div
                key="camera"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="w-full flex justify-center py-8"
              >
                <PalmCamera 
                  onCapture={(image, handType) => {
                    handleStartReading(image, handType);
                  }}
                  onCancel={() => setState('chat')}
                  language={language}
                />
              </motion.div>
            )}

            {state === 'interpreting' && (
              <motion.div
                key="interpreting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-2xl space-y-12 pointer-events-auto"
              >
                <div className="flex flex-col items-center space-y-8">
                  <div className="w-24 h-24 relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-t-2 border-mystic-gold rounded-full"
                    />
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-2 border-b-2 border-purple-500 rounded-full opacity-50"
                    />
                    <Stars className="absolute inset-0 m-auto text-mystic-gold w-8 h-8 animate-pulse" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-serif text-white tracking-widest uppercase">{language === 'en' ? 'Scanning Local Universe' : '掌の宇宙を走査中'}</h3>
                    <p className="text-sm text-purple-300 italic">{language === 'en' ? 'Tracing the celestial memories etched in your palm...' : '掌に刻まれた星の記憶を辿っています...'}</p>
                  </div>
                </div>

                {/* Earthly Guide Preview during processing */}
                {featuredOffer && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm relative overflow-hidden"
                  >
                    <div className="absolute top-2 right-4 text-[8px] text-mystic-gold/40 tracking-[0.3em] uppercase">Incoming Earthly Guide</div>
                    <div className="space-y-3 relative z-10">
                      <div className="flex items-center space-x-3 text-mystic-gold/80">
                        <Sparkles size={14} />
                        <h4 className="text-sm font-bold tracking-wide">{featuredOffer.title}</h4>
                      </div>
                      <p className="text-[10px] text-white/50 leading-relaxed italic">{featuredOffer.description}</p>
                      <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-mystic-gold"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 15, ease: "linear" }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {state === 'result' && readingResult && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pointer-events-auto"
              >
                <DiagnosisResult 
                  cards={selectedCards} 
                  interpretation={readingResult} 
                  onReset={handleReset}
                  featuredOffer={featuredOffer}
                  palmImage={palmImage}
                  palmHandType={palmHandType}
                  language={language}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="fixed bottom-0 inset-x-0 p-4 text-center pointer-events-none opacity-0">
         <p className="text-[8px] uppercase tracking-[0.3em] text-purple-300/20">宇宙共鳴プロトコル v1.1.0 // 霊的コアと同期中</p>
      </footer>
    </motion.div>
    </AnimatePresence>
    </div>
  );
}
