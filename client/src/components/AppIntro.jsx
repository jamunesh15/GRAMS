import { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import GramsLogo from './GramsLogo';

export default function AppIntro({ show, onDone }) {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!show) return;

    const timeoutMs = shouldReduceMotion ? 0 : 1400;
    const timeoutId = setTimeout(() => {
      onDone?.();
    }, timeoutMs);

    return () => clearTimeout(timeoutId);
  }, [show, onDone, shouldReduceMotion]);

  const overlayTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.7, ease: [0.22, 1, 0.36, 1] };

  const contentTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.8, ease: [0.22, 1, 0.36, 1] };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[60] bg-slate-50"
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 1 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
          transition={overlayTransition}
        >
          <motion.div
            className="h-full w-full flex items-center justify-center"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 14, scale: 0.98 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.99 }}
            transition={contentTransition}
          >
            <div className="flex items-center gap-3">
              <GramsLogo size={38} />
              <div className="leading-tight">
                <div className="text-slate-900 font-extrabold text-xl">GRAMS</div>
                <div className="text-green-700 text-xs font-bold uppercase">Portal</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
