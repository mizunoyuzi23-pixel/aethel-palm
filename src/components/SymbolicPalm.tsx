import React from 'react';
import { motion } from 'motion/react';

interface SymbolicPalmProps {
  lines: Record<string, [number, number][]>;
  handType?: 'left' | 'right';
  language: 'en' | 'ja';
}

export default function SymbolicPalm({ lines, handType = 'right', language }: SymbolicPalmProps) {
  const isLeft = handType === 'left';
  
  const labels: Record<string, string> = language === 'ja' ? {
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

  const handLabels: Record<string, string> = language === 'ja' ? {
    left: '左手の星図 (先天運)',
    right: '右手の星図 (後天運)'
  } : {
    left: 'Left Palm (Innate)',
    right: 'Right Palm (Developed)'
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

  return (
    <div className="relative w-full aspect-[3/4] bg-indigo-950/20 rounded-2xl border border-mystic-gold/10 p-4 flex items-center justify-center">
      <svg viewBox="0 0 1000 1333" className="w-full h-full drop-shadow-[0_0_15px_rgba(212,175,55,0.2)]">
        {/* Simple Hand Outline - Flipped if Left Hand */}
        <g transform={isLeft ? "scale(-1, 1) translate(-1000, 0)" : ""}>
          <path 
             d="M 500 950 Q 200 900 150 700 Q 100 500 200 300 Q 250 200 300 150 Q 350 100 450 150 Q 500 180 550 150 Q 650 100 700 150 Q 750 200 800 300 Q 900 500 850 700 Q 800 900 500 950" 
             fill="rgba(212,175,55,0.03)" 
             stroke="rgba(212,175,55,0.1)" 
             strokeWidth="5"
          />
        </g>
        
        {/* Detected Lines */}
        {Object.entries(lines).map(([name, points]) => {
          let color = '#d4af37';
          switch(name) {
            case 'lifeLine': color = '#eab308'; break; 
            case 'headLine': color = '#a855f7'; break;
            case 'heartLine': color = '#ef4444'; break;
            case 'fateLine': color = '#3b82f6'; break;
          }
          
          return (
            <g key={name}>
              <motion.path
                d={getSmoothSplinePath(points)}
                stroke={color}
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, delay: 0.5 }}
              />
              {/* Floating Labels in SVG space */}
              {points.length > 0 && (
                <text 
                  x={points[Math.floor(points.length/2)][0]} 
                  y={points[Math.floor(points.length/2)][1] - 20}
                  fill="white"
                  fontSize="24"
                  fontWeight="bold"
                  textAnchor="middle"
                  style={{ textShadow: '0 0 10px black' }}
                >
                  {labels[name]}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="absolute top-4 left-4 flex flex-col">
        <span className="text-[8px] uppercase tracking-widest text-mystic-gold/60 font-bold">{handLabels[handType]}</span>
        <span className="text-[6px] uppercase tracking-widest text-white/20">Geometric Reading Projection</span>
      </div>
    </div>
  );
}
