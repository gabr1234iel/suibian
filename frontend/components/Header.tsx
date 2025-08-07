import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAppContext } from "../context/AppContext";

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.5 2.5L16 4.5 13.5 7M21 8l-3.5 3.5L16 10l1.5-1.5M21 21l-3.5-3.5L16 19l1.5 1.5"
    />
  </svg>
);

const Header: React.FC = () => {
  const { isLoggedIn, logout, theme, toggleTheme, userAddress, balance } = useAppContext();
  const router = useRouter();

  const handleLogout = (): void => {
    logout();
    router.push("/login");
  };

  return (
    <header className="bg-dark-800 border-b border-gray-700 backdrop-blur-sm bg-opacity-95 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/marketplace" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-gradient-blue to-gradient-purple bg-clip-text text-transparent">
              SuiBian
            </span>
          </Link>

          {/* Navigation */}
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
              <Link
                href="/login"
                className="text-text-secondary hover:text-gradient-blue transition-colors font-medium"
              >
                Sign In
              </Link>
            )}
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {/* Wallet info - only show when logged in */}
            {isLoggedIn && userAddress && (
              <div className="hidden lg:flex items-center space-x-3 px-4 py-2 bg-dark-700/50 rounded-lg border border-gray-600">
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
            )}

            {/* Theme toggle button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-dark-700 text-text-secondary hover:bg-dark-600 hover:text-white transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
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
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              ) : (
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
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              )}
            </button>

            {/* Auth buttons */}
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
                className="px-4 py-2 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;