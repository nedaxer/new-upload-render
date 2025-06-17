import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TransformerLogo } from './transformer-logo';
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
    }, 10000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Generate chart points that flow towards the center (logo position)
  const generateFlowingPoints = (startX: number, startY: number, endX: number, endY: number, count: number) => {
    const points = [];
    for (let i = 0; i < count; i++) {
      const progress = i / (count - 1);
      const x = startX + (endX - startX) * progress;
      const y = startY + (endY - startY) * progress + Math.sin(progress * Math.PI * 4) * 30;
      points.push({ x, y });
    }
    return points;
  };

  // Create flowing paths from each edge towards the center logo
  const centerX = 200;
  const centerY = 200;
  
  // Top to center
  const topFlowPoints = generateFlowingPoints(50, 50, centerX, centerY, 15);
  // Right to center  
  const rightFlowPoints = generateFlowingPoints(350, 100, centerX, centerY, 15);
  // Bottom to center
  const bottomFlowPoints = generateFlowingPoints(300, 350, centerX, centerY, 15);
  // Left to center
  const leftFlowPoints = generateFlowingPoints(50, 300, centerX, centerY, 15);

  const createFlowingPath = (points: { x: number; y: number }[]) => {
    return points.reduce((path, point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }
      const prevPoint = points[index - 1];
      const controlX = (prevPoint.x + point.x) / 2;
      const controlY = (prevPoint.y + point.y) / 2;
      return `${path} Q ${controlX} ${controlY} ${point.x} ${point.y}`;
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
          {/* Animated Trading Chart Lines Flowing Towards Logo */}
          <div className="absolute inset-0 overflow-hidden">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
              {/* Top Flow Line */}
              <motion.path
                d={createFlowingPath(topFlowPoints)}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: [0, 1, 0], 
                  opacity: [0, 1, 0.8, 1, 0.6],
                  stroke: ['#fbbf24', '#f59e0b', '#d97706', '#fbbf24'],
                  filter: [
                    'drop-shadow(0 0 5px #fbbf24)',
                    'drop-shadow(0 0 15px #f59e0b)',
                    'drop-shadow(0 0 5px #fbbf24)'
                  ]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  times: [0, 0.3, 0.6, 1]
                }}
              />
              
              {/* Right Flow Line */}
              <motion.path
                d={createFlowingPath(rightFlowPoints)}
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: [0, 1, 0], 
                  opacity: [0, 1, 0.7, 1, 0.5],
                  stroke: ['#10b981', '#059669', '#047857', '#10b981'],
                  filter: [
                    'drop-shadow(0 0 5px #10b981)',
                    'drop-shadow(0 0 15px #059669)',
                    'drop-shadow(0 0 5px #10b981)'
                  ]
                }}
                transition={{ 
                  duration: 5.5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 1,
                  times: [0, 0.3, 0.6, 1]
                }}
              />
              
              {/* Bottom Flow Line */}
              <motion.path
                d={createFlowingPath(bottomFlowPoints)}
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: [0, 1, 0], 
                  opacity: [0, 1, 0.8, 1, 0.4],
                  stroke: ['#ef4444', '#dc2626', '#b91c1c', '#ef4444'],
                  filter: [
                    'drop-shadow(0 0 5px #ef4444)',
                    'drop-shadow(0 0 15px #dc2626)',
                    'drop-shadow(0 0 5px #ef4444)'
                  ]
                }}
                transition={{ 
                  duration: 7, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 2,
                  times: [0, 0.3, 0.6, 1]
                }}
              />
              
              {/* Left Flow Line */}
              <motion.path
                d={createFlowingPath(leftFlowPoints)}
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: [0, 1, 0], 
                  opacity: [0, 1, 0.9, 1, 0.3],
                  stroke: ['#8b5cf6', '#7c3aed', '#6d28d9', '#8b5cf6'],
                  filter: [
                    'drop-shadow(0 0 5px #8b5cf6)',
                    'drop-shadow(0 0 15px #7c3aed)',
                    'drop-shadow(0 0 5px #8b5cf6)'
                  ]
                }}
                transition={{ 
                  duration: 6.5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 3,
                  times: [0, 0.3, 0.6, 1]
                }}
              />
              
              {/* Additional flowing particles along paths */}
              {[...Array(8)].map((_, i) => (
                <motion.circle
                  key={i}
                  r="2"
                  fill={['#fbbf24', '#10b981', '#ef4444', '#8b5cf6'][i % 4]}
                  initial={{ opacity: 0 }}
                  animate={{
                    cx: [50 + (i * 40), centerX],
                    cy: [50 + (i * 35), centerY],
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.5, 0.5]
                  }}
                  transition={{
                    duration: 4 + (i * 0.3),
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeInOut"
                  }}
                />
              ))}
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
            {/* Transformer Logo Animation */}
            <motion.div
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ 
                duration: 1, 
                ease: "easeOut",
                delay: 1
              }}
              className="relative"
            >
              <TransformerLogo 
                autoStart={true}
                className="scale-150 md:scale-[2]"
              />
              
              {/* Enhanced Energy Rings Around Transformer Logo */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-yellow-400/30"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.8, 0.3],
                  borderColor: ['rgba(251, 191, 36, 0.3)', 'rgba(16, 185, 129, 0.5)', 'rgba(251, 191, 36, 0.3)']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
              />
              
              {/* Second Energy Ring */}
              <motion.div
                className="absolute inset-0 rounded-full border border-green-400/20"
                animate={{
                  scale: [1.3, 1.8, 1.3],
                  opacity: [0.2, 0.6, 0.2],
                  borderColor: ['rgba(16, 185, 129, 0.2)', 'rgba(139, 92, 246, 0.4)', 'rgba(16, 185, 129, 0.2)']
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2.5
                }}
              />
              
              {/* Outer Energy Ring */}
              <motion.div
                className="absolute inset-0 rounded-full border border-purple-400/15"
                animate={{
                  scale: [1.6, 2.2, 1.6],
                  opacity: [0.1, 0.4, 0.1],
                  borderColor: ['rgba(139, 92, 246, 0.15)', 'rgba(239, 68, 68, 0.3)', 'rgba(139, 92, 246, 0.15)']
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 3
                }}
              />
            </motion.div>

            {/* Enhanced Welcome Message */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.5, delay: 3, ease: "easeOut" }}
              className="text-center space-y-4"
            >
              <motion.h1
                className="text-3xl md:text-4xl font-bold text-white"
                animate={{
                  textShadow: [
                    '0 0 15px rgba(255,255,255,0.6)',
                    '0 0 25px rgba(251, 191, 36, 0.8)',
                    '0 0 20px rgba(16, 185, 129, 0.7)',
                    '0 0 15px rgba(255,255,255,0.6)',
                  ],
                  scale: [1, 1.02, 0.98, 1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.33, 0.66, 1]
                }}
              >
                Thanks for choosing us
              </motion.h1>
              
              <motion.p
                className="text-xl text-blue-100 font-medium"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: [0, 1, 0.8, 1], 
                  y: 0,
                  textShadow: [
                    '0 0 5px rgba(96, 165, 250, 0.5)',
                    '0 0 10px rgba(96, 165, 250, 0.8)',
                    '0 0 5px rgba(96, 165, 250, 0.5)',
                  ]
                }}
                transition={{ 
                  duration: 2, 
                  delay: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Welcome to Nedaxer
              </motion.p>
              
              <motion.p
                className="text-sm text-blue-200/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.7, 1] }}
                transition={{ duration: 2, delay: 5, repeat: Infinity }}
              >
                Your Advanced Trading Platform
              </motion.p>
            </motion.div>

            {/* Enhanced Loading Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 6 }}
              className="flex space-x-3"
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: ['#fbbf24', '#10b981', '#ef4444', '#8b5cf6', '#60a5fa'][i]
                  }}
                  animate={{
                    scale: [1, 1.8, 1],
                    opacity: [0.4, 1, 0.4],
                    y: [0, -10, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </motion.div>
          </div>

          {/* Enhanced Progress Bar */}
          <motion.div
            className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-80 space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 7 }}
          >
            <motion.p
              className="text-center text-sm text-blue-200"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Initializing your trading experience...
            </motion.p>
            
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #fbbf24 0%, #10b981 25%, #ef4444 50%, #8b5cf6 75%, #60a5fa 100%)'
                }}
                initial={{ width: 0 }}
                animate={{ 
                  width: '100%',
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ 
                  width: { duration: 3, ease: "easeOut", delay: 7 },
                  backgroundPosition: { duration: 2, repeat: Infinity, ease: "linear" }
                }}
              />
            </div>
            
            {/* Progress percentage */}
            <motion.div
              className="text-center text-xs text-blue-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 8 }}
            >
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Loading complete...
              </motion.span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}