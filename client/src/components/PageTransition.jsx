import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const SWIPE_CONFIDENCE_THRESHOLD_PX = 120;

function useCoarsePointer() {
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(pointer: coarse)');

    const update = () => setIsCoarsePointer(Boolean(mediaQuery.matches));
    update();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', update);
      return () => mediaQuery.removeEventListener('change', update);
    }

    mediaQuery.addListener(update);
    return () => mediaQuery.removeListener(update);
  }, []);

  return isCoarsePointer;
}

export default function PageTransition({ children }) {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const isCoarsePointer = useCoarsePointer();

  const variants = shouldReduceMotion
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 }
      }
    : {
        initial: { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -14 }
      };

  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.42, ease: [0.22, 1, 0.36, 1] };

  const enableSwipe = isCoarsePointer && !shouldReduceMotion;

  return (
    <motion.main
      className="min-h-screen"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={transition}
      drag={enableSwipe ? 'x' : false}
      dragConstraints={enableSwipe ? { left: 0, right: 0 } : undefined}
      dragElastic={enableSwipe ? 0.12 : undefined}
      onDragEnd={
        enableSwipe
          ? (_event, info) => {
              if (info.offset.x > SWIPE_CONFIDENCE_THRESHOLD_PX) {
                navigate(-1);
              } else if (info.offset.x < -SWIPE_CONFIDENCE_THRESHOLD_PX) {
                navigate(1);
              }
            }
          : undefined
      }
    >
      {children}
    </motion.main>
  );
}
