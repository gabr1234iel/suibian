// import React from "react";
// import Link from "next/link";
// import { useRouter } from "next/router";
// import { useAppContext } from "../context/AppContext";

// const SparklesIcon = ({ className }: { className?: string }) => (
//   <svg
//     className={className}
//     fill="none"
//     stroke="currentColor"
//     viewBox="0 0 24 24"
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       strokeWidth={2}
//       d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.5 2.5L16 4.5 13.5 7M21 8l-3.5 3.5L16 10l1.5-1.5M21 21l-3.5-3.5L16 19l1.5 1.5"
//     />
//   </svg>
// );

// const Header: React.FC = () => {
//   const { isLoggedIn, logout, theme, toggleTheme, userAddress, balance } = useAppContext();
//   const router = useRouter();

//   const handleLogout = (): void => {
//     logout();
//     router.push("/login");
//   };

//   return (
//     <header className="bg-dark-800 border-b border-gray-700 backdrop-blur-sm bg-opacity-95 sticky top-0 z-50">
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-between h-16">
//           {/* Logo */}
//           <Link href="/marketplace" className="flex items-center space-x-2">
//             <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
//               <SparklesIcon className="w-5 h-5 text-white" />
//             </div>
//             <span className="text-2xl font-bold bg-gradient-to-r from-gradient-blue to-gradient-purple bg-clip-text text-transparent">
//               SuiBian
//             </span>
//           </Link>

//           {/* Navigation */}
//           <nav className="hidden md:flex space-x-8">
//             {isLoggedIn ? (
//               <>
//                 <Link
//                   href="/marketplace"
//                   className="text-text-secondary hover:text-gradient-blue transition-colors font-medium"
//                 >
//                   Marketplace
//                 </Link>
//                 <Link
//                   href="/dashboard"
//                   className="text-text-secondary hover:text-gradient-blue transition-colors font-medium"
//                 >
//                   Dashboard
//                 </Link>
//                 <Link
//                   href="/create"
//                   className="text-text-secondary hover:text-gradient-blue transition-colors font-medium"
//                 >
//                   Create Agent
//                 </Link>
//                 <Link
//                   href="/settings"
//                   className="text-text-secondary hover:text-gradient-blue transition-colors font-medium"
//                 >
//                   Settings
//                 </Link>
//               </>
//             ) : (
//               <Link
//                 href="/login"
//                 className="text-text-secondary hover:text-gradient-blue transition-colors font-medium"
//               >
//                 Sign In
//               </Link>
//             )}
//           </nav>

//           {/* Right side buttons */}
//           <div className="flex items-center space-x-4">
//             {/* Wallet info - only show when logged in */}
//             {isLoggedIn && userAddress && (
//               <div className="hidden lg:flex items-center space-x-3 px-4 py-2 bg-dark-700/50 rounded-lg border border-gray-600">
//                 <div className="flex items-center space-x-2">
//                   <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//                   <span className="text-xs text-text-secondary">Wallet</span>
//                 </div>
//                 <div className="border-l border-gray-600 pl-3">
//                   <div className="text-xs text-white font-mono">
//                     {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
//                   </div>
//                   {balance !== null && (
//                     <div className="text-xs text-gradient-blue">
//                       {balance.toFixed(3)} SUI
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Theme toggle button */}
//             <button
//               onClick={toggleTheme}
//               className="p-2 rounded-lg bg-dark-700 text-text-secondary hover:bg-dark-600 hover:text-white transition-colors"
//               aria-label="Toggle theme"
//             >
//               {theme === "light" ? (
//                 <svg
//                   className="w-5 h-5"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
//                   />
//                 </svg>
//               ) : (
//                 <svg
//                   className="w-5 h-5"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
//                   />
//                 </svg>
//               )}
//             </button>

//             {/* Auth buttons */}
//             {isLoggedIn ? (
//               <button
//                 onClick={handleLogout}
//                 className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
//               >
//                 Sign Out
//               </button>
//             ) : (
//               <Link
//                 href="/login"
//                 className="px-4 py-2 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
//               >
//                 Get Started
//               </Link>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;

// src/components/Header.tsx
import React, { useState } from "react";
import logo from "../assets/logo.png"; // Adjust the import path as necessary
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/router";
import Link from "next/link";

// Placeholder for your actual logo SVG or Image component
const SuiBianLogo = () => (
  <img src={logo.src} alt="SuiBian Logo" className="w-6 h-6" />
);

const Header = () => {
  const { isLoggedIn, logout, userAddress, balance } = useAppContext();
  const router = useRouter();
  const [showWalletPopup, setShowWalletPopup] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLogout = (): void => {
    logout();
    router.push("/login");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navLinks = [
    { name: "Why Us", id: "why-us" },
    { name: "How It Works", id: "how-it-works" },
    { name: "Marketplace", id: "marketplace" },
    { name: "For Everyone", id: "for-everyone" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Frosted glass background */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border-b border-white/10 rounded-lg"></div>

        <div className="relative flex items-center justify-between cursor-pointer">
          {/* Left Side: Logo and Name */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => {
              if (isLoggedIn) {
                router.push("/marketplace");
              } else {
                router.push("/");
                // Optionally scroll to top of landing page
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            <SuiBianLogo />
            <span className="text-xl font-bold text-white drop-shadow-sm">
              SuiBian
            </span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {isLoggedIn ? (
              <>
                <Link
                  href="/marketplace"
                  className="text-white/80 hover:text-white transition-colors font-medium"
                >
                  Marketplace
                </Link>
                <Link
                  href="/dashboard"
                  className="text-white/80 hover:text-white transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/create"
                  className="text-white/80 hover:text-white transition-colors font-medium"
                >
                  Create Agent
                </Link>
                <Link
                  href="/settings"
                  className="text-white/80 hover:text-white transition-colors font-medium"
                >
                  Settings
                </Link>
              </>
            ) : (
              <>
                {/* Landing Page Navigation Links */}
                <nav className="hidden md:flex items-center space-x-6">
                  {navLinks.map((link) => (
                    <button
                      key={link.name}
                      onClick={() => scrollToSection(link.id)}
                      className="text-sm font-medium text-white/80 hover:text-white transition-all duration-200 hover:drop-shadow-sm cursor-pointer"
                    >
                      {link.name}
                    </button>
                  ))}
                </nav>
              </>
            )}
          </nav>

          {isLoggedIn && userAddress && (
            <div className="relative">
              <div
                className="hidden lg:flex items-center space-x-3 px-4 py-2 bg-dark-700/50 rounded-lg border border-gray-600 cursor-pointer transition-colors duration-200 hover:bg-dark-700/70 hover:ring-2 hover:ring-blue-400/60"
                onClick={() => setShowWalletPopup(true)}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-text-secondary">Wallet</span>
                </div>
                <div className="border-l border-gray-600 pl-3">
                  <div className="text-xs text-white font-mono">
                    {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                  </div>
                  {balance !== null && (
                    <div className="text-xs text-gradient-blue">
                      {balance.toFixed(3)} SUI
                    </div>
                  )}
                </div>
              </div>

              {/* Wallet Popup */}
              {showWalletPopup && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    onClick={() => setShowWalletPopup(false)}
                  />

                  {/* Popup */}
                  <div className="absolute top-full right-0 mt-2 w-80 bg-dark-800/95 backdrop-blur-xl border border-gray-600/50 rounded-xl shadow-2xl p-6 z-50">
                    <div className="space-y-4 hover:bg-dark-700/30 transition-colors duration-200 rounded-lg p-1">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                          Wallet Details
                        </h3>
                        <button
                          onClick={() => setShowWalletPopup(false)}
                          className="text-gray-400 hover:text-white transition-colors p-1"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Balance */}
                      <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-blue-500/20 rounded-lg p-4 hover:from-blue-500/20 hover:to-green-500/20 hover:border-blue-500/30 transition-all duration-200">
                        <p className="text-sm text-gray-400 mb-1">Balance</p>
                        <p className="text-2xl font-bold text-white">
                          {balance !== null
                            ? `${balance.toFixed(4)} SUI`
                            : "Loading..."}
                        </p>
                      </div>

                      {/* Address */}
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">Sui Address</p>
                        <div className="bg-dark-700/50 border border-gray-600 rounded-lg p-3 hover:bg-dark-700/80 hover:border-gray-500 transition-all duration-200">
                          <div className="flex items-center justify-between">
                            <code className="text-xs text-blue-400 font-mono break-all mr-2">
                              {userAddress}
                            </code>
                            <button
                              onClick={() => copyToClipboard(userAddress)}
                              className="flex-shrink-0 p-2 text-gray-400 hover:text-white hover:bg-gray-600/50 rounded-md transition-colors duration-200"
                              title="Copy address"
                            >
                              {copied ? (
                                <svg
                                  className="w-4 h-4 text-green-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                        {copied && (
                          <p className="text-xs text-green-400 animate-fade-in">
                            ✓ Address copied to clipboard
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-500/90 to-green-500/90 backdrop-blur-sm rounded-md hover:from-blue-600 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border border-white/20"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
