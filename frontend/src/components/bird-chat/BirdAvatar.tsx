import React, { useMemo } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { BirdExpression } from '../../types/chat';

interface BirdAvatarProps {
  expression: BirdExpression;
  size?: number;
  className?: string;
}

const BirdAvatar: React.FC<BirdAvatarProps> = ({ 
  expression, 
  size = 64, 
  className = '' 
}) => {
  const controls = useAnimation();

  // Animation variants for different expressions
  const getAnimationVariants = () => {
    switch (expression) {
      case 'happy':
        return {
          idle: {
            y: [0, -4, 0],
            rotate: [0, 2, 0],
            transition: {
              y: { duration: 2, repeat: Infinity, ease: "easeInOut" as const },
              rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" as const }
            }
          }
        };
      case 'thinking':
        return {
          idle: {
            y: [0, -2, 0],
            rotate: [-5, 5, -5],
            transition: {
              y: { duration: 3, repeat: Infinity, ease: "easeInOut" as const },
              rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" as const }
            }
          }
        };
      case 'excited':
        return {
          idle: {
            scale: [1, 1.1, 1],
            y: [0, -8, 0],
            transition: {
              scale: { duration: 0.5, repeat: Infinity, ease: "easeInOut" as const },
              y: { duration: 0.8, repeat: Infinity, ease: "easeInOut" as const }
            }
          }
        };
      case 'listening':
        return {
          idle: {
            scale: [1, 1.05, 1],
            transition: {
              scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const }
            }
          }
        };
      default:
        return {
          idle: {
            y: [0, -4, 0],
            transition: {
              y: { duration: 2, repeat: Infinity, ease: "easeInOut" as const }
            }
          }
        };
    }
  };

  const variants = getAnimationVariants();

  return (
    <motion.div
      className={`relative ${className}`}
      animate={controls}
      variants={variants}
      initial="idle"
      custom={expression}
    >
      {/* Bird Body */}
      <motion.div
        className="relative"
        style={{ width: size, height: size }}
      >
        {/* Main Body - Red Holographic Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF0000] via-[#E40000] to-[#FF0000] rounded-full shadow-lg shadow-[#FF0000]/50" />
        
        {/* Holographic Grid Overlay */}
        <div className="absolute inset-0 rounded-full border-2 border-[#FF0000]/30" />
        
        {/* Wing - Red Accent */}
        <motion.div
          className="absolute top-1/2 right-1 bg-gradient-to-br from-[#FF0000] to-[#E40000] rounded-full shadow-lg shadow-[#FF0000]/50"
          style={{ 
            width: size * 0.4, 
            height: size * 0.3,
            transform: 'translateY(-50%)'
          }}
          animate={{
            x: expression === 'excited' ? [-10, 10, -10] : 0,
            transition: {
              x: { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
            }
          }}
        />
        
        {/* Eye - Red Design */}
        <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-white rounded-full border-2 border-[#FF0000] shadow-[#FF0000]_0_0_10px">
          <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-[#FF0000] rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-[#FF0000]_0_0_15px" />
        </div>
        
        {/* Beak - Red Accent */}
        <div className="absolute top-1/2 left-3/4 w-3 h-2 bg-gradient-to-r from-[#FF0000] to-[#E40000] rounded-r-full transform -translate-y-1/2 shadow-[#FF0000]_0_0_10px" />
        
        {/* Tail - Red Accent */}
        <div className="absolute top-1/2 right-0 w-3 h-4 bg-gradient-to-r from-[#FF0000] to-[#E40000] transform -translate-y-1/2 rotate-45 shadow-[#FF0000]_0_0_15px" />
        
        {/* Hover interaction overlay - Red Glow */}
        <motion.div
          className="absolute inset-0 rounded-full bg-[#FF0000]/0 hover:bg-[#FF0000]/20 transition-colors cursor-pointer border-2 border-transparent"
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 0 30px #FF0000, 0 0 60px #E40000",
            borderColor: "#FF0000"
          }}
          whileTap={{ scale: 0.95 }}
        />
      </motion.div>

      {/* Expression Overlay - Red Style */}
      {expression === 'thinking' && (
        <motion.div
          className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-r from-[#FF0000] to-[#E40000] rounded-full flex items-center justify-center text-xs shadow-lg shadow-[#FF0000]/50 border border-[#FF0000]/50"
          animate={{ y: [-5, 0, -5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-white font-bold">💭</span>
        </motion.div>
      )}

      {expression === 'excited' && (
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-[#FF0000] to-[#E40000] rounded-full shadow-lg shadow-[#FF0000]/70"
          animate={{ scale: [0, 1.5, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}

      {expression === 'listening' && (
        <motion.div
          className="absolute -top-1 -left-1 w-3 h-3 bg-gradient-to-r from-[#FF0000] to-[#E40000] rounded-full shadow-lg shadow-[#FF0000]/70"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};

export default BirdAvatar;