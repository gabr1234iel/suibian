import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Users, TrendingUp } from 'lucide-react';

interface CallToActionProps {
  onGetStarted: () => void;
}

const FloatingIcon: React.FC<{ 
  icon: React.ReactNode; 
  className: string; 
  delay: number;
  size?: 'sm' | 'md' | 'lg';
}> = ({ icon, className, delay, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 p-2',
    md: 'w-12 h-12 p-3',
    lg: 'w-16 h-16 p-4',
  };

  return (
    <motion.div
      className={`absolute ${className} ${sizeClasses[size]} bg-glass-white backdrop-blur-xl border border-white/20 rounded-2xl`}
      initial={{ opacity: 0, scale: 0, rotate: -180 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        rotate: 0,
        y: [0, -10, 0],
      }}
      transition={{
        opacity: { duration: 0.6, delay },
        scale: { duration: 0.6, delay },
        rotate: { duration: 0.8, delay },
        y: { 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: delay + 1
        }
      }}
      whileHover={{ scale: 1.2, rotate: 360 }}
    >
      {icon}
    </motion.div>
  );
};

const CallToAction: React.FC<CallToActionProps> = ({ onGetStarted }) => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef} className="flex items-center justify-center min-h-screen px-6 py-32 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-radial from-gradient-blue/10 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-radial from-gradient-purple/10 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Floating icons */}
      <FloatingIcon
        icon={<Sparkles className="w-full h-full text-gradient-blue" />}
        className="top-20 left-20"
        delay={0.2}
        size="md"
      />
      
      <FloatingIcon
        icon={<Zap className="w-full h-full text-gradient-amber" />}
        className="top-40 right-20"
        delay={0.4}
        size="sm"
      />
      
      <FloatingIcon
        icon={<Users className="w-full h-full text-gradient-purple" />}
        className="bottom-40 left-32"
        delay={0.6}
        size="lg"
      />
      
      <FloatingIcon
        icon={<TrendingUp className="w-full h-full text-gradient-emerald" />}
        className="bottom-20 right-32"
        delay={0.8}
        size="md"
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main CTA */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Animated background */}
          <motion.div
            className="absolute inset-0 bg-gradient-primary opacity-5 rounded-3xl blur-xl"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.05, 0.1, 0.05],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          
          <div className="relative p-16 bg-glass-dark backdrop-blur-xl border border-white/10 rounded-3xl text-center overflow-hidden">
            {/* Animated background pattern */}
            <motion.div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, rgba(0, 212, 255, 0.3) 0%, transparent 50%)`,
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            
            <div className="relative z-10">
              <motion.div
                className="text-6xl mb-8"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🚀
              </motion.div>

              <motion.h2
                className="text-5xl md:text-6xl font-bold mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Ready to{' '}
                <motion.span
                  className="bg-gradient-to-r from-gradient-blue via-gradient-purple to-gradient-cyan bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{ backgroundSize: '200% 200%' }}
                >
                  Transform
                </motion.span>
                <br />
                Your Trading?
              </motion.h2>

              <motion.p
                className="text-xl text-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                Join thousands of traders who are already benefiting from automated, 
                AI-driven trading strategies. Start your journey today! ✨
              </motion.p>

              {/* CTA Button with enhanced animation */}
              <motion.button
                onClick={onGetStarted}
                className="group relative px-16 py-6 bg-gradient-primary text-white rounded-full font-bold text-2xl overflow-hidden shadow-glow-lg"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Animated background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                />
                
                {/* Pulse effect */}
                <motion.div
                  className="absolute inset-0 bg-white/10 rounded-full"
                  animate={{ scale: [1, 1.1, 1], opacity: [0, 0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                <span className="relative flex items-center justify-center">
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    🚀
                  </motion.span>
                  <span className="mx-4">Launch App</span>
                  <motion.div
                    animate={{ x: [0, 8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-8 h-8" />
                  </motion.div>
                </span>
              </motion.button>

              {/* Additional info */}
              <motion.p
                className="mt-8 text-text-muted text-sm"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                No credit card required • Start with demo funds • Full support included
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;
