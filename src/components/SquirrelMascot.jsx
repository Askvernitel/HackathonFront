import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const variants = {
  initial: { y: '110%' },
  animate: {
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 22 },
  },
  exit: {
    y: '110%',
    transition: { duration: 0.45, ease: [0.4, 0, 1, 1] },
  },
};

export default function SquirrelMascot() {
  const [entry, setEntry] = useState(null); // { id, clip } | null
  const videoRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      setEntry(prev =>
        // Reuse same id when already visible so AnimatePresence keeps the
        // component mounted (no exit/enter), only the video src swaps.
        prev ? { id: prev.id, clip: e.detail.clip } : { id: Date.now(), clip: e.detail.clip }
      );
    }
    window.addEventListener('mascot', handler);
    return () => window.removeEventListener('mascot', handler);
  }, []);

  useEffect(() => {
    if (!entry || !videoRef.current) return;
    videoRef.current.load();
    videoRef.current.play().catch(() => {});
  }, [entry]);

  function handleEnded() {
    videoRef.current?.pause(); // freeze on last frame while exit animation plays
    setEntry(null);
  }

  return (
    <AnimatePresence>
      {entry && (
        <motion.div
          key={entry.id}
          className="squirrel-mascot"
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <video
            ref={videoRef}
            src={`/assets/videos/${entry.clip}.webm`}
            onEnded={handleEnded}
            muted
            playsInline
            style={{ display: 'block', width: '100%', height: 'auto' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
