import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, RefreshCw, Check, X, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../lib/i18n';

interface PalmCameraProps {
  onCapture: (image: string) => void;
  onCancel: () => void;
  language: Language;
}

export const PalmCamera = ({ onCapture, onCancel, language }: PalmCameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const t = TRANSLATIONS[language];

  const [showTips, setShowTips] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const newStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 1024 } } 
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError(language === 'en' ? "Failed to start camera. Please check permissions." : "カメラの起動に失敗しました。アクセス許可を確認してください。");
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      const W = video.videoWidth;
      const H = video.videoHeight;
      
      // Target aspect ratio is 3:4 (width / height = 0.75)
      const targetAspect = 0.75;
      let targetWidth = W;
      let targetHeight = H;
      let startX = 0;
      let startY = 0;
      
      if (W / H > targetAspect) {
        // Video is wider than 3:4 (e.g. 16:9 landscape) -> Crop sides
        targetWidth = H * targetAspect;
        startX = (W - targetWidth) / 2;
      } else {
        // Video is taller than 3:4 (e.g. wide portrait) -> Crop top/bottom
        targetHeight = W / targetAspect;
        startY = (H - targetHeight) / 2;
      }
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      const ctx = canvas.getContext('2d', { alpha: false });
      if (ctx) {
        ctx.drawImage(
          video, 
          startX, startY, targetWidth, targetHeight, // Source bounds
          0, 0, targetWidth, targetHeight           // Destination bounds
        );
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        setCapturedImage(dataUrl);
      }
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-md mx-auto">
      <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden border-2 border-mystic-gold/30 shadow-[0_0_50px_rgba(212,175,55,0.2)] bg-black/40 backdrop-blur-md">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
            <RefreshCw className="text-mystic-gold animate-spin" size={32} />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4 z-20 bg-black/80">
            <X className="text-red-400" size={48} />
            <p className="text-sm text-red-100">{error}</p>
            <button 
              onClick={onCancel}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold uppercase transition-colors"
            >
              {t.chat.back}
            </button>
          </div>
        )}

        {!capturedImage ? (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            {/* Guide Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
              <div className="w-full h-full border-2 border-dashed border-mystic-gold/40 rounded-[2rem] flex flex-col items-center justify-center space-y-4">
                <div className="w-32 h-48 border border-mystic-gold/20 rounded-full opacity-30 flex items-center justify-center" />
                <span className="text-[10px] text-mystic-gold/60 uppercase tracking-[0.2em] font-bold bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
                  {t.camera.guide}
                </span>
              </div>
            </div>
            
            <div className="absolute bottom-6 inset-x-0 flex justify-center items-center space-x-12 px-6">
               <button 
                onClick={() => setShowTips(!showTips)}
                className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <Sparkles size={20} />
              </button>

              <button 
                onClick={capturePhoto}
                disabled={isLoading || !!error}
                className="w-20 h-20 rounded-full bg-white border-4 border-mystic-gold shadow-[0_0_30px_rgba(212,175,55,0.4)] flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50"
              >
                <div className="w-16 h-16 rounded-full border-2 border-black/5" />
              </button>

              <div className="w-12 h-12" /> {/* Spacer */}
            </div>

            <AnimatePresence>
              {showTips && (
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  className="absolute inset-0 bg-black/80 backdrop-blur-xl p-8 z-30 flex flex-col justify-center space-y-6"
                >
                  <button 
                    onClick={() => setShowTips(false)}
                    className="absolute top-4 right-4 text-white/40 hover:text-white z-50 p-2"
                  >
                    <X size={24} />
                  </button>
                  <h3 className="text-xl font-serif text-mystic-gold text-center tracking-widest pt-4">
                    {t.camera.tipsTitle}
                  </h3>
                  <ul className="space-y-4 text-sm text-purple-100/80">
                    <li className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-mystic-gold/20 flex items-center justify-center text-[10px] font-bold text-mystic-gold mt-0.5">1</div>
                      <p>{t.camera.tip1}</p>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-mystic-gold/20 flex items-center justify-center text-[10px] font-bold text-mystic-gold mt-0.5">2</div>
                      <p>{t.camera.tip2}</p>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-mystic-gold/20 flex items-center justify-center text-[10px] font-bold text-mystic-gold mt-0.5">3</div>
                      <p>{t.camera.tip3}</p>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-mystic-gold/20 flex items-center justify-center text-[10px] font-bold text-mystic-gold mt-0.5">4</div>
                      <p>{t.camera.tip4}</p>
                    </li>
                  </ul>
                  <button 
                    onClick={() => setShowTips(false)}
                    className="w-full py-4 bg-mystic-gold/20 hover:bg-mystic-gold text-mystic-gold hover:text-black border border-mystic-gold rounded-xl font-bold transition-all"
                  >
                    {t.camera.gotIt}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="relative w-full h-full">
            <img src={capturedImage} className="w-full h-full object-cover" alt="Captured palm" />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center space-y-8">
              <p className="text-white text-sm font-serif tracking-widest animate-pulse">
                {t.camera.capturing}
              </p>
              <div className="flex space-x-12">
                <button 
                  onClick={handleRetake}
                  className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors group"
                  title={t.camera.retake}
                >
                  <RefreshCw className="text-white group-hover:rotate-180 transition-transform duration-500" size={28} />
                </button>
                <button 
                  onClick={handleConfirm}
                  className="w-16 h-16 rounded-full bg-mystic-gold flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:scale-110 active:scale-95 transition-transform"
                  title={t.camera.confirm}
                >
                  <Check className="text-black" size={32} />
                </button>
              </div>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="text-center px-4">
        <h4 className="text-lg font-serif text-white tracking-widest flex items-center justify-center space-x-2">
          <Sparkles size={16} className="text-mystic-gold animate-pulse" />
          <span>{t.camera.title}</span>
        </h4>
        <p className="text-xs text-purple-200/60 mt-1 italic">
          {t.camera.subtitle}
        </p>
      </div>

      <button 
        onClick={onCancel}
        className="text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors"
      >
        {t.camera.cancel}
      </button>
    </div>
  );
};
