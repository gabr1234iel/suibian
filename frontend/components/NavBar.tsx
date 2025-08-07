import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  Sparkles, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Bell,
  Wallet 
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface NavBarProps {
  // For landing page, enables in-page navigation
  isLandingPage?: boolean;
  // Callback for "Get Started" button on landing page
  onGetStarted?: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ isLandingPage = false, onGetStarted }) => {
  const { isLoggedIn, logout, userAddress, balance } = useAppContext();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { scrollY } = useScroll();
  
  const navOpacity = useTransform(scrollY, [0, 100], [0.9, 0.95]);
  const navBlur = useTransform(scrollY, [0, 100], [10, 20]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [router.pathname]);

  // Navigation items for logged-out users (landing page)
  const landingNavItems = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'About', href: '#about' },
    { name: 'Get Started', href: '#getstarted' },
  ];

  const handleNavClick = (href: string) => {
    if (href.startsWith('#')) {
      // In-page navigation for landing page
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Page navigation
      router.push(href);
    }
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    router.push('/');
  };

  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      router.push('/login');
    }
    setIsMenuOpen(false);
  };

  // Format user address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Format balance for display
  const formatBalance = (balance: number | null) => {
    if (balance === null) return '0.00';
    return balance.toFixed(2);
  };

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'py-3 bg-dark-900/80 backdrop-blur-xl border-b border-white/10' 
            : 'py-6 bg-transparent'
        }`}
        style={{
          backdropFilter: `blur(${navBlur}px)`,
        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-3 group cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (isLandingPage) {
                  // Scroll to top on landing page
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  // Navigate to dashboard or home
                  router.push(isLoggedIn ? '/dashboard' : '/');
                }
              }}
            >
              <div className="relative">
                <motion.div 
                  className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow"
                  animate={{ 
                    boxShadow: [
                      '0 0 20px rgba(0, 212, 255, 0.3)',
                      '0 0 30px rgba(139, 92, 246, 0.4)',
                      '0 0 20px rgba(0, 212, 255, 0.3)',
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
                <motion.div
                  className="absolute inset-0 bg-gradient-primary rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gradient-blue to-gradient-purple bg-clip-text text-transparent">
                SuiBian
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/marketplace"
                    className="text-text-secondary hover:text-gradient-blue transition-colors font-medium"
                  >
                    Marketplace
                  </Link>
                  <Link
                    href="/dashboard"
                    className="text-text-secondary hover:text-gradient-blue transition-colors font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/create"
                    className="text-text-secondary hover:text-gradient-blue transition-colors font-medium"
                  >
                    Create Agent
                  </Link>
                  <Link
                    href="/settings"
                    className="text-text-secondary hover:text-gradient-blue transition-colors font-medium"
                  >
                    Settings
                  </Link>
                </>
              ) : (
                // Logged-out navigation (landing page)
                <>
                  {landingNavItems.map((item, index) => (
                    <motion.button
                      key={item.name}
                      onClick={() => handleNavClick(item.href)}
                      className="relative text-text-secondary hover:text-white transition-colors duration-300 group font-medium px-4 py-2"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      whileHover={{ y: -2 }}
                    >
                      {item.name}
                      <motion.div
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        layoutId="navUnderline"
                      />
                    </motion.button>
                  ))}
                </>
              )}
            </nav>

            {/* Right side actions */}
            <div className="hidden md:flex items-center space-x-4">
              {isLoggedIn ? (
                // Logged-in user actions
                <>
                  {/* Notifications */}
                  <motion.button
                    className="relative p-2 text-text-secondary hover:text-white transition-colors duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-primary rounded-full"></span>
                  </motion.button>

                  {/* User Profile */}
                  <div className="relative">
                    <motion.button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center space-x-3 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex flex-col items-end text-xs">
                        <span className="text-white font-medium">
                          {formatAddress(userAddress || '')}
                        </span>
                        <span className="text-text-secondary">
                          {formatBalance(balance)} SUI
                        </span>
                      </div>
                      <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    </motion.button>

                    {/* Profile Dropdown */}
                    {isProfileOpen && (
                      <motion.div
                        className="absolute right-0 top-full mt-2 w-48 bg-dark-800 rounded-xl border border-white/10 shadow-xl backdrop-blur-xl"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <div className="p-2">
                          <button
                            onClick={() => {
                              setIsProfileOpen(false);
                              router.push('/profile');
                            }}
                            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                          >
                            <User className="w-4 h-4" />
                            <span>Profile</span>
                          </button>
                          <button
                            onClick={() => {
                              setIsProfileOpen(false);
                              router.push('/wallet');
                            }}
                            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                          >
                            <Wallet className="w-4 h-4" />
                            <span>Wallet</span>
                          </button>
                          <div className="h-px bg-white/10 my-1"></div>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </>
              ) : (
                // Logged-out user actions
                <motion.button
                  onClick={handleGetStarted}
                  className="relative px-6 py-3 bg-gradient-primary text-white rounded-full font-semibold overflow-hidden group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                  />
                  <span className="relative">Launch App</span>
                </motion.button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2 text-white hover:text-gradient-blue transition-colors duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileTap={{ scale: 0.95 }}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <motion.div
        className={`fixed inset-0 z-40 md:hidden ${isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isMenuOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute inset-0 bg-dark-900/95 backdrop-blur-xl" />
        <div className="relative flex flex-col items-center justify-center min-h-screen space-y-8">
          {isLoggedIn ? (
            // Logged-in mobile menu
            <>
              <Link
                href="/marketplace"
                onClick={() => setIsMenuOpen(false)}
                className="text-2xl font-semibold text-white hover:text-gradient-blue transition-colors duration-300"
              >
                Marketplace
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="text-2xl font-semibold text-white hover:text-gradient-blue transition-colors duration-300"
              >
                Dashboard
              </Link>
              <Link
                href="/create"
                onClick={() => setIsMenuOpen(false)}
                className="text-2xl font-semibold text-white hover:text-gradient-blue transition-colors duration-300"
              >
                Create Agent
              </Link>
              <Link
                href="/settings"
                onClick={() => setIsMenuOpen(false)}
                className="text-2xl font-semibold text-white hover:text-gradient-blue transition-colors duration-300"
              >
                Settings
              </Link>
              
              {/* Mobile User Info */}
              <motion.div
                className="flex flex-col items-center space-y-2 mt-8 p-4 bg-white/5 rounded-xl"
                initial={{ opacity: 0, y: 50 }}
                animate={{ 
                  opacity: isMenuOpen ? 1 : 0, 
                  y: isMenuOpen ? 0 : 50 
                }}
                transition={{ delay: 0.6 }}
              >
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <span className="text-white font-medium">
                  {formatAddress(userAddress || '')}
                </span>
                <span className="text-text-secondary text-sm">
                  {formatBalance(balance)} SUI
                </span>
              </motion.div>

              <motion.button
                onClick={handleLogout}
                className="flex items-center space-x-2 mt-4 px-6 py-3 bg-red-500/20 text-red-400 rounded-full font-semibold"
                initial={{ opacity: 0, y: 50 }}
                animate={{ 
                  opacity: isMenuOpen ? 1 : 0, 
                  y: isMenuOpen ? 0 : 50 
                }}
                transition={{ delay: 0.7 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </motion.button>
            </>
          ) : (
            // Logged-out mobile menu
            <>
              {landingNavItems.map((item, index) => (
                <motion.button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  className="text-2xl font-semibold text-white hover:text-gradient-blue transition-colors duration-300"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ 
                    opacity: isMenuOpen ? 1 : 0, 
                    y: isMenuOpen ? 0 : 50 
                  }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  {item.name}
                </motion.button>
              ))}
              
              <motion.button
                onClick={handleGetStarted}
                className="mt-8 px-8 py-4 bg-gradient-primary text-white rounded-full font-semibold text-xl"
                initial={{ opacity: 0, y: 50 }}
                animate={{ 
                  opacity: isMenuOpen ? 1 : 0, 
                  y: isMenuOpen ? 0 : 50 
                }}
                transition={{ delay: 0.6 }}
                whileTap={{ scale: 0.95 }}
              >
                Launch App
              </motion.button>
            </>
          )}
        </div>
      </motion.div>

      {/* Click outside to close profile dropdown */}
      {isProfileOpen && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </>
  );
};

export default NavBar;
