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
          className="text-center mb-16"
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
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium text-gray-400">
              Marketplace Preview
            </span>
          </motion.div>

          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-6 text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Top Performing Agents
          </motion.h2>

          <motion.p
            className="text-m text-gray-400 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Discover high-performing AI trading agents trusted by thousands of
            users worldwide.
          </motion.p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                selectedCategory === category.id
                  ? "bg-white text-black border-2 border-white"
                  : "bg-transparent border-2 border-white/20 text-gray-400 hover:text-white hover:border-white/40"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {category.icon}
              {category.name}
            </motion.button>
          ))}
        </motion.div>

        {/* Agents Grid */}
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {agents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  className={`relative group p-8 bg-gradient-to-br ${agent.gradient} backdrop-blur-xl border border-white/10 rounded-3xl hover:border-white/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl`}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  {/* Featured Badge */}
                  {agent.featured && (
                    <div className="absolute -top-3 -right-3 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold text-white shadow-lg">
                      Featured
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300">
                        {agent.name}
                      </h3>
                      <p className="text-gray-400 text-sm mb-3">
                        by {agent.creator}
                      </p>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(agent.rating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-600"
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-400 ml-2">
                          {agent.rating}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(
                        agent.risk
                      )}`}
                    >
                      {agent.risk} Risk
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    {agent.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-lg font-bold text-green-400">
                          {agent.performance}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">All Time</span>
                    </div>

                    <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users className="w-4 h-4 text-white" />
                        <span className="text-lg font-bold text-white">
                          {agent.subscribers.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">Subscribers</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {agent.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-medium text-gray-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Button */}
                  <motion.button
                    className="w-full flex items-center justify-center gap-2 py-3 bg-black text-white border border-white rounded-2xl font-semibold hover:bg-white hover:text-black transition-all duration-300"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      window.location.href = "/login"; // Replace with your actual link
                    }}
                  >
                    <Play className="w-4 h-4" />
                    Subscribe & Deploy
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* View All CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <motion.button
            className="inline-flex items-center gap-3 px-8 py-4 bg-white border border-white rounded-2xl font-semibold text-black hover:bg-black hover:text-white transition-all duration-300 group"
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              window.location.href = "/login"; // Replace with your actual link
            }}
          >
            <span>Explore Full Marketplace</span>
            <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default MarketplacePreviewSection;
