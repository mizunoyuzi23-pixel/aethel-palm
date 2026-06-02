import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TarotCard } from '../types';
import { TAROT_DECK } from '../constants';
import { Sparkles, Eye } from 'lucide-react';
import { AffiliateOffer } from '../constants/affiliates';

interface TarotSelectionProps {
  onSelected: (cards: TarotCard[]) => void;
  featuredOffer?: AffiliateOffer | null;
}

export default function TarotSelection({ onSelected, featuredOffer }: TarotSelectionProps) {
  const [shuffledDeck, setShuffledDeck] = useState<TarotCard[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isRevealing, setIsRevealing] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    // Shuffle the deck once on mount
    const deck = [...TAROT_DECK].sort(() => Math.random() - 0.5);
    setShuffledDeck(deck);
    
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const cardSpread = isMobile ? 6 : 30;
  const selectionSpread = isMobile ? 90 : 160;
  const fanRotation = isMobile ? 2.5 : 10;

  const handleCardClick = (index: number) => {
    if (selectedIndices.includes(index) || selectedIndices.length >= 3 || isRevealing || shuffledDeck.length === 0) return;
    
    const newSelected = [...selectedIndices, index];
    setSelectedIndices(newSelected);

    if (newSelected.length === 3) {
      setTimeout(() => {
        setIsRevealing(true);
        const selectedCards = newSelected.map(i => shuffledDeck[i % shuffledDeck.length]);
        
        // Show ad/loading overlay after cards are flipped
        setTimeout(() => {
          setShowAd(true);
          // Auto-proceed after ad time
          setTimeout(() => onSelected(selectedCards), 5000);
        }, 1000);
      }, 500);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 md:space-y-12 pb-12">
      <div className="text-center space-y-2 md:space-y-4">
        <motion.h3 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl md:text-4xl font-serif text-mystic-gold tracking-[0.2em] uppercase"
        >
          星の託宣
        </motion.h3>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/60 lowercase italic text-[10px] md:text-sm tracking-widest max-w-[80vw] mx-auto px-4"
        >
          魂が共鳴するカードを3枚選びなさい... ({selectedIndices.length}/3)
        </motion.p>
      </div>

      <div className="relative w-full max-w-4xl h-[400px] flex items-center justify-center overflow-visible px-4 md:px-12">
        <AnimatePresence>
          {showAd && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="absolute inset-x-4 md:inset-x-0 top-1/2 -translate-y-1/2 z-[100] bg-black/80 backdrop-blur-xl border border-mystic-gold/30 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            >
              <div className="text-center space-y-2">
                <span className="text-[10px] text-mystic-gold tracking-[0.3em] uppercase block">Cosmic Resonance</span>
                <h4 className="text-xl md:text-2xl font-serif text-white">宇宙の意志を解析中...</h4>
                <p className="text-xs text-white/40 italic">星々が言葉を紡ぎ、道を示しています</p>
              </div>

              {/* Advertisement Placeholder */}
              <div className="w-full max-w-sm aspect-video bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10 rounded-lg flex flex-col items-center justify-center p-4 relative group overflow-hidden">
                 <div className="absolute top-2 right-2 px-1.5 py-0.5 border border-white/20 rounded text-[8px] text-white/40 uppercase tracking-widest">Sponsored</div>
                 <div className="text-center space-y-2 z-10">
                    <p className="text-sm font-bold text-white transition-colors">{featuredOffer?.title || '星の転機：キャリア相談'}</p>
                    <p className="text-[10px] text-white/60 leading-relaxed max-w-[200px] mx-auto">{featuredOffer?.description || 'あなたの才能を最も活かせる場所を探してみませんか？'}</p>
                    <div className="mt-2 text-[8px] text-mystic-gold/40 italic">※解析完了後に詳細を確認できます</div>
                 </div>
                 {/* Decorative background glow */}
                 <div className="absolute inset-0 bg-radial-gradient from-mystic-gold/5 via-transparent to-transparent opacity-50" />
              </div>

              <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  className="w-full h-full bg-mystic-gold"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {Array.from({ length: 15 }).map((_, i) => {
          const isSelected = selectedIndices.includes(i);
          const selectionOrder = selectedIndices.indexOf(i);
          
          return (
            <motion.div
              key={i}
              className="absolute cursor-pointer"
              style={{
                zIndex: isSelected ? 50 : 10 + i,
              }}
              initial={{ 
                rotate: (i - 7) * fanRotation,
                x: (i - 7) * cardSpread,
                y: Math.abs(i - 7) * (isMobile ? 2 : 10) 
              }}
              animate={isSelected ? {
                scale: isMobile ? 1.0 : 1.1,
                y: isMobile ? -110 : -150,
                x: (selectionOrder - 1) * selectionSpread,
                rotate: 0,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              } : {}}
              whileHover={!isSelected && !isRevealing ? { 
                y: isMobile ? -10 : -20, 
                scale: 1.05,
                transition: { duration: 0.2 } 
              } : {}}
              onClick={() => handleCardClick(i)}
            >
              {/* Card Back */}
              <div className="w-24 h-38 md:w-32 md:h-52 rounded-xl border-2 border-mystic-gold/40 bg-gradient-to-br from-purple-950 via-black to-blue-950 flex flex-col items-center justify-center relative overflow-hidden group shadow-[0_0_30px_rgba(197,160,89,0.15)]">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20" />
                
                <div className="absolute inset-2 border border-mystic-gold/10 rounded-lg flex items-center justify-center">
                   <div className="w-10 h-10 md:w-16 md:h-16 rounded-full border border-mystic-gold/30 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                      <Sparkles className="text-mystic-gold/40 w-4 h-4 md:w-8 md:h-8 group-hover:scale-125 group-hover:text-mystic-gold transition-all duration-500" />
                   </div>
                </div>
                
                {/* Decorative border patterns */}
                <div className="absolute top-2 left-2 text-[8px] text-mystic-gold/20">✦</div>
                <div className="absolute top-2 right-2 text-[8px] text-mystic-gold/20">✦</div>
                <div className="absolute bottom-2 left-2 text-[8px] text-mystic-gold/20">✦</div>
                <div className="absolute bottom-2 right-2 text-[8px] text-mystic-gold/20">✦</div>

                {isSelected && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-mystic-gold/10 mix-blend-overlay"
                  />
                )}
                
                <AnimatePresence>
                  {isRevealing && isSelected && (() => {
                    const card = shuffledDeck[i % shuffledDeck.length];
                    return (
                      <motion.div
                        initial={{ opacity: 0, rotateY: 180 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        className="absolute inset-0 bg-black flex flex-col items-center justify-center overflow-hidden"
                      >
                         {card?.imageUrl && (
                           <img 
                             src={card.imageUrl} 
                             alt={card.name} 
                             className="absolute inset-0 w-full h-full object-cover opacity-60"
                           />
                         )}
                         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                         <div className="relative z-10 p-2 text-center">
                            <span className="text-[6px] text-mystic-gold/60 uppercase tracking-tighter block mb-0.5">
                              {card?.arcana === 'cosmic' ? '宇宙の法' : '鑑定中'}
                            </span>
                            <p className="text-[10px] md:text-xs font-serif text-white leading-tight drop-shadow-lg font-bold">{card?.name}</p>
                         </div>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </div>
              
              {isSelected && (
                <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-mystic-gold flex items-center justify-center text-mystic-purple text-xs font-bold shadow-lg">
                  {selectionOrder + 1}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
