import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import LoadingScreen from '../components/LoadingScreen';

// Simple SVG icons
const SparklesIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.5 2.5L16 4.5 13.5 7M21 8l-3.5 3.5L16 10l1.5-1.5M21 21l-3.5-3.5L16 19l1.5 1.5" />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ShieldCheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ChartBarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const CurrencyDollarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
);

const BoltIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const LandingPage: React.FC = () => {
  const router = useRouter();
  const [showLoading, setShowLoading] = useState(true);

  // Show loading screen for 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    router.push('/login');
  };

  // Show loading screen
  if (showLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gradient-blue to-gradient-purple bg-clip-text text-transparent">
                SuiBian
              </span>
            </div>
            <button
              onClick={handleGetStarted}
              className="px-6 py-2 bg-gradient-primary text-white rounded-full font-semibold hover:scale-105 transition-transform"
            >
              Launch App
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gradient-blue/10 via-transparent to-transparent"></div>
        
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="space-y-8">
            <div className="inline-flex items-center px-6 py-3 bg-dark-800/50 border border-gray-700 rounded-full backdrop-blur-sm">
              <BoltIcon className="w-4 h-4 text-gradient-blue mr-2" />
              <span className="text-sm text-gray-300">Revolutionizing DeFi Trading</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Trade Smarter with{' '}
              <span className="bg-gradient-to-r from-gradient-blue via-gradient-purple to-gradient-cyan bg-clip-text text-transparent">
                AI Agents
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
              Create, monetize, and deploy autonomous trading strategies on the Sui blockchain. 
              The future of decentralized finance is here.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <button
                onClick={handleGetStarted}
                className="group relative px-10 py-5 bg-gradient-primary text-white rounded-full font-bold text-xl hover:scale-105 transition-all duration-300 shadow-2xl shadow-gradient-blue/40 hover:shadow-3xl hover:shadow-gradient-blue/60 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <span className="relative flex items-center">
                  Start Trading Now
                  <ChevronRightIcon className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </button>
              
              <button className="group px-10 py-5 border-2 border-gray-600 text-white rounded-full font-bold text-xl hover:border-gradient-blue hover:bg-gradient-blue/10 transition-all duration-300 hover:shadow-xl hover:shadow-gradient-blue/20 backdrop-blur-sm">
                <span className="flex items-center">
                  Watch Demo
                  <BoltIcon className="w-5 h-5 ml-2 opacity-60 group-hover:opacity-100 transition-opacity duration-200" />
                </span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center group">
                <div className="text-3xl font-bold text-gradient-blue mb-2 group-hover:scale-110 transition-transform duration-300">$50M+</div>
                <div className="text-text-secondary flex items-center justify-center">
                  <span className="mr-1">💹</span>
                  Total Volume
                </div>
              </div>
              <div className="text-center group">
                <div className="text-3xl font-bold text-gradient-purple mb-2 group-hover:scale-110 transition-transform duration-300">10K+</div>
                <div className="text-text-secondary flex items-center justify-center">
                  <span className="mr-1">👥</span>
                  Active Traders
                </div>
              </div>
              <div className="text-center group">
                <div className="text-3xl font-bold text-gradient-cyan mb-2 group-hover:scale-110 transition-transform duration-300">500+</div>
                <div className="text-text-secondary flex items-center justify-center">
                  <span className="mr-1">🎯</span>
                  Strategies
                </div>
              </div>
              <div className="text-center group">
                <div className="text-3xl font-bold text-gradient-pink mb-2 group-hover:scale-110 transition-transform duration-300">99.9%</div>
                <div className="text-text-secondary flex items-center justify-center">
                  <span className="mr-1">⚡</span>
                  Uptime
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-dark-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose{' '}
              <span className="bg-gradient-to-r from-gradient-blue to-gradient-purple bg-clip-text text-transparent">
                SuiBian?
              </span>
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Experience the next generation of trading with cutting-edge technology and unparalleled security.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Secure & Decentralized Card */}
            <div className="group relative overflow-hidden h-[400px]">
              <div className="absolute inset-0 bg-gradient-to-br from-gradient-blue/20 to-gradient-purple/10 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative h-full p-8 bg-dark-800/90 backdrop-blur-sm border border-gray-700 rounded-2xl hover:border-gradient-blue/50 transition-all duration-500 hover:shadow-2xl hover:shadow-gradient-blue/30 hover:transform hover:scale-[1.02] flex flex-col">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-gradient-blue to-gradient-purple rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-gradient-blue/30 group-hover:shadow-xl group-hover:shadow-gradient-blue/50 transition-all duration-300">
                    <ShieldCheckIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-blue rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                  <div className="absolute top-2 right-2 text-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-300">🛡️</div>
                </div>
                <div className="flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold mb-6 text-white group-hover:text-gradient-blue transition-colors duration-300">
                    Secure & Decentralized
                  </h3>
                  <p className="text-text-secondary text-lg leading-relaxed group-hover:text-gray-300 transition-colors duration-300 flex-1">
                    Built on Sui blockchain with zkLogin authentication. Your assets remain in your control at all times with enterprise-grade security.
                  </p>
                  <div className="mt-6 flex items-center text-gradient-blue font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <span>Learn more</span>
                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>
            </div>

            {/* AI-Powered Strategies Card */}
            <div className="group relative overflow-hidden h-[400px]">
              <div className="absolute inset-0 bg-gradient-to-br from-gradient-purple/20 to-gradient-pink/10 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative h-full p-8 bg-dark-800/90 backdrop-blur-sm border border-gray-700 rounded-2xl hover:border-gradient-purple/50 transition-all duration-500 hover:shadow-2xl hover:shadow-gradient-purple/30 hover:transform hover:scale-[1.02] flex flex-col">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-gradient-purple to-gradient-pink rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-gradient-purple/30 group-hover:shadow-xl group-hover:shadow-gradient-purple/50 transition-all duration-300">
                    <ChartBarIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-purple rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                  <div className="absolute top-2 right-2 text-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-300">🤖</div>
                </div>
                <div className="flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold mb-6 text-white group-hover:text-gradient-purple transition-colors duration-300">
                    AI-Powered Strategies
                  </h3>
                  <p className="text-text-secondary text-lg leading-relaxed group-hover:text-gray-300 transition-colors duration-300 flex-1">
                    Advanced machine learning algorithms analyze market patterns to optimize your trading performance with real-time insights.
                  </p>
                  <div className="mt-6 flex items-center text-gradient-purple font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <span>Learn more</span>
                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>
            </div>

            {/* Monetize Your Expertise Card */}
            <div className="group relative overflow-hidden h-[400px]">
              <div className="absolute inset-0 bg-gradient-to-br from-gradient-cyan/20 to-gradient-blue/10 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative h-full p-8 bg-dark-800/90 backdrop-blur-sm border border-gray-700 rounded-2xl hover:border-gradient-cyan/50 transition-all duration-500 hover:shadow-2xl hover:shadow-gradient-cyan/30 hover:transform hover:scale-[1.02] flex flex-col">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-gradient-cyan to-gradient-blue rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-gradient-cyan/30 group-hover:shadow-xl group-hover:shadow-gradient-cyan/50 transition-all duration-300">
                    <CurrencyDollarIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-cyan rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                  <div className="absolute top-2 right-2 text-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-300">💰</div>
                </div>
                <div className="flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold mb-6 text-white group-hover:text-gradient-cyan transition-colors duration-300">
                    Monetize Your Expertise
                  </h3>
                  <p className="text-text-secondary text-lg leading-relaxed group-hover:text-gray-300 transition-colors duration-300 flex-1">
                    Create and sell your trading strategies. Earn passive income from successful algorithmic trading with our marketplace.
                  </p>
                  <div className="mt-6 flex items-center text-gradient-cyan font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <span>Learn more</span>
                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative h-[400px] flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-primary opacity-10 rounded-3xl blur-3xl animate-pulse"></div>
            <div className="relative p-12 bg-dark-800/95 border border-gray-700 rounded-3xl backdrop-blur-xl w-full h-full flex flex-col justify-center">
              <div className="mb-4 text-4xl animate-bounce">🚀</div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to{' '}
                <span className="bg-gradient-to-r from-gradient-blue to-gradient-purple bg-clip-text text-transparent">
                  Transform
                </span>{' '}
                Your Trading?
              </h2>
              <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
                Join thousands of traders who are already benefiting from automated, AI-driven trading strategies! ✨
              </p>
              <button
                onClick={handleGetStarted}
                className="group relative px-12 py-5 bg-gradient-primary text-white rounded-full font-bold text-xl hover:scale-105 transition-all duration-300 shadow-2xl shadow-gradient-blue/40 hover:shadow-3xl hover:shadow-gradient-blue/60 overflow-hidden mx-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <span className="relative flex items-center">
                  🚀 Launch App
                  <ChevronRightIcon className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gradient-blue to-gradient-purple bg-clip-text text-transparent">
                SuiBian
              </span>
            </div>
            <div className="text-text-secondary">
              © 2025 SuiBian. Building the future of decentralized trading.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
