import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  TrendingUp,
  Users,
  DollarSign,
  ArrowRight,
  BarChart3,
  Zap,
  Shield,
  ExternalLink,
  Play,
  Lock,
  Sparkles,
  Palette,
  Bot,
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  description: string;
  performance: string;
  subscribers: number;
  monthlyReturn: string;
  rating: number;
  tags: string[];
  creator: string;
  risk: "Low" | "Medium" | "High";
  strategy: string;
  gradient: string;
  featured?: boolean;
}

const MarketplacePreviewSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("featured");

  const creatorFeatures = [
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Monetize Your Strategy",
      description:
        "Earn passive income by listing your strategy for the community.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Infrastructure",
      description:
        "Your strategies run on a secure, non-custodial platform with instant withdrawals.",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Advanced Analytics",
      description:
        "Track performance metrics of your strategies with real-time analytics and insights.",
    },
  ];

  const userFeatures = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Proven Performance",
      description:
        "Choose from agents with verified track records and transparent performance history.",
    },
    {
      icon: <Bot className="w-6 h-6" />,
      title: "Strategy-based Trading",
      description:
        "Allow sophisticated trading algorithms that work 24/7 to maximize your investment returns.",
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Full Control",
      description:
        "Maintain complete control over your funds with non-custodial architecture and instant withdrawals.",
    },
  ];

  const agents: Agent[] = [
    {
      id: "1",
      name: "DeFi Alpha Trader",
      description:
        "Advanced yield farming and liquidity provision strategies across major DeFi protocols.",
      performance: "+127.5%",
      subscribers: 1243,
      monthlyReturn: "+18.2%",
      rating: 4.9,
      tags: ["DeFi", "Yield Farming", "LP"],
      creator: "CryptoQuant",
      risk: "Medium",
      strategy: "Multi-Protocol Yield",
      gradient: "from-white/5 to-gray-500/5",
      featured: true,
    },
    {
      id: "2",
      name: "AI Trend Detector",
      description:
        "Machine learning model that identifies and trades emerging market trends with high accuracy.",
      performance: "+89.3%",
      subscribers: 892,
      monthlyReturn: "+12.7%",
      rating: 4.7,
      tags: ["AI", "Trends", "Momentum"],
      creator: "TechTrader",
      risk: "Low",
      strategy: "Trend Following",
      gradient: "from-white/5 to-gray-500/5",
      featured: true,
    },
    {
      id: "3",
      name: "Arbitrage Hunter",
      description:
        "Lightning-fast cross-exchange arbitrage opportunities with minimal risk exposure.",
      performance: "+156.8%",
      subscribers: 2156,
      monthlyReturn: "+22.1%",
      rating: 4.8,
      tags: ["Arbitrage", "Low Risk", "High Freq"],
      creator: "ArbiBot",
      risk: "Low",
      strategy: "Cross-Chain Arbitrage",
      gradient: "from-white/5 to-gray-500/5",
      featured: true,
    },
  ];

  const categories = [
    { id: "featured", name: "Featured", icon: <Star className="w-4 h-4" /> },
    {
      id: "trending",
      name: "Trending",
      icon: <TrendingUp className="w-4 h-4" />,
    },
    { id: "defi", name: "DeFi", icon: <Zap className="w-4 h-4" /> },
    { id: "lowrisk", name: "Low Risk", icon: <Shield className="w-4 h-4" /> },
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "text-green-400 bg-green-500/10 border-green-500/30";
      case "Medium":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "High":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/30";
    }
  };

  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Animated Gradient Background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(-45deg, #0f172a, #064e3b, #1e293b, #0d9488)",
          backgroundSize: "400% 400%",
          animation: "gradientShift 15s ease infinite",
        }}
      />

      {/* CSS Animation Keyframes */}
      <style jsx>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
      {/* Futuristic Tech Background Overlay */}
      <div className="absolute inset-0 bg-black/80">
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 to-emerald-500/3"></div>
          <svg
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="grid"
                width="60"
                height="60"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 60 0 L 0 0 0 60"
                  fill="none"
                  stroke="rgba(59, 130, 246, 0.1)"
                  strokeWidth="1"
                />
                <circle cx="0" cy="0" r="1" fill="rgba(59, 130, 246, 0.2)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Moving Data Streams */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-blue-400/15 to-transparent"
              style={{
                left: `${-20}%`,
                top: `${20 + i * 10}%`,
                width: "140%",
                transform: `rotate(${-10 + i * 3}deg)`,
              }}
              animate={{
                x: ["0%", "100%"],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                delay: i * 1.2,
                ease: "linear",
              }}
            />
          ))}

          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`green-${i}`}
              className="absolute h-px bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent"
              style={{
                left: `${-20}%`,
                top: `${30 + i * 15}%`,
                width: "140%",
                transform: `rotate(${10 - i * 4}deg)`,
              }}
              animate={{
                x: ["100%", "0%"],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 10 + i * 1.5,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "linear",
              }}
            />
          ))}
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, Math.random() * 20 - 10, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut",
              }}
            />
          ))}

          {[...Array(10)].map((_, i) => (
            <motion.div
              key={`emerald-${i}`}
              className="absolute w-0.5 h-0.5 bg-emerald-400/15 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, 30, 0],
                x: [0, Math.random() * 15 - 7.5, 0],
                opacity: [0.1, 0.6, 0.1],
              }}
              transition={{
                duration: 6 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Pulsing Tech Nodes */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full border border-blue-400/15"
              style={{
                left: `${15 + (i % 4) * 20}%`,
                top: `${20 + Math.floor(i / 4) * 60}%`,
              }}
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.3, 0.8, 0.3],
                boxShadow: [
                  "0 0 0 0 rgba(59, 130, 246, 0.3)",
                  "0 0 0 8px rgba(59, 130, 246, 0)",
                  "0 0 0 0 rgba(59, 130, 246, 0)",
                ],
              }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            >
              <div className="w-full h-full bg-blue-400/25 rounded-full" />
            </motion.div>
          ))}
        </div>

        {/* Circuit Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-5">
          <defs>
            <linearGradient
              id="circuitGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor="rgb(59, 130, 246)"
                stopOpacity="0.5"
              />
              <stop
                offset="50%"
                stopColor="rgb(16, 185, 129)"
                stopOpacity="0.3"
              />
              <stop
                offset="100%"
                stopColor="rgb(59, 130, 246)"
                stopOpacity="0.1"
              />
            </linearGradient>
          </defs>
          <motion.path
            d="M 0,200 Q 200,100 400,200 T 800,200 Q 1000,100 1200,200"
            stroke="url(#circuitGradient)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <motion.path
            d="M 100,400 Q 300,300 500,400 T 900,400 Q 1100,300 1300,400"
            stroke="url(#circuitGradient)"
            strokeWidth="1"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 1,
            }}
          />
        </svg>

        {/* Enhanced gradient orbs with blue/emerald colors */}
        <motion.div
          className="absolute top-40 left-10 w-80 h-80 bg-gradient-radial from-blue-400/5 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <motion.div
          className="absolute bottom-40 right-10 w-96 h-96 bg-gradient-radial from-emerald-400/5 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-5 h-5 text-white" />
            <span className="text-sm font-medium text-gray-400">
              For Everyone
            </span>
          </motion.div>

          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-6 text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Build. Trade. Earn.
          </motion.h2>

          <motion.p
            className="text-l text-gray-400 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Whether you're creating trading strategies or looking to invest,
            SuiBian provides the tools and opportunities for everyone.
          </motion.p>
        </motion.div>

        {/* Dual Features Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* For Creators */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-white/10 border-2 border-white rounded-2xl flex items-center justify-center">
                    <Palette className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      For Creators
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Build and monetize your trading expertise
                    </p>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-6">
                  {creatorFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-300/30 rounded-xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors duration-300">
                          {feature.title}
                        </h4>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.button
                  className="w-full mt-8 py-4 bg-black text-white border border-white rounded-2xl font-semibold transition-all duration-300 group hover:bg-white hover:text-black"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    window.location.href = "/login"; // Replace with your actual link
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    Start Creating
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </motion.button>
              </div>

              {/* Floating elements */}
              <motion.div
                className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-emerald-500/30 to-green-500/30 backdrop-blur-xl border border-emerald-300/40 rounded-2xl flex items-center justify-center"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Zap className="w-6 h-6 text-emerald-400" />
              </motion.div>
            </motion.div>

            {/* For Users */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl h-full">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-white/10 border-2 border-white rounded-2xl flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      For Traders
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Access premium trading strategies
                    </p>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-6">
                  {userFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-300/30 rounded-xl flex items-center justify-center text-blue-200 group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-200 transition-colors duration-300">
                          {feature.title}
                        </h4>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.button
                  className="w-full mt-8 py-4 bg-black text-white border border-white rounded-2xl font-semiboldtransition-all duration-300 group hover:bg-white hover:text-black"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    window.location.href = "/login"; // Replace with your actual link
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    Start Trading
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </motion.button>
              </div>

              {/* Floating elements */}
              <motion.div
                className="absolute -top-6 -left-6 w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center"
                animate={{
                  y: [0, -8, 0],
                  rotate: [0, -5, 0],
                }}
                transition={{ duration: 3.5, repeat: Infinity }}
              >
                <TrendingUp className="w-6 h-6 text-white" />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.p
            className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
          >
            Join thousands of creators and traders already building the future
            of decentralized finance.
          </motion.p>

          <motion.button
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black border-2 border-white rounded-2xl font-semibold transition-all duration-300 group hover:bg-transparent hover:text-white"
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            viewport={{ once: true }}
            onClick={() => {
              window.location.href = "/login"; // Replace with your actual link
            }}
          >
            <span>Get Started Today</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default MarketplacePreviewSection;
