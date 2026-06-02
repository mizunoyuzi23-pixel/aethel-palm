import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info } from 'lucide-react';

import { Language } from '../types';

const PALM_LINE_DEFINITIONS_JA: Record<string, string> = {
  "生命線": "親指の付け根を囲むように伸びる線。生命力、健康、活力、そして人生の転機や変化を表します。",
  "知能線": "掌の中央を横切る線。思考の傾向、才能、集中力、そして物事への向き合い方を表します。",
  "頭脳線": "掌の中央を横切る線。思考の傾向、才能、集中力、そして物事への向き合い方を表します。知能線とも呼ばれます。",
  "感情線": "小指の下から人差し指の方へ伸びる線。感受性、愛情、対人関係、そして心の動きや性格の傾向を表します。",
  "運命線": "掌の下部から中指に向かって垂直に伸びる線。仕事運、社会的な活躍、人生の目的、そして自力で道を切り開く力を表します。",
  "太陽線": "薬指の付け根に向かって伸びる線。成功、名声、金運、そして周囲からの信頼や幸福感を表します。",
  "結婚線": "小指の付け根と感情線の間にある短い横線。愛情運、出会いの時期、そして深い絆を結ぶ相手との関係性を表します。",
  "月丘": "小指の下方、手首に近い膨らみ。想像力、神秘、直感、そして芸術的な才能や旅の運勢を象徴します。",
  "金星丘": "親指の付け根の膨らみ。生命エネルギー、健康、愛情、そして家庭運や物質的な豊かさを象徴します。",
  "木星丘": "人差し指の付け根の膨らみ。野心、リーダーシップ、自信、その社会的な成功や名誉を象徴します。",
  "土星丘": "中指の付け根の膨らみ。忍耐、努力、孤独、そして研究心や責任感を象徴します。"
};

const PALM_LINE_DEFINITIONS_EN: Record<string, string> = {
  "Life Line": "The line wrapping around the base of the thumb. Represents vitality, health, and major life changes.",
  "Head Line": "The horizontal line across the middle of the palm. Represents thinking patterns, intellect, and focus.",
  "Brain Line": "Another term for the Head Line. Represents cognitive style and intellectual potential.",
  "Heart Line": "The line running from below the pinky towards the index finger. Represents emotions, relationships, and sensitivity.",
  "Fate Line": "A vertical line running towards the middle finger. Represents career, life purpose, and accomplishments.",
  "Sun Line": "A vertical line towards the ring finger. Represents fame, success, and prosperity.",
  "Marriage Line": "Short horizontal lines between the heart line and pinky base. Represents long-term bonds and love life timing.",
  "Mount of Moon": "The area near the base of the palm opposite the thumb. Symbolizes intuition, creativity, and spiritual travel.",
  "Mount of Venus": "The area at the base of the thumb. Symbolizes vitality, love, passion, and family ties.",
  "Mount of Jupiter": "The area below the index finger. Symbolizes ambition, leadership, power, and social honor.",
  "Mount of Saturn": "The area below the middle finger. Symbolizes discipline, responsibility, and deep reflection."
};

interface TooltipProps {
  keyword: string;
  definition: string;
  language: Language;
  children: React.ReactNode;
}

const PalmLineTooltip = ({ keyword, definition, language, children }: TooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <span ref={containerRef} className="relative inline-block group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center space-x-1 decoration-mystic-gold/40 decoration-wavy underline underline-offset-4 hover:text-mystic-gold transition-colors font-bold"
      >
        <span>{children}</span>
        <Info size={12} className="opacity-40 group-hover:opacity-100 transition-opacity" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 bg-mystic-purple/95 backdrop-blur-xl border border-mystic-gold/30 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] pointer-events-auto"
          >
            <div className="space-y-2">
              <div className="flex items-center space-x-2 border-b border-mystic-gold/20 pb-2">
                <div className="p-1 bg-mystic-gold/10 rounded">
                  <Sparkles size={12} className="text-mystic-gold" />
                </div>
                <span className="text-xs font-serif font-bold text-mystic-gold tracking-widest uppercase">
                  {language === 'en' ? `Insight: ${keyword}` : `${keyword}の啓示`}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-white/80 italic">
                {definition}
              </p>
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-mystic-purple border-r border-b border-mystic-gold/30 rotate-45 -translate-y-1.5" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};

// Helper to wrap keywords in text
export const wrapPalmLines = (text: string, language: Language = 'ja') => {
  if (typeof text !== 'string') return text;

  const definitions = language === 'ja' ? PALM_LINE_DEFINITIONS_JA : PALM_LINE_DEFINITIONS_EN;

  // Sort keywords by length descending to match longer phrases first
  const keywords = Object.keys(definitions).sort((a, b) => b.length - a.length);
  
  if (keywords.length === 0) return text;

  // Create a regex to match any of the keywords
  // Use case insensitive for English
  const regex = new RegExp(`(${keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, language === 'en' ? 'gi' : 'g');
  
  const parts = text.split(regex);

  return parts.map((part, index) => {
    // Find matching definition (case insensitive for English)
    const matchKey = keywords.find(k => 
      language === 'en' ? k.toLowerCase() === part.toLowerCase() : k === part
    );

    if (matchKey) {
      return (
        <PalmLineTooltip 
          key={index} 
          keyword={matchKey} 
          definition={definitions[matchKey]} 
          language={language}
        >
          {part}
        </PalmLineTooltip>
      );
    }
    return part;
  });
};

const Sparkles = ({ size = 16, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);
