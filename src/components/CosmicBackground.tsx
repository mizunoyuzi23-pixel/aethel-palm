import { motion } from 'motion/react';

export default function CosmicBackground() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="fixed inset-0 z-[40] bg-[#0d0d2b] pointer-events-none"
    >
      {/* Radiant Space Base */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#4a3b82_0%,_#0d0d2b_100%)] opacity-90" />

      {/* Primary Luminous Nebula - Maximum Contrast & Scaled to hide edges */}
      <motion.div
        animate={{
          scale: [1.3, 1.45, 1.3],
          opacity: [0.9, 1, 0.9],
          rotate: [0, 3, 0],
          filter: ["hue-rotate(0deg) brightness(1.2)", "hue-rotate(15deg) brightness(1.4)", "hue-rotate(0deg) brightness(1.2)"]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -inset-[20%] w-[140%] h-[140%]"
      >
        <img
          src="https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=format&fit=crop&q=80&w=2000"
          alt="Glowing Nebula"
          className="w-full h-full object-cover mix-blend-screen opacity-100"
        />
      </motion.div>

      {/* Secondary Vibrant Star Field - Super Bright & Large Scale */}
      <motion.div
        animate={{
          rotate: [0, 8, 0],
          scale: [1.6, 1.4, 1.6],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -inset-[30%] w-[160%] h-[160%] opacity-80"
      >
        <img
          src="https://images.unsplash.com/photo-1465101162946-4377e57745c3?auto=format&fit=crop&q=80&w=2000"
          alt="Bright Galaxy"
          className="w-full h-full object-cover mix-blend-color-dodge brightness-125"
        />
      </motion.div>

      {/* Core Radiance Overlays - Intense Light */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(180,120,255,0.5)_0%,_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.25)_0%,_transparent_25%)] shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
      
      {/* High-visibility Star Fields */}
      <div className="stars-overlay opacity-100 brightness-150" />
      <div className="stars-overlay opacity-80 rotate-90 scale-125 brightness-125" />
      <div className="stars-overlay opacity-60 -rotate-45 scale-150 brightness-110" />
    </motion.div>
  );
}
