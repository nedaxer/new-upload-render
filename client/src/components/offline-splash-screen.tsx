import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OfflineSplashScreenProps {
  onComplete: () => void;
}

export const OfflineSplashScreen: React.FC<OfflineSplashScreenProps> = ({ onComplete }) => {
  const [showLogo, setShowLogo] = useState(true);
  const [hideOriginals, setHideOriginals] = useState(false);
  const [showClones, setShowClones] = useState(false);
  const [showNedaxerLogo, setShowNedaxerLogo] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Letters for 3-second launch animation using cached offline assets
  const letters = [
    { src: '/splash-assets/letter-n.png', alt: 'N', from: { x: -windowSize.width, y: 0 }, delay: 0 },
    { src: '/splash-assets/letter-e1.png', alt: 'E', from: { x: windowSize.width, y: 0 }, delay: 0.1 },
    { src: '/splash-assets/letter-d.png', alt: 'D', from: { x: -windowSize.width, y: 0 }, delay: 0.2 },
    { src: '/splash-assets/letter-a.png', alt: 'A', from: { x: windowSize.width, y: 0 }, delay: 0.3 },
    { src: '/splash-assets/letter-x.png', alt: 'X', from: { x: -windowSize.width, y: 0 }, delay: 0.4 },
    { src: '/splash-assets/letter-e2.png', alt: 'E', from: { x: windowSize.width, y: 0 }, delay: 0.5 },
    { src: '/splash-assets/letter-r.png', alt: 'R', from: { x: -windowSize.width, y: 0 }, delay: 0.6 },
  ];

  useEffect(() => {
    // Show clones and hide originals after letters are arranged
    const clonesTimer = setTimeout(() => {
      setHideOriginals(true);
      setShowClones(true);
    }, 800); // 0.8 seconds for letters to arrange

    // Show NEDAXER logo after clones disappear
    const nedaxerLogoTimer = setTimeout(() => {
      setShowClones(false);
      setShowNedaxerLogo(true);
    }, 1300); // 1.3 seconds total

    // Complete animation after exactly 3 seconds
    const timer = setTimeout(() => {
      setShowLogo(false);
      setTimeout(onComplete, 300); // Quick fade out
    }, 3000); // Exactly 3 seconds

    return () => {
      clearTimeout(clonesTimer);
      clearTimeout(nedaxerLogoTimer);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {showLogo && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backgroundImage: 'url(/splash-assets/background.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Letters Animation */}
          <div className="relative">
            {letters.map((letter, index) => (
              <motion.img
                key={index}
                src={letter.src}
                alt={letter.alt}
                className={`absolute w-12 h-auto ${hideOriginals ? 'opacity-0' : 'opacity-100'}`}
                initial={{
                  x: letter.from.x,
                  y: letter.from.y,
                  opacity: 0,
                }}
                animate={{
                  x: index * 60 - 180,
                  y: 0,
                  opacity: hideOriginals ? 0 : 1,
                }}
                transition={{
                  delay: letter.delay,
                  duration: 0.8,
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                }}
                style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
              />
            ))}
          </div>

          {/* Cloned letters for jumping effect */}
          <AnimatePresence>
            {showClones && (
              <div className="absolute inset-0 flex items-center justify-center">
                {letters.map((letter, index) => (
                  <motion.img
                    key={`clone-${index}`}
                    src={letter.src}
                    alt={letter.alt}
                    className="w-12 h-auto mx-1"
                    initial={{ y: 0, opacity: 1 }}
                    animate={{ 
                      y: [0, -20, 0, -10, 0],
                      opacity: 1
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                      delay: index * 0.1,
                      duration: 0.8,
                      ease: "easeInOut",
                      repeat: 0
                    }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* NEDAXER Logo Display */}
          <AnimatePresence>
            {showNedaxerLogo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center z-20"
              >
                <motion.img
                  src="/splash-assets/nedaxer-logo.png"
                  alt="NEDAXER"
                  className="w-40 h-16 object-contain"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Thanks message at bottom */}
          <motion.div
            className="absolute bottom-8 left-0 right-0 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <p className="text-white text-sm font-medium tracking-wide">
              Welcome to the future of trading & investing
            </p>
            <p className="text-white/80 text-xs font-light tracking-wide mt-1">
              Thank you for choosing Nedaxer
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};