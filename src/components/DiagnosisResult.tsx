import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, History, ExternalLink } from 'lucide-react';
import { TarotCard, Language } from '../types';
import { AffiliateOffer } from '../constants/affiliates';
import ReactMarkdown from 'react-markdown';
import { wrapPalmLines } from './InteractivePalmText';
import { TRANSLATIONS } from '../lib/i18n';

interface DiagnosisResultProps {
  cards: TarotCard[];
  interpretation: string;
  onReset: () => void;
  featuredOffer?: AffiliateOffer | null;
  palmImage?: string | null;
  palmHandType?: 'left' | 'right' | null;
  language: Language;
}

export default function DiagnosisResult({ 
  cards, 
  interpretation, 
  onReset, 
  featuredOffer, 
  palmImage, 
  palmHandType, 
  language
}: DiagnosisResultProps) {
  const t = TRANSLATIONS[language];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-8 md:space-y-12 py-8 md:py-12 px-4 md:px-6 pb-24"
    >
      <div className="text-center space-y-4">
        <motion.div
           initial={{ scale: 0 }}
           animate={{ scale: 1 }}
           className="inline-flex items-center space-x-2 px-4 py-1 rounded-full bg-mystic-gold/10 border border-mystic-gold/20 text-mystic-gold text-[10px] uppercase tracking-widest"
         >
          <Sparkles size={12} />
          <span>{language === 'en' ? 'Oracle Complete' : '託宣の完了'}</span>
        </motion.div>
        <h2 className="text-2xl md:text-4xl font-serif text-white tracking-tight">{t.result.title}</h2>
      </div>

      {/* Captured Palm Image Display with Hand Type Badge */}
      {palmImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="relative group w-full max-w-sm">
            <div className="absolute -inset-1 bg-gradient-to-r from-mystic-gold/40 to-purple-800/40 rounded-2xl blur opacity-25 group-hover:opacity-45 transition duration-1000"></div>
            
            <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border-2 border-mystic-gold/30 shadow-2xl bg-black">
              <img 
                src={palmImage} 
                alt="Captured Palm" 
                className="w-full h-full object-cover"
              />
              {/* Overlay shading */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              
              {/* Hand Type Badge directly on the image */}
              {palmHandType && (
                <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md border border-mystic-gold/20 py-2 px-3 rounded-xl text-center">
                  <span className="text-[10px] text-mystic-gold tracking-[0.2em] font-serif uppercase block">
                    {language === 'ja' ? '✦ 走査完了 ✦' : '✦ SCAN COMPLETE ✦'}
                  </span>
                  <span className="text-xs text-white tracking-wider font-bold">
                    {palmHandType === 'right' 
                      ? (language === 'ja' ? '右手 （後天運・現在の力）' : 'Right Hand (Acquired Destiny)') 
                      : (language === 'ja' ? '左手 （先天運・生まれ持った運命）' : 'Left Hand (Innate Destiny)')
                    }
                  </span>
                </div>
              )}
            </div>

            {/* Corner Accents */}
            <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-mystic-gold rounded-tl-lg" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-mystic-gold rounded-br-lg" />
          </div>
        </motion.div>
      )}

      {/* Interpretation Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6 md:p-12 space-y-6 md:space-y-8 bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl relative"
      >
        <div className="absolute top-0 left-0 w-12 h-12 md:w-24 md:h-24 border-t-2 border-l-2 border-mystic-gold/30 rounded-tl-3xl opacity-50" />
        <div className="absolute bottom-0 right-0 w-12 h-12 md:w-24 md:h-24 border-b-2 border-r-2 border-mystic-gold/30 rounded-br-3xl opacity-50" />
        
        <div className="prose prose-sm md:prose-base prose-invert prose-purple max-w-none relative z-10 leading-relaxed overflow-x-hidden">
           <ReactMarkdown
             components={{
               p: ({ children }) => <p>{React.Children.map(children, child => typeof child === 'string' ? wrapPalmLines(child, language) : child)}</p>,
               li: ({ children }) => <li>{React.Children.map(children, child => typeof child === 'string' ? wrapPalmLines(child, language) : child)}</li>,
               strong: ({ children }) => <strong>{React.Children.map(children, child => typeof child === 'string' ? wrapPalmLines(child, language) : child) }</strong>,
               em: ({ children }) => <em>{React.Children.map(children, child => typeof child === 'string' ? wrapPalmLines(child, language) : child)}</em>
             }}
           >
             {interpretation}
           </ReactMarkdown>
        </div>

        {/* Earthly Guide (Affiliate Section) */}
        {featuredOffer && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-mystic-gold/10 via-mystic-purple/5 to-black border border-mystic-gold/30 shadow-[0_0_30px_rgba(212,175,55,0.1)] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 px-3 py-1 bg-mystic-gold text-mystic-purple text-[8px] font-bold uppercase tracking-widest rounded-bl-xl">Earthly Guide</div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-6 md:space-y-0 md:space-x-8 relative z-10">
              <div className="space-y-3 flex-1">
                <div className="flex items-center space-x-2 text-mystic-gold">
                  <Sparkles size={16} />
                  <h4 className="text-lg md:text-xl font-serif font-bold tracking-wide">{language === 'en' ? featuredOffer.title_en : featuredOffer.title}</h4>
                </div>
                <p className="text-sm text-white/70 leading-relaxed italic">{language === 'en' ? featuredOffer.description_en : featuredOffer.description}</p>
              </div>
              
              <a 
                href={language === 'en' ? featuredOffer.url_en : featuredOffer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-3 px-8 py-4 bg-mystic-gold/20 hover:bg-mystic-gold text-mystic-gold hover:text-black border border-mystic-gold rounded-xl font-bold transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
              >
                <span>{language === 'en' ? featuredOffer.ctaText_en : featuredOffer.ctaText}</span>
                <ExternalLink size={18} />
              </a>
            </div>

            {/* Decorative background pulse */}
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-mystic-gold/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            
            {featuredOffer.trackingPixel && (
              <img 
                src={featuredOffer.trackingPixel} 
                width="1" 
                height="1" 
                style={{ border: 0, pointerEvents: 'none', position: 'absolute', opacity: 0 }} 
                alt="" 
              />
            )}
          </motion.div>
        )}

        <div className="flex justify-center pt-6 md:pt-12">
            <button
               onClick={onReset}
               className="flex items-center space-x-2 px-8 py-3 bg-mystic-gold text-mystic-purple rounded-full font-bold hover:scale-105 active:scale-95 transition-transform"
            >
              <History size={18} />
              <span>{language === 'en' ? 'Return to Conversation' : '対話の場に戻る'}</span>
            </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
