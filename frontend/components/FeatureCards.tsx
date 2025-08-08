import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Brain, Zap, TrendingUp } from "lucide-react";

interface StickyCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  index: number;
  number: string;
  isActive: boolean;
}

const StickyCard: React.FC<StickyCardProps> = ({
  title,
  description,
  icon,
  gradient,
  index,
  number,
  isActive,
}) => {
  // Animation variants for card transitions
  const cardVariants = {
    initial: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      rotateY: -15,
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      rotateY: 0,
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -50,
      rotateY: 15,
    },
  };

  return (
    <motion.div
      className="flex items-center justify-center w-full h-full"
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.5,
      }}
    >
      <motion.div
        className={`relative p-8 rounded-3xl border border-white/20 ${gradient} backdrop-blur-xl shadow-2xl overflow-hidden transform-gpu w-full max-w-sm mx-auto`}
        whileHover={{
          scale: 1.03,
          y: -8,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(139, 92, 246, 0.3)",
        }}
      >
        {/* Card number */}
        <div className="absolute top-6 left-6">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
            <span className="text-white font-bold text-lg">{number}</span>
          </div>
        </div>

        {/* Background glow effect */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-30`}
        />

        {/* Floating particles */}
        <motion.div
          className="absolute top-8 right-8 w-2 h-2 bg-white/50 rounded-full"
          animate={{
            y: [-8, 8, -8],
            opacity: [0.5, 0.9, 0.5],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-12 left-12 w-1 h-1 bg-white/40 rounded-full"
          animate={{
            y: [8, -8, 8],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        />

        <div className="relative z-10 pt-14">
          {/* Icon section */}
          <motion.div
            className="flex justify-center mb-6"
            whileHover={{ rotate: 5, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div
              className={`w-20 h-20 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-xl border border-white/30`}
            >
              <div className="text-3xl text-white">{icon}</div>
            </div>
          </motion.div>

          {/* Content section */}
          <div className="text-center">
            <motion.h3
              className="text-2xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {title}
            </motion.h3>

            <motion.p
              className="text-white/80 leading-relaxed text-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {description}
            </motion.p>
          </div>
        </div>

        {/* Decorative corner elements */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/15 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-white/15 to-transparent rounded-tr-full" />
      </motion.div>
    </motion.div>
  );
};

const FeatureCards: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isInStickySection, setIsInStickySection] = useState(false);
  const [scrollAccumulator, setScrollAccumulator] = useState(0);
  const scrollThreshold = 400; // Amount of scroll needed to advance to next card (increased from 150)

  const cards = [
    {
      number: "01",
      title: "AI-Powered Intelligence",
      description:
        "Advanced machine learning algorithms analyze market patterns, predict price movements, and execute trades with superhuman precision and speed.",
      icon: <Brain className="w-7 h-7" />,
      gradient: "from-purple-600/90 to-blue-600/90",
    },
    {
      number: "02",
      title: "Lightning Execution",
      description:
        "Built on Sui blockchain for millisecond transactions. Our infrastructure ensures perfect timing for maximum profits and minimal slippage.",
      icon: <Zap className="w-7 h-7" />,
      gradient: "from-amber-500/90 to-orange-500/90",
    },
    {
      number: "03",
      title: "Bank-Grade Security",
      description:
        "Military-grade encryption, multi-signature wallets, and decentralized architecture protect your assets with rigorous security audits.",
      icon: <Shield className="w-7 h-7" />,
      gradient: "from-emerald-500/90 to-green-500/90",
    },
    {
      number: "04",
      title: "Maximum Profitability",
      description:
        "Sophisticated algorithms identify profitable opportunities across multiple markets with automated portfolio rebalancing and risk management.",
      icon: <TrendingUp className="w-7 h-7" />,
      gradient: "from-cyan-500/90 to-blue-500/90",
    },
  ];

  // Handle scroll when in sticky section
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!isInStickySection) return;

      e.preventDefault();

      const delta = e.deltaY;
      const newAccumulator = scrollAccumulator + delta;

      if (Math.abs(newAccumulator) >= scrollThreshold) {
        if (newAccumulator > 0 && currentCardIndex < cards.length - 1) {
          // Scroll down - next card
          setCurrentCardIndex((prev) => prev + 1);
          setScrollAccumulator(0);
        } else if (newAccumulator < 0 && currentCardIndex > 0) {
          // Scroll up - previous card
          setCurrentCardIndex((prev) => prev - 1);
          setScrollAccumulator(0);
        } else if (
          newAccumulator > 0 &&
          currentCardIndex === cards.length - 1
        ) {
          // Last card reached, allow normal scroll to continue
          setIsInStickySection(false);
          setScrollAccumulator(0);
          // Manually scroll the page
          window.scrollBy(0, 100);
        } else if (newAccumulator < 0 && currentCardIndex === 0) {
          // First card reached while scrolling up, allow normal scroll to continue
          setIsInStickySection(false);
          setScrollAccumulator(0);
          // Manually scroll the page
          window.scrollBy(0, -100);
        }
      } else {
        setScrollAccumulator(newAccumulator);
      }
    },
    [isInStickySection, scrollAccumulator, currentCardIndex, cards.length]
  );

  // Intersection Observer to detect when user enters sticky section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInStickySection(true);
            setCurrentCardIndex(0);
            setScrollAccumulator(0);
          }
        });
      },
      {
        threshold: 0.5,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Add/remove wheel event listener
  useEffect(() => {
    if (isInStickySection) {
      window.addEventListener("wheel", handleWheel, { passive: false });
    } else {
      window.removeEventListener("wheel", handleWheel);
    }

    return () => window.removeEventListener("wheel", handleWheel);
  }, [isInStickySection, handleWheel]);

  return (
    <div className="relative">
      <section
        ref={containerRef}
        className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 min-h-screen pt-16"
      >
        <div className="max-w-7xl mx-auto h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
            {/* Left side - Fixed content */}
            <div className="relative flex items-center">
              <div className="sticky top-24 w-full py-20 px-6 lg:px-12">
                <motion.div
                  className="max-w-xl"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  {/* Header badge */}
                  <motion.div
                    className="inline-flex items-center gap-3 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    viewport={{ once: true }}
                  ></motion.div>

                  {/* Main heading */}
                  <motion.h2
                    className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                  >
                    Why Choose{" "}
                    <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                      SuiBian?
                    </span>
                  </motion.h2>

                  {/* Description */}
                  <motion.div
                    className="text-lg text-gray-300 leading-relaxed space-y-6"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    viewport={{ once: true }}
                  >
                    <p>
                      We are more than just another trading platform. SuiBian
                      represents a paradigm shift in decentralized finance,
                      combining cutting-edge AI technology with the security and
                      speed of the Sui blockchain.
                    </p>

                    <p>
                      When you join our ecosystem, you're not simply accessing
                      trading tools, but acquiring a sophisticated AI partner
                      that evolves with market conditions. Each agent is
                      equipped with{" "}
                      <strong className="text-white">
                        advanced intelligence written into its core algorithms
                      </strong>
                      .
                    </p>

                    <p>
                      This is not merely a trading platform but a revolutionary
                      approach to autonomous financial management. A gateway to
                      the future of decentralized trading.
                    </p>
                  </motion.div>

                  {/* Card indicators */}
                  <motion.div
                    className="mt-12 flex items-center gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    viewport={{ once: true }}
                  >
                    {cards.map((card, index) => (
                      <motion.div
                        key={index}
                        className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                          index === currentCardIndex
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 border-white/50"
                            : "bg-transparent border-white/30"
                        }`}
                        animate={{
                          scale: index === currentCardIndex ? 1.2 : 1,
                        }}
                      />
                    ))}
                    <span className="ml-4 text-sm text-gray-400">
                      {String(currentCardIndex + 1).padStart(2, "0")} /{" "}
                      {String(cards.length).padStart(2, "0")}
                    </span>
                  </motion.div>
                </motion.div>
              </div>
            </div>

            {/* Right side - Stacked cards */}
            <div className="relative flex items-center justify-center min-h-screen">
              <div className="sticky top-24 h-[80vh] flex items-center justify-center w-full">
                <div className="relative w-full max-w-sm mx-6 h-full">
                  <AnimatePresence mode="wait">
                    <StickyCard
                      key={currentCardIndex}
                      {...cards[currentCardIndex]}
                      index={currentCardIndex}
                      isActive={true}
                    />
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>
    </div>
  );
};

export default FeatureCards;
