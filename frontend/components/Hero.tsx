import React, { useEffect, useState, useRef, Suspense } from 'react';
import { motion, useMotionValue, useTransform, useSpring, useScroll } from 'framer-motion';
import Spline from '@splinetool/react-spline';
import { 
  ChevronRight, 
  Zap, 
  Play, 
  ArrowRight,
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  BarChart3,
  Sparkles
} from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

const FloatingCard: React.FC<{ delay: number; children: React.ReactNode; className?: string }> = ({ 
  delay, 
  children, 
  className = "" 
}) => {
  return (
    <motion.div
      className={`absolute ${className}`}
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: [0, -10, 0],
      }}
      transition={{
        opacity: { duration: 0.8, delay },
        scale: { duration: 0.8, delay },
        y: { 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: delay + 1
        }
      }}
    >
      {children}
    </motion.div>
  );
};

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [splineError, setSplineError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const handleSplineRetry = () => {
    if (retryCount < 3) {
      setSplineError(false);
      setRetryCount(prev => prev + 1);
    }
  };
  
  const rotateX = useTransform(mouseY, [-300, 300], [5, -5]);
  const rotateY = useTransform(mouseX, [-300, 300], [-5, 5]);
  
  const springConfig = { damping: 25, stiffness: 100 };
  const x = useSpring(rotateX, springConfig);
  const y = useSpring(rotateY, springConfig);

  // Enhanced scroll-based animations for framer.com style floating elements
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Transform values for different floating elements with varied speeds and directions
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, 350]);
  const x1 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const x2 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const x3 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const x4 = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 35]);
  const rotate2 = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const scale1 = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.1, 0.9]);
  const scale2 = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.95, 1.05]);

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(event.clientX - centerX);
    mouseY.set(event.clientY - centerY);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden" ref={containerRef}>
      {/* Interactive background elements - reduced prominence */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{ rotateX: x, rotateY: y }}
        onMouseMove={handleMouseMove}
      >
        {/* Simplified floating geometric shapes for background ambiance */}
        <FloatingCard delay={0.5} className="top-20 left-10">
          <div className="w-16 h-16 bg-gradient-to-br from-gradient-blue/10 to-gradient-cyan/5 rounded-3xl backdrop-blur-sm border border-white/5 rotate-12" />
        </FloatingCard>
        
        <FloatingCard delay={0.8} className="top-40 right-20">
          <div className="w-12 h-12 bg-gradient-to-br from-gradient-purple/10 to-gradient-violet/5 rounded-full backdrop-blur-sm border border-white/5" />
        </FloatingCard>
        
        <FloatingCard delay={1.1} className="bottom-40 left-20">
          <div className="w-10 h-10 bg-gradient-to-br from-gradient-emerald/10 to-gradient-cyan/5 rounded-2xl backdrop-blur-sm border border-white/5 -rotate-12" />
        </FloatingCard>
        
        <FloatingCard delay={1.4} className="bottom-20 right-10">
          <div className="w-18 h-18 bg-gradient-to-br from-gradient-amber/10 to-gradient-rose/5 rounded-full backdrop-blur-sm border border-white/5" />
        </FloatingCard>
      </motion.div>

      {/* Main Content - Split Layout */}
      <div className="relative w-full max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          
          {/* Left Side - Text Content */}
          <div className="flex flex-col justify-center space-y-8">
            {/* Announcement badge */}
            <motion.div
              className="inline-flex items-center mb-4"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="group relative overflow-hidden px-6 py-3 bg-glass-dark backdrop-blur-xl border border-white/20 rounded-full cursor-pointer hover:border-white/30 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                <div className="relative flex items-center space-x-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap className="w-4 h-4 text-gradient-blue" />
                  </motion.div>
                  <span className="text-sm font-medium text-white">Revolutionizing DeFi Trading</span>
                  <ChevronRight className="w-4 h-4 text-text-secondary group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
            </motion.div>

            {/* Main heading */}
            <motion.div className="space-y-6">
              <motion.h1
                className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span className="block text-white mb-2">Trade Smarter</span>
                <span className="block">
                  <span className="text-white">with </span>
                  <motion.span
                    className="bg-gradient-to-r from-gradient-blue via-gradient-purple to-gradient-cyan bg-clip-text text-transparent"
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{ backgroundSize: '200% 200%' }}
                  >
                    AI Agents
                  </motion.span>
                </span>
              </motion.h1>

              <motion.p
                className="text-lg md:text-xl lg:text-2xl text-text-secondary max-w-2xl leading-relaxed"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Create, monetize, and deploy autonomous trading strategies on the Sui blockchain.
                <br className="hidden md:block" />
                <span className="text-gradient-blue font-semibold">The future of decentralized finance is here.</span>
              </motion.p>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 pt-4"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.button
                onClick={onGetStarted}
                className="group relative px-8 py-4 bg-gradient-primary text-white rounded-full font-bold text-lg overflow-hidden shadow-glow-lg hover:shadow-glow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                />
                <span className="relative flex items-center">
                  🚀 Start Trading Now
                  <motion.div
                    className="ml-3"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </span>
              </motion.button>
              
              <motion.button
                className="group flex items-center px-8 py-4 border-2 border-white/20 text-white rounded-full font-bold text-lg hover:border-gradient-blue hover:bg-gradient-blue/10 transition-all duration-300 backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-5 h-5 mr-3 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                Watch Demo
              </motion.button>
            </motion.div>
          </div>

          {/* Right Side - Spline 3D Element */}
          <div className="relative h-[70vh] lg:h-[80vh] w-full">
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              {!splineError ? (
                <Suspense 
                  fallback={
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gradient-blue"></div>
                    </div>
                  }
                >
                  <div className="w-full h-full">
                    <Spline 
                      scene="https://prod.spline.design/fJ2ptJKzT-sDkpfO/scene.splinecode"
                      style={{ 
                        width: '100%', 
                        height: '100%',
                        border: 'none'
                      }}
                    />
                  </div>
                </Suspense>
              ) : (
                /* Fallback 3D-like placeholder when Spline fails */
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm rounded-2xl border border-white/10">
                  <div className="text-center space-y-6">
                    <motion.div
                      className="w-32 h-32 mx-auto bg-gradient-to-br from-gradient-blue via-gradient-purple to-gradient-cyan rounded-full"
                      animate={{
                        rotateY: [0, 360],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        rotateY: { duration: 4, repeat: Infinity, ease: "linear" },
                        scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                      }}
                      style={{
                        background: 'conic-gradient(from 0deg, #3b82f6, #8b5cf6, #06b6d4, #3b82f6)',
                      }}
                    />
                    <div className="space-y-2">
                      <div className="text-white/60 text-sm">
                        3D Scene Loading Error
                      </div>
                      {retryCount < 3 && (
                        <button 
                          onClick={handleSplineRetry}
                          className="px-4 py-2 bg-gradient-primary text-white text-xs rounded-full hover:scale-105 transition-transform"
                        >
                          Retry ({retryCount}/3)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
