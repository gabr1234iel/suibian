import React from "react";
import { motion } from "framer-motion";
import {
  Code,
  Palette,
  Zap,
  Shield,
  TrendingUp,
  Users,
  ArrowRight,
  Sparkles,
  Bot,
  DollarSign,
  BarChart3,
  Lock,
} from "lucide-react";

const DualFeatureSection: React.FC = () => {
  const creatorFeatures = [
    {
      icon: <Code className="w-6 h-6" />,
      title: "No-Code Builder",
      description:
        "Create sophisticated trading strategies without programming knowledge using our intuitive drag-and-drop interface.",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Advanced Analytics",
      description:
        "Track performance metrics, analyze market conditions, and optimize your strategies with detailed insights.",
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Monetize Your Skills",
      description:
        "Earn passive income by sharing your trading expertise with the community through subscription-based agents.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Infrastructure",
      description:
        "Built on Sui blockchain for maximum security, transparency, and decentralized operation.",
    },
  ];

  const userFeatures = [
    {
      icon: <Bot className="w-6 h-6" />,
      title: "AI-Powered Trading",
      description:
        "Access sophisticated trading algorithms that work 24/7 to maximize your investment returns.",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Proven Performance",
      description:
        "Choose from agents with verified track records and transparent performance history.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community Insights",
      description:
        "Learn from experienced traders and benefit from collective intelligence of the marketplace.",
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Full Control",
      description:
        "Maintain complete control over your funds with non-custodial architecture and instant withdrawals.",
    },
  ];

  return (
    <section className="relative py-32 px-6 bg-black overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-1/4 w-72 h-72 bg-gradient-radial from-white/3 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
            x: [0, 50, 0],
          }}
          transition={{ duration: 12, repeat: Infinity }}
        />

        <motion.div
          className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-radial from-gray-500/3 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
            x: [0, -30, 0],
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
                    <p className="text-gray-300">
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
                  className="w-full mt-8 py-4 bg-black text-white border-2 border-gray-500 rounded-2xl font-semibold transition-all duration-300 group hover:bg-white hover:text-black"
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
                    <p className="text-gray-300">
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
                  className="w-full mt-8 py-4 bg-black text-white border-2 border-gray-500 rounded-2xl font-semiboldtransition-all duration-300 group hover:bg-white hover:text-black"
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

export default DualFeatureSection;
