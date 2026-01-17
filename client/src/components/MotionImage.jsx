import { motion, useReducedMotion } from 'framer-motion';

export default function MotionImage({
  className = '',
  hoverScale = 1.04,
  ...props
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.img
      {...props}
      className={className}
      loading={props.loading ?? 'lazy'}
      decoding={props.decoding ?? 'async'}
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 14, scale: 0.99 }}
      whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      whileHover={shouldReduceMotion ? undefined : { scale: hoverScale }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
      }
    />
  );
}
