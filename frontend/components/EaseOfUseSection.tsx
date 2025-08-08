import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Shield,
  Zap,
  Users,
  ArrowRight,
  CheckCircle,
  Sparkles,
  User,
  CreditCard,
  Globe,
} from "lucide-react";

const EaseOfUseSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const benefits = [
    {
      icon: <User className="w-8 h-8" />,
      title: "No Wallet Hassle",
      description:
        "Skip the complex wallet setup. We handle all blockchain interactions behind the scenes.",
      highlight: "Zero crypto experience needed",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Simple OAuth Login",
      description:
        "Sign in with your Google account in seconds. No passwords, no seed phrases to remember.",
      highlight: "One-click authentication",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Trading",
      description:
        "Just top up your SUI address and start trading immediately. We handle all the technical complexity.",
      highlight: "Ready in minutes",
    },
  ];

  const steps = [
    {
      step: "1",
      title: "Sign In with Google",
      description:
        "Use your existing Google account - no new passwords or accounts needed.",
      icon: <Globe className="w-6 h-6" />,
      image: "/images/google-signin.png", // You'll need to add these images
      imageAlt: "Google Sign-in Interface",
    },
    {
      step: "2",
      title: "Top Up SUI",
      description:
        "Add funds to your automatically generated SUI address with any payment method.",
      icon: <CreditCard className="w-6 h-6" />,
      image: "/images/topup-sui.png",
      imageAlt: "SUI Top-up Interface",
    },
    {
      step: "3",
      title: "Start Trading",
      description:
        "Browse, create, or deploy trading agents instantly - no crypto knowledge required.",
      icon: <Sparkles className="w-6 h-6" />,
      image: "/images/trading-dashboard.png",
      imageAlt: "Trading Dashboard Interface",
    },
  ];

  return (
    <section
      className="relative py-32 px-6 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #000000 0%, #0f0f0f 50%, #1a1a1a 100%)",
      }}
    >
      {/* Background elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-gradient-radial from-blue-500/5 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <motion.div
          className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-radial from-green-500/5 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
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
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium text-gray-400">
              Simplified Experience
            </span>
          </motion.div>

          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-6 text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <span className="block">No Crypto Experience?</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
              No Problem.
            </span>
          </motion.h2>

          <motion.p
            className="text-l text-gray-400 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            We've eliminated every barrier between you and blockchain trading.
            No wallets, no seed phrases, no crypto jargon. Just simple, powerful
            AI trading accessible to everyone.
          </motion.p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {benefits.map((benefit, index) => (
            <div key={benefit.title} className="group relative">
              <div className="relative h-full overflow-hidden rounded-3xl">
                {/* Animated glowing border */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute inset-[-1px] rounded-3xl bg-transparent overflow-hidden">
                    <div className="absolute inset-[-2px] bg-gradient-to-r from-blue-500 via-green-400 to-blue-500 animate-[spin_4s_linear_infinite] rounded-3xl opacity-50" />
                  </div>
                </div>

                {/* Content inside animated border */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="relative h-full p-8 bg-gradient-to-br from-white/5 to-gray-500/5 backdrop-blur-xl border border-white/20 rounded-3xl transition-all duration-500"
                >
                  {/* Icon */}
                  <motion.div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-green-500/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-white">{benefit.icon}</div>
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-4 text-white">
                    {benefit.title}
                  </h3>

                  <p className="text-gray-400 leading-relaxed mb-4">
                    {benefit.description}
                  </p>

                  {/* Highlight */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-green-300">
                      {benefit.highlight}
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive How It Works Steps */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Get Started in 3 Simple Steps
          </h3>
          <p className="text-l text-gray-400 max-w-2xl mx-auto">
            From signup to trading in under 5 minutes. No technical knowledge
            required.
          </p>
        </motion.div>

        {/* Interactive Steps Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
          {/* Left Side - Steps */}
          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                className={`relative cursor-pointer transition-all duration-300 ${
                  activeStep === index
                    ? " from-blue-500/10 to-green-500/10 border-l-4 border-blue-400"
                    : "bg-white/5 border-l-4 border-transparent hover:border-white/20"
                }`}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                onClick={() => setActiveStep(index)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-6 rounded-2xl backdrop-blur-xl border border-white/10">
                  <div className="flex items-start gap-4">
                    {/* Step Number */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        activeStep === index
                          ? "bg-gradient-to-br from-blue-500 to-green-500"
                          : "bg-white/10"
                      }`}
                    >
                      <span className="text-lg font-bold text-white">
                        {step.step}
                      </span>
                    </div>

                    <div className="flex-1">
                      {/* Icon and Title */}
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`transition-colors duration-300 ${
                            activeStep === index
                              ? "text-blue-400"
                              : "text-white"
                          }`}
                        >
                          {step.icon}
                        </div>
                        <h4
                          className={`text-xl font-bold transition-colors duration-300 ${
                            activeStep === index
                              ? "text-white"
                              : "text-gray-300"
                          }`}
                        >
                          {step.title}
                        </h4>
                      </div>

                      {/* Description */}
                      <p
                        className={`transition-colors duration-300 ${
                          activeStep === index
                            ? "text-gray-300"
                            : "text-gray-400"
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>

                    {/* Active Indicator */}
                    {activeStep === index && (
                      <motion.div
                        className="w-2 h-2 bg-blue-400 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Side - Image Display */}
          <div className="relative">
            <motion.div
              className="relative aspect-video bg-gradient-to-br from-white/5 to-gray-500/5 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              {/* Placeholder for actual images */}
              <motion.div
                key={activeStep}
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* Image Placeholder - Replace with actual images */}
                <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-green-500/20 flex flex-col items-center justify-center text-center p-8">
                  <div className="text-6xl mb-4">{steps[activeStep].icon}</div>
                  <h4 className="text-2xl font-bold text-white mb-2">
                    {steps[activeStep].title}
                  </h4>
                  <p className="text-gray-400">{steps[activeStep].imageAlt}</p>
                </div>

                {/* Uncomment when you have actual images */}
                {/* <img 
                  src={steps[activeStep].image} 
                  alt={steps[activeStep].imageAlt}
                  className="w-full h-full object-cover"
                /> */}
              </motion.div>

              {/* Step indicator dots */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      activeStep === index
                        ? "bg-blue-400 scale-125"
                        : "bg-white/30 hover:bg-white/50"
                    }`}
                    onClick={() => setActiveStep(index)}
                  />
                ))}
              </div>
            </motion.div>

            {/* Floating elements for visual interest */}
            <motion.div
              className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-blue-500/30 to-green-500/30 rounded-full blur-sm"
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-green-500/30 to-blue-500/30 rounded-full blur-sm"
              animate={{
                y: [0, 10, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default EaseOfUseSection;
