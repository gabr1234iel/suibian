import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Bot, Zap, TrendingUp, ArrowRight, Play, CheckCircle } from 'lucide-react';

interface StepProps {
  number: string;
  title: string;
  description: string;
  details: string[];
  icon: React.ReactNode;
  gradient: string;
  isActive: boolean;
  onClick: () => void;
}

const Step: React.FC<StepProps> = ({
  number,
  title,
  description,
  details,
  icon,
  gradient,
  isActive,
  onClick,
}) => {
  return (
    <motion.div
      className={`relative cursor-pointer group ${isActive ? 'z-10' : 'z-0'}`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <motion.div
        className={`relative p-8 rounded-3xl border backdrop-blur-xl shadow-xl overflow-hidden transform-gpu ${
          isActive 
            ? `border-white/30 ${gradient} shadow-2xl` 
            : 'border-white/10 bg-gray-800/40 hover:border-white/20'
        }`}
        animate={{
          scale: isActive ? 1.05 : 1,
          y: isActive ? -8 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          boxShadow: isActive 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(139, 92, 246, 0.3)' 
            : '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Background glow effect */}
        {isActive && (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20`} />
        )}

        {/* Step number */}
        <div className="absolute top-6 right-6">
          <div className={`w-12 h-12 backdrop-blur-sm rounded-2xl flex items-center justify-center border shadow-lg ${
            isActive 
              ? 'bg-white/20 border-white/30' 
              : 'bg-white/10 border-white/20'
          }`}>
            <span className={`font-bold text-lg ${isActive ? 'text-white' : 'text-gray-300'}`}>
              {number}
            </span>
          </div>
        </div>

        {/* Icon */}
        <motion.div
          className="flex items-center justify-center mb-6"
          animate={{ rotate: isActive ? 5 : 0 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl border ${
            isActive 
              ? `bg-gradient-to-br ${gradient} border-white/30` 
              : 'bg-gray-700/50 border-white/20'
          }`}>
            <div className={`text-2xl ${isActive ? 'text-white' : 'text-gray-300'}`}>
              {icon}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="relative z-10">
          <motion.h3
            className={`text-xl font-bold mb-3 ${isActive ? 'text-white' : 'text-gray-200'}`}
            animate={{ opacity: isActive ? 1 : 0.8 }}
          >
            {title}
          </motion.h3>
          
          <motion.p
            className={`leading-relaxed text-sm mb-4 ${isActive ? 'text-white/90' : 'text-gray-400'}`}
            animate={{ opacity: isActive ? 1 : 0.7 }}
          >
            {description}
          </motion.p>

          {/* Expandable details */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                {details.map((detail, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 text-sm text-white/80"
                  >
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {detail}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Arrow indicator */}
        {isActive && (
          <motion.div
            className="absolute bottom-6 right-6"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <ArrowRight className="w-5 h-5 text-white/70" />
          </motion.div>
        )}

        {/* Floating particles for active step */}
        {isActive && (
          <>
            <motion.div
              className="absolute top-8 left-8 w-1 h-1 bg-white/50 rounded-full"
              animate={{
                y: [-8, 8, -8],
                opacity: [0.5, 0.9, 0.5],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-8 right-12 w-1 h-1 bg-white/40 rounded-full"
              animate={{
                y: [8, -8, 8],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            />
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

const Process: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: "01",
      title: "Connect Your Wallet",
      description: "Seamlessly connect your Sui wallet to access the SuiBian ecosystem with enterprise-grade security.",
      details: [
        "Support for all major Sui wallets",
        "Zero-knowledge authentication",
        "Multi-signature compatibility",
        "Instant wallet verification"
      ],
      icon: <Wallet className="w-6 h-6" />,
      gradient: "from-blue-600/90 to-cyan-600/90",
    },
    {
      number: "02",
      title: "Choose Your AI Agent",
      description: "Select from our curated marketplace of specialized trading agents, each with unique strategies and risk profiles.",
      details: [
        "30+ pre-trained trading strategies",
        "Risk tolerance customization",
        "Performance analytics dashboard",
        "Real-time strategy backtesting"
      ],
      icon: <Bot className="w-6 h-6" />,
      gradient: "from-purple-600/90 to-pink-600/90",
    },
    {
      number: "03",
      title: "Configure & Deploy",
      description: "Set your investment parameters, risk limits, and trading preferences with our intuitive interface.",
      details: [
        "Drag-and-drop strategy builder",
        "Advanced risk management tools",
        "Portfolio allocation settings",
        "Stop-loss & take-profit automation"
      ],
      icon: <Zap className="w-6 h-6" />,
      gradient: "from-amber-500/90 to-orange-500/90",
    },
    {
      number: "04",
      title: "Watch Profits Grow",
      description: "Monitor your autonomous trading agents as they execute trades 24/7 with real-time performance tracking.",
      details: [
        "Live profit/loss tracking",
        "Detailed trade history",
        "Performance analytics",
        "Mobile notifications & alerts"
      ],
      icon: <TrendingUp className="w-6 h-6" />,
      gradient: "from-emerald-500/90 to-green-500/90",
    },
  ];

  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header Section */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-3 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-sm"></div>
            <span className="text-sm font-medium text-green-400 uppercase tracking-wider">
              Simple Process
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            How It{' '}
            <span className="bg-gradient-to-r from-green-400 via-emerald-500 to-cyan-400 bg-clip-text text-transparent">
              Works
            </span>
          </motion.h2>

          {/* Description */}
          <motion.p
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Get started with autonomous trading in minutes. Our streamlined process makes it easy to deploy 
            AI-powered trading strategies on the Sui blockchain.
          </motion.p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          {steps.map((step, index) => (
            <Step
              key={index}
              {...step}
              isActive={activeStep === index}
              onClick={() => setActiveStep(index)}
            />
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center gap-4"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <motion.button
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-semibold text-white shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/10"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Play className="w-5 h-5" />
                Start Trading Now
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>

            <motion.div
              className="text-gray-400 text-sm"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              No minimum deposit • Start with any amount
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
    </section>
  );
};

export default Process;
