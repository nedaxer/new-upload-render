import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImage from '@assets/IMG-20250617-WA0042_1750199488699.png';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for exit animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Generate random trading chart points for animation
  const generateChartPoints = (count: number, width: number, height: number) => {
    const points = [];
    for (let i = 0; i < count; i++) {
      points.push({
        x: (width / count) * i,
        y: height * 0.3 + Math.random() * height * 0.4,
      });
    }
    return points;
  };

  const chartPoints1 = generateChartPoints(20, 400, 200);
  const chartPoints2 = generateChartPoints(25, 400, 200);
  const chartPoints3 = generateChartPoints(18, 400, 200);

  const createPath = (points: { x: number; y: number }[]) => {
    return points.reduce((path, point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }
      const prevPoint = points[index - 1];
      const controlX = (prevPoint.x + point.x) / 2;
      return `${path} Q ${controlX} ${prevPoint.y} ${point.x} ${point.y}`;
    }, '');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0a1929 0%, #1e3a8a 25%, #1e40af 50%, #3b82f6 75%, #60a5fa 100%)'
          }}
        >
          {/* Animated Trading Chart Lines */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Top Edge Charts */}
            <svg className="absolute top-0 left-0 w-full h-32" viewBox="0 0 400 200">
              <motion.path
                d={createPath(chartPoints1)}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: 1, 
                  opacity: [0, 1, 0.7, 1, 0.5],
                  stroke: ['#fbbf24', '#f59e0b', '#d97706', '#92400e', '#fbbf24']
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  times: [0, 0.25, 0.5, 0.75, 1]
                }}
              />
            </svg>

            {/* Right Edge Charts */}
            <svg className="absolute top-1/4 right-0 w-32 h-full" viewBox="0 0 200 400">
              <motion.path
                d={createPath(chartPoints2.map(p => ({ x: p.y, y: p.x })))}
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: 1, 
                  opacity: [0, 1, 0.6, 1, 0.4],
                  stroke: ['#10b981', '#059669', '#047857', '#065f46', '#10b981']
                }}
                transition={{ 
                  duration: 3.5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 0.5,
                  times: [0, 0.25, 0.5, 0.75, 1]
                }}
              />
            </svg>

            {/* Bottom Edge Charts */}
            <svg className="absolute bottom-0 left-0 w-full h-32" viewBox="0 0 400 200">
              <motion.path
                d={createPath(chartPoints3)}
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: 1, 
                  opacity: [0, 1, 0.8, 1, 0.6],
                  stroke: ['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#ef4444']
                }}
                transition={{ 
                  duration: 4.5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 1,
                  times: [0, 0.25, 0.5, 0.75, 1]
                }}
              />
            </svg>

            {/* Left Edge Charts */}
            <svg className="absolute top-1/4 left-0 w-32 h-full" viewBox="0 0 200 400">
              <motion.path
                d={createPath(chartPoints1.map(p => ({ x: p.y, y: p.x })))}
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: 1, 
                  opacity: [0, 1, 0.7, 1, 0.3],
                  stroke: ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#8b5cf6']
                }}
                transition={{ 
                  duration: 3.8, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 1.5,
                  times: [0, 0.25, 0.5, 0.75, 1]
                }}
              />
            </svg>
          </div>

          {/* Floating Particles */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}

          {/* Main Logo Container */}
          <div className="relative z-10 flex flex-col items-center space-y-8">
            {/* Logo with Pop Animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ 
                scale: [0, 1.2, 1], 
                rotate: [0, 10, -10, 0],
              }}
              transition={{ 
                duration: 1.5, 
                ease: "easeOut",
                times: [0, 0.6, 1]
              }}
              className="relative"
            >
              <motion.img
                src={logoImage}
                alt="Nedaxer Logo"
                className="w-32 h-32 md:w-40 md:h-40 object-contain filter drop-shadow-2xl"
                animate={{
                  filter: [
                    'drop-shadow(0 0 20px rgba(251, 191, 36, 0.5))',
                    'drop-shadow(0 0 30px rgba(251, 191, 36, 0.8))',
                    'drop-shadow(0 0 20px rgba(251, 191, 36, 0.5))',
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Pulsing Ring Around Logo */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-yellow-400/30"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>

            {/* Welcome Message */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="text-center space-y-2"
            >
              <motion.h1
                className="text-2xl md:text-3xl font-bold text-white"
                animate={{
                  textShadow: [
                    '0 0 10px rgba(255,255,255,0.5)',
                    '0 0 20px rgba(255,255,255,0.8)',
                    '0 0 10px rgba(255,255,255,0.5)',
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Thanks for choosing us
              </motion.h1>
              
              <motion.p
                className="text-lg text-blue-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 2 }}
              >
                Welcome to Nedaxer
              </motion.p>
            </motion.div>

            {/* Loading Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 2.5 }}
              className="flex space-x-2"
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-white rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </motion.div>
          </div>

          {/* Progress Bar */}
          <motion.div
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-64 h-1 bg-white/20 rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: "easeOut", delay: 3 }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}