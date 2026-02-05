 import { useEffect, useState, useCallback } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import confetti from "canvas-confetti";
 import { PartyPopper, Sparkles, Heart } from "lucide-react";
 
 interface CelebrationOverlayProps {
   show: boolean;
   duration?: number; // in seconds
   onComplete?: () => void;
 }
 
 export const CelebrationOverlay = ({
   show,
   duration = 30,
   onComplete,
 }: CelebrationOverlayProps) => {
   const [timeRemaining, setTimeRemaining] = useState(duration);
 
   const fireConfetti = useCallback(() => {
     // Left side
     confetti({
       particleCount: 100,
       spread: 70,
       origin: { x: 0, y: 0.6 },
       colors: ["#ff6b6b", "#feca57", "#48dbfb", "#ff9ff3", "#54a0ff"],
     });
 
     // Right side
     confetti({
       particleCount: 100,
       spread: 70,
       origin: { x: 1, y: 0.6 },
       colors: ["#ff6b6b", "#feca57", "#48dbfb", "#ff9ff3", "#54a0ff"],
     });
 
     // Center burst
     confetti({
       particleCount: 50,
       spread: 360,
       startVelocity: 30,
       origin: { x: 0.5, y: 0.5 },
       colors: ["#ff6b6b", "#feca57", "#48dbfb", "#ff9ff3", "#54a0ff"],
     });
   }, []);
 
   useEffect(() => {
     if (!show) {
       setTimeRemaining(duration);
       return;
     }
 
     // Initial confetti burst
     fireConfetti();
 
     // Confetti bursts every 3 seconds
     const confettiInterval = setInterval(() => {
       fireConfetti();
     }, 3000);
 
     // Countdown timer
     const countdownInterval = setInterval(() => {
       setTimeRemaining((prev) => {
         if (prev <= 1) {
           clearInterval(confettiInterval);
           clearInterval(countdownInterval);
           onComplete?.();
           return 0;
         }
         return prev - 1;
       });
     }, 1000);
 
     return () => {
       clearInterval(confettiInterval);
       clearInterval(countdownInterval);
     };
   }, [show, duration, fireConfetti, onComplete]);
 
   return (
     <AnimatePresence>
       {show && (
         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md"
         >
           <motion.div
             initial={{ scale: 0.5, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             exit={{ scale: 0.5, opacity: 0 }}
             transition={{ type: "spring", damping: 15 }}
             className="text-center px-6"
           >
             {/* Animated icons */}
             <div className="flex justify-center gap-4 mb-6">
               <motion.div
                 animate={{ rotate: [0, -20, 20, 0], y: [0, -10, 0] }}
                 transition={{ duration: 1, repeat: Infinity }}
               >
                 <PartyPopper className="w-12 h-12 sm:w-16 sm:h-16 text-accent" />
               </motion.div>
               <motion.div
                 animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                 transition={{ duration: 2, repeat: Infinity }}
               >
                 <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
               </motion.div>
               <motion.div
                 animate={{ rotate: [0, 20, -20, 0], y: [0, -10, 0] }}
                 transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
               >
                 <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-destructive" />
               </motion.div>
             </div>
 
             {/* Main text */}
             <motion.h1
               className="font-display text-4xl sm:text-6xl md:text-8xl font-bold gradient-text mb-4"
               animate={{ scale: [1, 1.05, 1] }}
               transition={{ duration: 2, repeat: Infinity }}
             >
               🎉 Congratulations! 🎉
             </motion.h1>
 
             <motion.p
               className="text-xl sm:text-2xl md:text-3xl text-muted-foreground mb-6"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
             >
               The reunion time has arrived!
             </motion.p>
 
             <motion.p
               className="text-lg sm:text-xl text-primary font-semibold"
               animate={{ opacity: [1, 0.6, 1] }}
               transition={{ duration: 1.5, repeat: Infinity }}
             >
               Welcome to our special day! 🌟
             </motion.p>
 
             {/* Timer */}
             <motion.div
               className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.5 }}
             >
               <span className="text-sm text-muted-foreground">
                 Closing in {timeRemaining}s
               </span>
             </motion.div>
           </motion.div>
         </motion.div>
       )}
     </AnimatePresence>
   );
 };