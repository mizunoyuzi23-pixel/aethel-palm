import { motion } from 'motion/react';
import { Sparkles, UserCircle } from 'lucide-react';

interface AIPortraitProps {
  isSpeaking?: boolean;
  imageUrl?: string;
}

export default function AIPortrait({ isSpeaking, imageUrl }: AIPortraitProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <motion.div 
        className="relative"
        animate={{
          scale: isSpeaking ? [1, 1.02, 1] : 1,
        }}
        transition={{
          repeat: Infinity,
          duration: 2,
        }}
      >
        {/* Glow Effects */}
        <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full -z-10" />
        <div className="absolute -inset-4 bg-purple-400/5 blur-2xl rounded-full -z-10" />
        
        {/* Portrait Circle */}
        <div className="w-64 h-64 rounded-full border-2 border-mystic-gold/30 flex items-center justify-center bg-zinc-900/80 backdrop-blur-md overflow-hidden relative group">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border border-dashed border-mystic-gold/10 rounded-full"
          />
          
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt="Oracle Aethel" 
              className="w-full h-full object-cover grayscale-[0.3] sepia-[0.2] transition-all group-hover:grayscale-0 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2 opacity-40">
              <Sparkles className="w-16 h-16 text-mystic-gold animate-pulse" />
              <p className="text-[10px] uppercase tracking-widest text-mystic-gold">姿を現すのを待っています...</p>
            </div>
          )}
          
          {/* Overlay shine & scanline effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,128,0.03))] bg-[size:100%_2px,3px_100%] pointer-events-none opacity-20" />
        </div>
      </motion.div>
      
      <div className="text-center">
        <h2 className="text-2xl font-serif text-mystic-gold tracking-widest uppercase">占い師 エーテル</h2>
        <p className="text-[10px] text-purple-300/40 uppercase tracking-[0.2em]">高次元の知性と繋がる者</p>
      </div>
    </div>
  );
}
