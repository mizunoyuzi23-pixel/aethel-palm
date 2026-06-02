import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Calendar, ArrowRight, History, ExternalLink } from 'lucide-react';
import { TarotCard, Language, PalmAnalysis } from '../types';
import { AffiliateOffer } from '../constants/affiliates';
import ReactMarkdown from 'react-markdown';
import { wrapPalmLines } from './InteractivePalmText';
import { TRANSLATIONS } from '../lib/i18n';

import SymbolicPalm from './SymbolicPalm';

interface DiagnosisResultProps {
  cards: TarotCard[];
  interpretation: string;
  onReset: () => void;
  featuredOffer?: AffiliateOffer | null;
  palmImage?: string | null;
  palmLines?: PalmAnalysis | null;
  language: Language;
  onReDiagnose?: (updated: PalmAnalysis) => void;
}

const DEFAULT_COORDINATES: Record<'left' | 'right', Record<string, [number, number][]>> = {
  left: {
    heartLine: [
      [180, 480],
      [320, 440],
      [480, 420],
      [620, 410],
      [720, 380],
      [780, 310]
    ],
    headLine: [
      [750, 500],
      [640, 520],
      [520, 550],
      [420, 590],
      [320, 640],
      [250, 720]
    ],
    lifeLine: [
      [750, 500],
      [660, 530],
      [550, 600],
      [480, 720],
      [510, 880],
      [590, 1050]
    ],
    fateLine: [
      [500, 1150],
      [500, 950],
      [500, 750],
      [500, 550],
      [500, 380],
      [500, 250]
    ]
  },
  right: {
    heartLine: [
      [820, 480],
      [680, 440],
      [520, 420],
      [380, 410],
      [280, 380],
      [220, 310]
    ],
    headLine: [
      [250, 500],
      [360, 520],
      [480, 550],
      [580, 590],
      [680, 640],
      [750, 720]
    ],
    lifeLine: [
      [250, 500],
      [340, 530],
      [450, 600],
      [520, 720],
      [490, 880],
      [410, 1050]
    ],
    fateLine: [
      [500, 1155],
      [500, 950],
      [500, 750],
      [500, 550],
      [500, 380],
      [500, 250]
    ]
  }
};

const InteractivePalmEditor = ({ 
  image, 
  analysis, 
  onChange,
  onReset,
  language,
  onReDiagnose
}: { 
  image: string; 
  analysis: PalmAnalysis;
  onChange: (updated: PalmAnalysis) => void;
  onReset: () => void;
  language: Language;
  onReDiagnose?: (updated: PalmAnalysis) => void;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [activePoint, setActivePoint] = React.useState<{ lineName: string; index: number } | null>(null);
  
  // Cache the last edited coordinates for lines so toggling back ON retains progress
  const lastCoordinatesRef = React.useRef<Record<string, [number, number][]>>({ ...analysis.lines });

  React.useEffect(() => {
    Object.entries(analysis.lines).forEach(([name, points]) => {
      if (points && points.length > 0) {
        lastCoordinatesRef.current[name] = points;
      }
    });
  }, [analysis.lines]);

  const t = TRANSLATIONS[language];
  const isLeft = analysis.handType === 'left';

  const lineColors: Record<string, string> = {
    lifeLine: '#eab308', // Gold/Yellow
    headLine: '#a855f7', // Purple
    heartLine: '#ef4444', // Red
    fateLine: '#3b82f6', // Blue
  };

  const lineLabels: Record<string, string> = language === 'ja' ? {
    lifeLine: '生命線',
    headLine: '知能線',
    heartLine: '感情線',
    fateLine: '運命線'
  } : {
    lifeLine: 'Life',
    headLine: 'Head',
    heartLine: 'Heart',
    fateLine: 'Fate'
  };

  const getSmoothSplinePath = (points: [number, number][]) => {
    if (!points || points.length < 2) return '';
    if (points.length === 2) {
      return `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]}`;
    }

    const pts = points.map(p => ({ x: p[0], y: p[1] }));
    let path = `M ${pts[0].x} ${pts[0].y}`;
    
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    
    return path;
  };

  // Convert client cursor coords into 0-1000 SVG coordinates mapping
  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!activePoint || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    
    // Normalize coordinates mapped to 1000x1333 space
    const x = Math.max(0, Math.min(1000, ((clientX - rect.left) / rect.width) * 1000));
    const y = Math.max(0, Math.min(1333, ((clientY - rect.top) / rect.height) * 1333));

    const updatedLines = { ...analysis.lines };
    const currentPoints = [...(updatedLines[activePoint.lineName] || [])];
    
    if (currentPoints[activePoint.index]) {
      currentPoints[activePoint.index] = [Math.round(x), Math.round(y)];
      updatedLines[activePoint.lineName] = currentPoints;
      onChange({
        ...analysis,
        lines: updatedLines
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!activePoint) return;
    handlePointerMove(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!activePoint || e.touches.length === 0) return;
    handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handlePointerUp = () => {
    setActivePoint(null);
  };

  const toggleLineVisibility = (lineName: string) => {
    const isCurrentlyVisible = analysis.lines[lineName] && analysis.lines[lineName].length > 0;
    const updatedLines = { ...analysis.lines };

    if (isCurrentlyVisible) {
      lastCoordinatesRef.current[lineName] = analysis.lines[lineName];
      updatedLines[lineName] = [];
    } else {
      const restored = lastCoordinatesRef.current[lineName] && lastCoordinatesRef.current[lineName].length > 0
        ? lastCoordinatesRef.current[lineName]
        : (DEFAULT_COORDINATES[analysis.handType || 'right'][lineName] || []);
      updatedLines[lineName] = restored;
    }

    onChange({
      ...analysis,
      lines: updatedLines
    });
    
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      {/* Prominent Guidelines Text */}
      <div className="w-full text-center p-3 rounded-xl bg-mystic-gold/10 border border-mystic-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.05)]">
        <p className="text-xs font-semibold text-mystic-gold tracking-wide animate-pulse">
          {language === 'ja'
            ? '✨ この線をドラッグして、手のひらの実際の手相に合わせてください'
            : '✨ Drag the glowing lines to match your actual palm creases'}
        </p>
      </div>

      <div 
        ref={containerRef} 
        className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border-2 border-mystic-gold/40 shadow-[0_0_30px_rgba(212,175,55,0.15)] bg-slate-950 select-none touch-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handlePointerUp}
      >
        {/* Underlay: Captured Palm Photo */}
        <img 
          src={image} 
          alt="Captured Palm Print" 
          className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-90"
        />

        {/* Ambient Grid for Mysticism */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.5))] pointer-events-none" />

        {/* Dynamic Drag-and-Drop SVG Overlay (1000x1333 coordinate space) */}
        <svg 
          ref={svgRef}
          viewBox="0 0 1000 1333" 
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 w-full h-full"
        >
          {/* Flipped Hand Guideline Overlay to match hand type */}
          <g transform={isLeft ? "scale(-1, 1) translate(-1000, 0)" : ""} opacity="0.12">
            <path 
               d="M 500 950 Q 200 900 150 700 Q 100 500 200 300 Q 250 200 300 150 Q 350 100 450 150 Q 500 180 550 150 Q 650 100 700 150 Q 750 200 800 300 Q 900 500 850 700 Q 800 900 500 950" 
               fill="none" 
               stroke="#d4af37" 
               strokeWidth="6"
               strokeDasharray="10 10"
            />
          </g>

          {/* Golden Gate / Overlay Guidelines */}
          {Object.entries(analysis.lines).map(([name, points]) => {
            const color = lineColors[name] || '#ffffff';
            const label = lineLabels[name] || name;
            const pathData = getSmoothSplinePath(points);

            if (!points || points.length < 2) return null;

            return (
              <g key={name} className="group/line">
                {/* Visual Path */}
                <path
                  d={pathData}
                  stroke={color}
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-75 group-hover/line:opacity-100 transition-opacity"
                  style={{ filter: `drop-shadow(0 0 10px ${color})` }}
                />

                {/* Invisible thicker path for easier hovering */}
                <path
                  d={pathData}
                  stroke="transparent"
                  strokeWidth="30"
                  fill="none"
                  className="cursor-pointer"
                />

                {/* Line Label */}
                {points[Math.floor(points.length / 2)] && (
                  <text
                    x={points[Math.floor(points.length / 2)][0]}
                    y={points[Math.floor(points.length / 2)][1] - 18}
                    fill="#ffffff"
                    fontSize="22"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="select-none pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                  >
                    {label}
                  </text>
                )}

                {/* Interactive Drag Handles / Active Nodes */}
                {points.map((pt, index) => {
                  const isActive = activePoint?.lineName === name && activePoint?.index === index;
                  return (
                    <g key={index}>
                      {/* Invisible larger touch target (r=24 is 48px diameter) */}
                      <circle
                        cx={pt[0]}
                        cy={pt[1]}
                        r={24}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setActivePoint({ lineName: name, index });
                          if (navigator.vibrate) {
                            navigator.vibrate(10);
                          }
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          setActivePoint({ lineName: name, index });
                          if (navigator.vibrate) {
                            navigator.vibrate(10);
                          }
                        }}
                      />
                      {/* Visual node */}
                      <circle
                        cx={pt[0]}
                        cy={pt[1]}
                        r={isActive ? 16 : 10}
                        fill={isActive ? '#ffffff' : color}
                        stroke="#ffffff"
                        strokeWidth={isActive ? 4 : 2}
                        className="pointer-events-none transition-all"
                        style={{ filter: `drop-shadow(0 0 8px ${color})` }}
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Visibility Toggle Switches */}
      <div className="w-full space-y-2">
        <p className="text-[10px] text-white/50 tracking-wider text-center uppercase font-bold">
          {language === 'ja' ? '手相線の表示トグル' : 'Toggle Palm Lines Visibility'}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(lineLabels).map(([name, label]) => {
            const isVisible = analysis.lines[name] && analysis.lines[name].length > 0;
            const color = lineColors[name] || '#ffffff';
            return (
              <button
                key={name}
                onClick={() => toggleLineVisibility(name)}
                className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
                  isVisible 
                    ? 'bg-slate-900 border-white/20 text-white font-medium' 
                    : 'bg-black/40 border-white/5 text-white/40'
                }`}
                style={isVisible ? { borderLeft: `4px solid ${color}` } : {}}
              >
                <span>{label}</span>
                <span className={`w-2.5 h-2.5 rounded-full ${
                  isVisible ? 'bg-green-500' : 'bg-red-500/40'
                }`} style={isVisible ? { boxShadow: `0 0 8px ${color}` } : {}} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Auxiliary Help Control Panel */}
      <div className="w-full flex justify-between items-center bg-white/5 border border-white/10 p-3 rounded-xl gap-2">
        <span className="text-[10px] text-white/60 tracking-wider flex-1">
          {language === 'ja' 
            ? '💡 光るノードをドラッグして、手相線に完全に調整可能。不要な線は非表示にできます。' 
            : '💡 Drag the glowing knots to calibrate palm creases. Toggle lines off if not visible.'}
        </span>
        <button
          onClick={onReset}
          className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition shrink-0"
        >
          {language === 'ja' ? '初期配置に戻す' : 'Reset Coordinates'}
        </button>
      </div>

      {/* Confirmation & Re-diagnosis CTA */}
      {onReDiagnose && (
        <button
          onClick={() => onReDiagnose(analysis)}
          className="w-full flex items-center justify-center space-x-2 py-3 px-6 bg-gradient-to-r from-mystic-gold via-yellow-500 to-mystic-gold hover:from-white hover:to-white hover:scale-[1.02] active:scale-[0.98] text-black font-bold rounded-xl transition duration-300 shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
        >
          <Sparkles size={16} />
          <span>{language === 'ja' ? '手相を確定して再診断する' : 'Confirm & Re-Diagnose Palm'}</span>
        </button>
      )}
    </div>
  );
};

export default function DiagnosisResult({ 
  cards, 
  interpretation, 
  onReset, 
  featuredOffer, 
  palmImage, 
  palmLines, 
  language,
  onReDiagnose
}: DiagnosisResultProps) {
  const t = TRANSLATIONS[language];
  const [viewMode, setViewMode] = React.useState<'photo' | 'map'>('photo');

  // Initialize state with default templates if AI didn't provide specific coordinates or handType
  const [localPalmLines, setLocalPalmLines] = React.useState<PalmAnalysis | null>(() => {
    if (!palmLines) return null;
    const hand = palmLines.handType || 'right';
    const lines = palmLines.lines && Object.keys(palmLines.lines).length > 0
      ? palmLines.lines
      : DEFAULT_COORDINATES[hand];
    return {
      ...palmLines,
      handType: hand,
      lines: JSON.parse(JSON.stringify(lines))
    };
  });

  React.useEffect(() => {
    if (palmLines) {
      const hand = palmLines.handType || 'right';
      const lines = palmLines.lines && Object.keys(palmLines.lines).length > 0
        ? palmLines.lines
        : DEFAULT_COORDINATES[hand];
      setLocalPalmLines({
        ...palmLines,
        handType: hand,
        lines: JSON.parse(JSON.stringify(lines))
      });
    }
  }, [palmLines]);

  // Restore back to templates of our current hand side
  const handleResetCoordinates = () => {
    if (localPalmLines) {
      const hand = localPalmLines.handType || 'right';
      setLocalPalmLines({
        ...localPalmLines,
        lines: JSON.parse(JSON.stringify(DEFAULT_COORDINATES[hand]))
      });
    }
  };

  // Toggle Left/Right hand type (and load corresponding shape template)
  const toggleHandType = (newType: 'left' | 'right') => {
    if (localPalmLines) {
      setLocalPalmLines({
        ...localPalmLines,
        handType: newType,
        lines: JSON.parse(JSON.stringify(DEFAULT_COORDINATES[newType]))
      });
    }
  };

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

      {/* View Switcher */}
      {palmImage && localPalmLines && (
        <div className="flex justify-center -mb-4">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-1 rounded-full flex items-center shadow-2xl z-20">
            <button 
              onClick={() => setViewMode('photo')}
              className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all ${viewMode === 'photo' ? 'bg-mystic-gold text-black shadow-lg shadow-mystic-gold/20' : 'text-white/60 hover:text-white'}`}
            >
              Astral Photo
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all ${viewMode === 'map' ? 'bg-mystic-gold text-black shadow-lg shadow-mystic-gold/20' : 'text-white/60 hover:text-white'}`}
            >
              Geometric Map
            </button>
          </div>
        </div>
      )}

      {/* Hand Side Select (Right/Left) Toggle & Traditional Astrology Explanation */}
      {palmImage && localPalmLines && (
        <div className="max-w-md mx-auto space-y-4 px-2">
          <div className="flex flex-col items-center space-y-2">
            <span className="text-[10px] text-mystic-gold uppercase tracking-widest font-bold">
              {language === 'ja' ? '手動 手の切り替え・補正' : 'Manual Hand Selector & Calibration'}
            </span>
            <div className="bg-black/50 border border-white/10 p-1 rounded-full flex items-center shadow-xl">
              <button
                onClick={() => toggleHandType('left')}
                className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all ${localPalmLines.handType === 'left' ? 'bg-mystic-gold text-black shadow-lg shadow-mystic-gold/20' : 'text-white/60 hover:text-white'}`}
              >
                {language === 'ja' ? '左手（先天運）' : 'Left (Innate)'}
              </button>
              <button
                onClick={() => toggleHandType('right')}
                className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all ${localPalmLines.handType === 'right' ? 'bg-mystic-gold text-black shadow-lg shadow-mystic-gold/20' : 'text-white/60 hover:text-white'}`}
              >
                {language === 'ja' ? '右手（後天運）' : 'Right (Developed)'}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-950/20 border border-white/5 text-xs space-y-1.5 text-white/70 leading-relaxed text-center max-w-sm mx-auto">
            {localPalmLines.handType === 'left' ? (
              <>
                <strong className="text-mystic-gold block">
                  {language === 'ja' ? '✦ 左手：先天運（生まれ持った宿命）' : '✦ Left Hand: Innate Potential'}
                </strong>
                <span>
                  {language === 'ja' 
                    ? '潜在能力、本質、過去の霊的配置や宿命を象徴します。生まれ持った魂の星図が描かれています。' 
                    : 'Represents your core talent, latent personality traits, and inherited past. It maps out your fundamental soul blueprint.'}
                </span>
              </>
            ) : (
              <>
                <strong className="text-mystic-gold block">
                  {language === 'ja' ? '✦ 右手：後天運（切り拓く現実・未来）' : '✦ Right Hand: Formed Future'}
                </strong>
                <span>
                  {language === 'ja' 
                    ? '現実社会での決断、現在の強み、あなたがこれまでの行動で切り拓いてきた運勢を象徴します。' 
                    : 'Reflects your active choices, current progress, and the potential future you are weaving dynamically every day.'}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Captured Palm Image Display */}
      {palmImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex justify-center"
        >
          <div className="relative group w-full max-w-sm">
            <div className="absolute -inset-1 bg-gradient-to-r from-mystic-gold/50 to-purple-600/50 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            
            {viewMode === 'map' && localPalmLines ? (
              <SymbolicPalm lines={localPalmLines.lines} handType={localPalmLines.handType} language={language} />
            ) : localPalmLines ? (
              <InteractivePalmEditor image={palmImage} analysis={localPalmLines} onChange={setLocalPalmLines} onReset={handleResetCoordinates} language={language} onReDiagnose={onReDiagnose} />
            ) : (
              <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border-2 border-mystic-gold/30 shadow-2xl bg-black">
                <img 
                  src={palmImage} 
                  alt="Captured Palm" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

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
        transition={{ delay: 1 }}
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
            transition={{ delay: 1.5 }}
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
