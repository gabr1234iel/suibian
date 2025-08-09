import React from "react";
import { motion } from "framer-motion";
import {
  Search,
  CreditCard,
  Bot,
  TrendingUp,
  ArrowRight,
  PlayCircle,
  Sparkles,
  Shield,
  DollarSign,
} from "lucide-react";

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      id: 1,
      title: "Browse & Discover",
      description:
        "Explore our marketplace of AI-powered trading agents. Filter by performance, strategy type, and risk level.",
      icon: <Search className="w-8 h-8" />,
      gradient: "from-white/5 to-gray-500/5",
      borderColor: "border-white/20",
      iconColor: "text-white",
    },
    {
      id: 2,
      title: "Subscribe & Deploy",
      description:
        "Choose your preferred agent and subscribe with just a few clicks. Your agent starts trading immediately.",
      icon: <CreditCard className="w-8 h-8" />,
      gradient: "from-white/5 to-gray-500/5",
      borderColor: "border-white/20",
      iconColor: "text-white",
    },
    {
      id: 3,
      title: "AI Takes Control",
      description:
        "Our sophisticated algorithms analyze markets 24/7 and execute trades based on proven strategies.",
      icon: <Bot className="w-8 h-8" />,
      gradient: "from-white/5 to-gray-500/5",
      borderColor: "border-white/20",
      iconColor: "text-white",
    },
    {
      id: 4,
      title: "Track & Earn",
      description:
        "Monitor performance in real-time and watch your portfolio grow with transparent reporting.",
      icon: <TrendingUp className="w-8 h-8" />,
      gradient: "from-white/5 to-gray-500/5",
      borderColor: "border-white/20",
      iconColor: "text-white",
    },
  ];

  const creatorSteps = [
    {
      id: 1,
      title: "Design Your Strategy",
      description:
        "Use our intuitive visual editor or upload your own code to build a unique AI trading agent from the ground up.",
      icon: <Sparkles className="w-8 h-8" />,
      gradient: "from-blue-500/10 to-green-500/10",
      borderColor: "border-blue-400/20",
      iconColor: "text-blue-300",
    },
    {
      id: 2,
      title: "Backtest & Secure",
      description:
        "Validate your agent's performance against historical data and deploy it into our secure, audited on-chain environment.",
      icon: <Shield className="w-8 h-8" />,
      gradient: "from-blue-500/10 to-green-500/10",
      borderColor: "border-blue-400/20",
      iconColor: "text-green-300",
    },
    {
      id: 3,
      title: "List & Set Your Price",
      description:
        "Publish your agent to the marketplace. Set your own flat-rate subscription fee and write a compelling description.",
      icon: <DollarSign className="w-8 h-8" />,
      gradient: "from-blue-500/10 to-green-500/10",
      borderColor: "border-blue-400/20",
      iconColor: "text-blue-300",
    },
    {
      id: 4,
      title: "Earn & Grow",
      description:
        "Generate passive income from every subscriber. Build your reputation and track your agent's adoption in real-time.",
      icon: <TrendingUp className="w-8 h-8" />,
      gradient: "from-blue-500/10 to-green-500/10",
      borderColor: "border-blue-400/20",
      iconColor: "text-green-300",
    },
  ];

  return (
    <section
      className="relative py-32 px-6 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
      }}
    >
      {/* Background elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-radial from-white/3 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-radial from-gray-500/3 to-transparent rounded-full blur-3xl"
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <PlayCircle className="w-5 h-5 text-white" />
            <span className="text-sm font-medium text-gray-400">
              How It Works
            </span>
          </motion.div>

          {/* <motion.h2
            className="text-4xl md:text-5xl font-bold mb-6 text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            From Strategy to Revenue, Simplified.
          </motion.h2> */}
          <motion.h2
            className="text-3xl md:text-5xl font-bold mb-6 text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Start Trading in Minutes
          </motion.h2>

          {/* <motion.p
            className="text-l text-gray-400 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Our platform provides everything you need to build, backtest,
            deploy, and monetize your trading strategies on-chain.
          </motion.p> */}
          <motion.p
            className="text-m text-gray-400 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            From discovery to deployment, our streamlined process makes it easy
            to start earning with AI-powered trading agents.
          </motion.p>
        </motion.div>

        {/* Steps Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                className="relative group"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {/* Connection Line (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-8 h-px bg-gradient-to-r from-white/20 to-transparent z-10">
                    <motion.div
                      className="w-full h-full bg-white/30"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: (index + 1) * 0.2 }}
                      viewport={{ once: true }}
                    />
                  </div>
                )}

                <div
                  className={`relative h-full p-8 bg-gradient-to-br ${step.gradient} backdrop-blur-xl border ${step.borderColor} rounded-3xl transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl overflow-hidden`}
                >
                  {/* Animated Border Trace */}
                  <div
                    className="absolute inset-0 rounded-3xl opacity-0"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, transparent, #3b82f6, transparent, transparent)",
                      backgroundSize: "200% 100%",
                      animation: `borderTrace 12s linear infinite`,
                      animationDelay: `${index * 3}s`,
                    }}
                  />

                  {/* CSS for Border Animation */}
                  <style jsx>{`
                    @keyframes borderTrace {
                      0% {
                        opacity: 0;
                        background-position: -200% 0;
                      }
                      2% {
                        opacity: 1;
                        background-position: -200% 0;
                        box-shadow: inset 0 0 0 2px transparent;
                      }
                      6% {
                        opacity: 1;
                        background-position: 200% 0;
                        box-shadow: inset 0 -2px 0 0 #3b82f6;
                      }
                      12% {
                        opacity: 1;
                        box-shadow: inset -2px -2px 0 0 #3b82f6;
                      }
                      18% {
                        opacity: 1;
                        box-shadow: inset -2px 0 0 0 #3b82f6;
                      }
                      22% {
                        opacity: 1;
                        box-shadow: inset 0 2px 0 0 #3b82f6;
                      }
                      25% {
                        opacity: 0;
                        background-position: 200% 0;
                        box-shadow: inset 0 0 0 0 transparent;
                      }
                      100% {
                        opacity: 0;
                        background-position: 200% 0;
                        box-shadow: inset 0 0 0 0 transparent;
                      }
                    }
                  `}</style>

                  {/* Enhanced Animated Border Effect */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl"
                    style={{
                      background:
                        "conic-gradient(from 0deg, transparent, transparent, #3b82f6, #10b981, transparent, transparent)",
                    }}
                    animate={{
                      rotate: [0, 360],
                      opacity: [0, 1, 1, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 3,
                      repeatDelay: 9,
                      times: [0, 0.1, 0.9, 1],
                      ease: "linear",
                    }}
                  />

                  {/* Inner content mask */}
                  <div className="absolute inset-[2px] bg-black/90 rounded-3xl" />

                  {/* Content with higher z-index */}
                  <div className="relative z-10">
                    {/* Step Number */}
                    <div className="absolute -top-4 -left-4 w-8 h-8 bg-white border border-black rounded-full flex items-center justify-center text-sm font-bold shadow-lg text-black z-20">
                      {step.id}
                    </div>

                    {/* Icon */}
                    <motion.div
                      className={`w-16 h-16 ${step.gradient} backdrop-blur-xl border ${step.borderColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 5 }}
                    >
                      <div className={step.iconColor}>{step.icon}</div>
                    </motion.div>

                    {/* Content */}
                    <h3 className="text-xl font-bold mb-4 text-white">
                      {step.title}
                    </h3>

                    <p className="text-gray-400 leading-relaxed text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
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
          <motion.div
            className="inline-flex items-center gap-3 px-8 py-4 bg-white border border-white text-black rounded-2xl font-semibold shadow-2xl hover:bg-transparent hover:text-white hover:border transition-all duration-300 cursor-pointer group"
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              window.location.href = "/login"; // Replace with your actual link
            }}
          >
            <span>Start Your Journey</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
