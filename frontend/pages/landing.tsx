// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
// import LoadingScreen from '../components/LoadingScreen';
// import NavBar from '../components/NavBar';
// import Hero from '../components/Hero';
// import FeatureCards from '../components/FeatureCards';
// import Process from '../components/Process';
// import CallToAction from '../components/CallToAction';
// import { motion } from 'framer-motion';
// import { Sparkles, Bot, Shield, Zap, TrendingUp } from 'lucide-react';

// const LandingPage: React.FC = () => {
//   const router = useRouter();
//   const [showLoading, setShowLoading] = useState(true);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setShowLoading(false);
//     }, 2500);

//     return () => clearTimeout(timer);
//   }, []);

//   const handleGetStarted = () => {
//     router.push('/login');
//   };

//   if (showLoading) {
//     return <LoadingScreen />;
//   }

//   return (
//     <div className="min-h-screen bg-dark-900 text-white overflow-hidden">

//       <NavBar isLandingPage={true} onGetStarted={handleGetStarted} />

//       <section id="hero">
//         <Hero onGetStarted={handleGetStarted} />
//       </section>

//       <section id="features" className="relative z-10">
//         <FeatureCards />
//       </section>

//       <section id="how-it-works">
//         <Process />
//       </section>

//       <section id="about" className="relative py-32 px-6 bg-dark-900/50 backdrop-blur-xl overflow-hidden">
//         {/* Background elements */}
//         <div className="absolute inset-0">
//           {/* Animated gradient orbs */}
//           <motion.div
//             className="absolute top-20 left-10 w-72 h-72 bg-gradient-radial from-blue-500/10 to-transparent rounded-full blur-3xl"
//             animate={{
//               scale: [1, 1.3, 1],
//               opacity: [0.2, 0.4, 0.2],
//             }}
//             transition={{ duration: 8, repeat: Infinity }}
//           />

//           <motion.div
//             className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-radial from-purple-500/10 to-transparent rounded-full blur-3xl"
//             animate={{
//               scale: [1, 1.2, 1],
//               opacity: [0.3, 0.5, 0.3],
//             }}
//             transition={{ duration: 10, repeat: Infinity }}
//           />
//         </div>

//         {/* Floating SVG icons */}
//         <motion.div
//           className="absolute top-24 left-20 w-16 h-16 p-4 bg-glass-white backdrop-blur-xl border border-white/20 rounded-2xl"
//           initial={{ opacity: 0, scale: 0, rotate: -180 }}
//           animate={{
//             opacity: 1,
//             scale: 1,
//             rotate: 0,
//             y: [0, -10, 0],
//           }}
//           transition={{
//             opacity: { duration: 0.6, delay: 0.2 },
//             scale: { duration: 0.6, delay: 0.2 },
//             rotate: { duration: 0.8, delay: 0.2 },
//             y: {
//               duration: 3,
//               repeat: Infinity,
//               ease: "easeInOut",
//               delay: 1.2
//             }
//           }}
//           whileHover={{ scale: 1.2, rotate: 360 }}
//         >
//           <img src="/icons/bitcoin.svg" alt="Bitcoin" className="w-full h-full" />
//         </motion.div>

//         <motion.div
//           className="absolute top-40 right-24 w-12 h-12 p-3 bg-glass-white backdrop-blur-xl border border-white/20 rounded-2xl"
//           initial={{ opacity: 0, scale: 0, rotate: -180 }}
//           animate={{
//             opacity: 1,
//             scale: 1,
//             rotate: 0,
//             y: [0, -15, 0],
//           }}
//           transition={{
//             opacity: { duration: 0.6, delay: 0.4 },
//             scale: { duration: 0.6, delay: 0.4 },
//             rotate: { duration: 0.8, delay: 0.4 },
//             y: {
//               duration: 4,
//               repeat: Infinity,
//               ease: "easeInOut",
//               delay: 1.4
//             }
//           }}
//           whileHover={{ scale: 1.2, rotate: 360 }}
//         >
//           <img src="/icons/ethereum.svg" alt="Ethereum" className="w-full h-full" />
//         </motion.div>

//         <motion.div
//           className="absolute bottom-32 left-32 w-14 h-14 p-3 bg-glass-white backdrop-blur-xl border border-white/20 rounded-2xl"
//           initial={{ opacity: 0, scale: 0, rotate: -180 }}
//           animate={{
//             opacity: 1,
//             scale: 1,
//             rotate: 0,
//             y: [0, -12, 0],
//           }}
//           transition={{
//             opacity: { duration: 0.6, delay: 0.6 },
//             scale: { duration: 0.6, delay: 0.6 },
//             rotate: { duration: 0.8, delay: 0.6 },
//             y: {
//               duration: 3.5,
//               repeat: Infinity,
//               ease: "easeInOut",
//               delay: 1.6
//             }
//           }}
//           whileHover={{ scale: 1.2, rotate: 360 }}
//         >
//           <img src="/icons/wallet.svg" alt="Wallet" className="w-full h-full" />
//         </motion.div>

//         {/* Additional floating Lucide icons */}
//         <motion.div
//           className="absolute top-60 left-16 w-10 h-10 p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-xl border border-purple-300/30 rounded-xl"
//           initial={{ opacity: 0, scale: 0, rotate: -90 }}
//           animate={{
//             opacity: 1,
//             scale: 1,
//             rotate: 0,
//             y: [0, -8, 0],
//           }}
//           transition={{
//             opacity: { duration: 0.6, delay: 0.8 },
//             scale: { duration: 0.6, delay: 0.8 },
//             rotate: { duration: 0.8, delay: 0.8 },
//             y: {
//               duration: 4,
//               repeat: Infinity,
//               ease: "easeInOut",
//               delay: 1.8
//             }
//           }}
//           whileHover={{ scale: 1.3, rotate: 180 }}
//         >
//           <Bot className="w-full h-full text-purple-300" />
//         </motion.div>

//         <motion.div
//           className="absolute bottom-48 right-16 w-12 h-12 p-3 bg-gradient-to-br from-emerald-500/20 to-green-500/20 backdrop-blur-xl border border-emerald-300/30 rounded-xl"
//           initial={{ opacity: 0, scale: 0, rotate: 90 }}
//           animate={{
//             opacity: 1,
//             scale: 1,
//             rotate: 0,
//             y: [0, -10, 0],
//           }}
//           transition={{
//             opacity: { duration: 0.6, delay: 1.0 },
//             scale: { duration: 0.6, delay: 1.0 },
//             rotate: { duration: 0.8, delay: 1.0 },
//             y: {
//               duration: 3.2,
//               repeat: Infinity,
//               ease: "easeInOut",
//               delay: 2.0
//             }
//           }}
//           whileHover={{ scale: 1.3, rotate: -180 }}
//         >
//           <Shield className="w-full h-full text-emerald-300" />
//         </motion.div>

//         <motion.div
//           className="absolute top-80 right-32 w-8 h-8 p-2 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 backdrop-blur-xl border border-amber-300/30 rounded-xl"
//           initial={{ opacity: 0, scale: 0, rotate: -45 }}
//           animate={{
//             opacity: 1,
//             scale: 1,
//             rotate: 0,
//             y: [0, -6, 0],
//           }}
//           transition={{
//             opacity: { duration: 0.6, delay: 1.2 },
//             scale: { duration: 0.6, delay: 1.2 },
//             rotate: { duration: 0.8, delay: 1.2 },
//             y: {
//               duration: 2.8,
//               repeat: Infinity,
//               ease: "easeInOut",
//               delay: 2.2
//             }
//           }}
//           whileHover={{ scale: 1.4, rotate: 270 }}
//         >
//           <Zap className="w-full h-full text-amber-300" />
//         </motion.div>

//         <div className="max-w-7xl mx-auto relative z-10">
//           <motion.div
//             className="text-center"
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//             viewport={{ once: true }}
//           >
//             <motion.h2
//               className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gradient-blue to-gradient-purple bg-clip-text text-transparent"
//               initial={{ opacity: 0, y: 30 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.8, delay: 0.1 }}
//               viewport={{ once: true }}
//             >
//               About SuiBian
//             </motion.h2>
//             <motion.p
//               className="text-xl text-text-secondary max-w-3xl mx-auto mb-12 leading-relaxed"
//               initial={{ opacity: 0, y: 30 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.8, delay: 0.2 }}
//               viewport={{ once: true }}
//             >
//               SuiBian is a revolutionary marketplace for AI-powered trading agents built on the Sui blockchain.
//               We democratize access to sophisticated trading strategies by allowing users to deploy, subscribe to,
//               and monetize intelligent trading bots that operate autonomously on your behalf.
//             </motion.p>
//             <motion.div
//               className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
//               initial={{ opacity: 0, y: 30 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.8, delay: 0.3 }}
//               viewport={{ once: true }}
//             >
//               <div className="text-center">
//                 <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
//                   <Bot className="w-8 h-8 text-white" />
//                 </div>
//                 <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
//                 <p className="text-text-secondary">Advanced machine learning algorithms drive our trading agents for optimal performance.</p>
//               </div>
//               <div className="text-center">
//                 <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
//                   <Shield className="w-8 h-8 text-white" />
//                 </div>
//                 <h3 className="text-xl font-semibold mb-2">Blockchain Secure</h3>
//                 <p className="text-text-secondary">Built on Sui for fast, secure, and transparent trading operations.</p>
//               </div>
//               <div className="text-center">
//                 <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
//                   <TrendingUp className="w-8 h-8 text-white" />
//                 </div>
//                 <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
//                 <p className="text-text-secondary">Create, share, and monetize your trading strategies with the community.</p>
//               </div>
//             </motion.div>
//           </motion.div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section id="getstarted">
//         <CallToAction onGetStarted={handleGetStarted} />
//       </section>

//       {/* Footer */}
//       <footer className="relative border-t border-white/10 px-6 py-16 bg-dark-900/50 backdrop-blur-xl">
//         <div className="max-w-7xl mx-auto">
//           <motion.div
//             className="flex flex-col md:flex-row justify-between items-center"
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//             viewport={{ once: true }}
//           >
//             <motion.div
//               className="flex items-center space-x-3 mb-8 md:mb-0 group cursor-pointer"
//               whileHover={{ scale: 1.02 }}
//             >
//               <motion.div
//                 className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow"
//                 animate={{
//                   boxShadow: [
//                     '0 0 20px rgba(0, 212, 255, 0.3)',
//                     '0 0 30px rgba(139, 92, 246, 0.4)',
//                     '0 0 20px rgba(0, 212, 255, 0.3)',
//                   ]
//                 }}
//                 transition={{ duration: 2, repeat: Infinity }}
//               >
//                 <Sparkles className="w-7 h-7 text-white" />
//               </motion.div>
//               <span className="text-2xl font-bold bg-gradient-to-r from-gradient-blue to-gradient-purple bg-clip-text text-transparent">
//                 SuiBian
//               </span>
//             </motion.div>

//             <motion.div
//               className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-12"
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.8, delay: 0.2 }}
//               viewport={{ once: true }}
//             >
//               {/* Quick links */}
//               <div className="flex flex-wrap justify-center md:justify-start gap-6 text-text-secondary">
//                 {['Features', 'Marketplace', 'Documentation', 'Support'].map((link, index) => (
//                   <motion.a
//                     key={link}
//                     href={`#${link.toLowerCase()}`}
//                     className="hover:text-white transition-colors duration-300"
//                     whileHover={{ y: -2 }}
//                     initial={{ opacity: 0, y: 10 }}
//                     whileInView={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.5, delay: index * 0.1 }}
//                     viewport={{ once: true }}
//                   >
//                     {link}
//                   </motion.a>
//                 ))}
//               </div>

//               <motion.div
//                 className="text-text-secondary text-center md:text-right"
//                 initial={{ opacity: 0 }}
//                 whileInView={{ opacity: 1 }}
//                 transition={{ duration: 0.8, delay: 0.4 }}
//                 viewport={{ once: true }}
//               >
//                 <div className="mb-2">© 2025 SuiBian</div>
//                 <div className="text-sm">Building the future of decentralized trading</div>
//               </motion.div>
//             </motion.div>
//           </motion.div>

//           {/* Additional footer content */}
//           <motion.div
//             className="mt-12 pt-8 border-t border-white/5"
//             initial={{ opacity: 0 }}
//             whileInView={{ opacity: 1 }}
//             transition={{ duration: 0.8, delay: 0.6 }}
//             viewport={{ once: true }}
//           >
//             <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
//               <div>
//                 <h4 className="text-white font-semibold mb-4">Built on Sui</h4>
//                 <p className="text-text-muted text-sm leading-relaxed">
//                   Leveraging the power of Sui blockchain for lightning-fast, secure, and scalable DeFi trading.
//                 </p>
//               </div>

//               <div>
//                 <h4 className="text-white font-semibold mb-4">AI-Powered</h4>
//                 <p className="text-text-muted text-sm leading-relaxed">
//                   Advanced machine learning algorithms optimize your trading strategies in real-time.
//                 </p>
//               </div>

//               <div>
//                 <h4 className="text-white font-semibold mb-4">Community First</h4>
//                 <p className="text-text-muted text-sm leading-relaxed">
//                   Join a vibrant community of traders, developers, and DeFi enthusiasts.
//                 </p>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default LandingPage;

// src/app/page.tsx
import Header from "@/components/Header";
import HeroSection from "@/components/Hero";
import HowItWorksSection from "@/components/HowItWorksSection";
import EaseOfUseSection from "@/components/EaseOfUseSection";
import MarketplacePreviewSection from "@/components/MarketplacePreviewSection";
import DualFeatureSection from "@/components/DualFeatureSection";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <HeroSection />
      <section id="how-it-works">
        <HowItWorksSection />
      </section>
      <section id="why-us">
        <EaseOfUseSection />
      </section>
      <section id="marketplace">
        <MarketplacePreviewSection />
      </section>
      <section id="for-everyone">
        <DualFeatureSection />
      </section>
      <Footer />
    </main>
  );
}
