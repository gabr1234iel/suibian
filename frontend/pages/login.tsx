import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '../context/AppContext';
import LoadingScreen from '../components/LoadingScreen';
import {
  GoogleOAuthProvider,
  GoogleLogin,
  type CredentialResponse,
} from "@react-oauth/google";

const GOOGLE_CLIENT_ID =
  "1027686321621-8j8ctl1uld0bv85ndac92bd8smr3cim0.apps.googleusercontent.com";

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.5 2.5L16 4.5 13.5 7M21 8l-3.5 3.5L16 10l1.5-1.5M21 21l-3.5-3.5L16 19l1.5 1.5" />
  </svg>
);

const LoginPage: React.FC = () => {
  const { isLoggedIn, login, nonce, isLoadingUser, userAddress, isFirstTimeUser, balance, isBalanceLoading, logout } = useAppContext();
  const router = useRouter();
  const [showLoading, setShowLoading] = useState(true);

  // Show loading screen for 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    await login(credentialResponse);
    router.push('/marketplace');
  };

  // Redirect if already logged in
  React.useEffect(() => {
    if (isLoggedIn && !showLoading) {
      router.push('/marketplace');
    }
  }, [isLoggedIn, router, showLoading]);

  // Show loading screen
  if (showLoading) {
    return <LoadingScreen />;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-dark-900 flex items-center justify-center px-6">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-blue opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-purple opacity-10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-md mx-auto bg-dark-800/95 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl p-8 min-h-[600px] flex flex-col justify-center">
          <div className="text-center">
            {/* Logo with playful bounce */}
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg shadow-gradient-blue/30 animate-pulse">
                  <SparklesIcon className="w-7 h-7 text-white" />
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-gradient-blue to-gradient-purple bg-clip-text text-transparent">
                  SuiBian
                </span>
              </div>
              <p className="text-text-secondary">
                🚀 Secure zkLogin Authentication
              </p>
            </div>

            {!isLoggedIn ? (
              <>
                {/* Welcome section */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    👋 Welcome Back!
                  </h2>
                  <p className="text-text-secondary mb-6">
                    Ready to dive back into the future of trading? Let's get you connected! 🌟
                  </p>
                </div>

                {/* Features with playful design */}
                <div className="space-y-4 mb-8 text-left">
                  <div className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-dark-700/50 transition-all duration-300 cursor-pointer">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-gradient-blue/30 to-gradient-blue/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-lg">🔗</span>
                    </div>
                    <span className="text-text-secondary text-sm group-hover:text-white transition-colors duration-300">
                      Persistent Sui wallet address
                    </span>
                  </div>
                  <div className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-dark-700/50 transition-all duration-300 cursor-pointer">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-gradient-purple/30 to-gradient-purple/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-lg">🛡️</span>
                    </div>
                    <span className="text-text-secondary text-sm group-hover:text-white transition-colors duration-300">
                      Secure blockchain authentication
                    </span>
                  </div>
                  <div className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-dark-700/50 transition-all duration-300 cursor-pointer">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-gradient-cyan/30 to-gradient-cyan/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-lg">🎯</span>
                    </div>
                    <span className="text-text-secondary text-sm group-hover:text-white transition-colors duration-300">
                      No seed phrases to remember
                    </span>
                  </div>
                </div>

                {/* Google Login */}
                {isLoadingUser && (
                  <div className="mb-6">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-8 w-8 border-3 border-gradient-blue border-t-transparent"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs">🔄</span>
                        </div>
                      </div>
                      <span className="text-text-secondary animate-pulse">✨ Creating your secure connection...</span>
                    </div>
                  </div>
                )}
                
                {nonce && !isLoadingUser && (
                  <div className="mb-6">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-gradient-blue to-gradient-purple rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                      <div className="relative">
                        <GoogleLogin
                          onSuccess={handleGoogleLoginSuccess}
                          onError={() => console.error("Login Failed")}
                          useOneTap
                          nonce={nonce}
                          theme="filled_black"
                          size="large"
                          width="100%"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-xs text-text-muted">
                  🔒 By signing in, you agree to our{' '}
                  <span className="text-gradient-blue hover:underline cursor-pointer hover:scale-105 inline-block transition-transform">Terms of Service</span>{' '}
                  and{' '}
                  <span className="text-gradient-blue hover:underline cursor-pointer hover:scale-105 inline-block transition-transform">Privacy Policy</span>
                </p>

                {/* Firebase notice */}
                <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-xl">
                  <p className="text-xs text-yellow-300">
                    ⚠️ <strong>Note:</strong> Firebase data persistence may be limited due to security rules. 
                    Your login will work, but user data might not persist between sessions.
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Logged in state */}
                <div className="mb-6 p-4 bg-gradient-to-r from-gradient-primary/10 to-gradient-secondary/10 border border-gradient-blue/30 rounded-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse"></div>
                  <div className="relative">
                    {isFirstTimeUser ? (
                      <p className="text-gradient-blue font-medium">
                        🎉 Welcome to SuiBian! Your account has been created successfully.
                      </p>
                    ) : (
                      <p className="text-gradient-blue font-medium">
                        👋 Welcome back! Your account has been restored.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="group">
                    <p className="text-sm text-text-secondary mb-2 flex items-center">
                      <span className="mr-2">🔗</span>
                      Your Sui Address:
                    </p>
                    <div className="p-4 bg-dark-700/50 border border-gray-600 rounded-xl group-hover:border-gradient-blue/50 transition-colors duration-300">
                      <code className="text-xs text-gradient-blue break-all font-mono">
                        {userAddress}
                      </code>
                    </div>
                  </div>

                  <div className="text-center p-4 bg-dark-700/30 rounded-xl">
                    {isBalanceLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-gradient-blue border-t-transparent"></div>
                        <span className="text-text-secondary">💰 Loading balance...</span>
                      </div>
                    ) : (
                      <p className="text-lg font-semibold text-white">
                        💰 Balance: {balance !== null ? `${balance.toFixed(4)} SUI` : "N/A"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/marketplace')}
                    className="group w-full py-4 px-6 bg-gradient-primary text-white font-bold rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg shadow-gradient-blue/30 hover:shadow-xl hover:shadow-gradient-blue/50 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <span className="relative">🚀 Continue to Marketplace</span>
                  </button>
                  <button
                    onClick={logout}
                    className="w-full py-4 px-6 bg-dark-700/50 border border-gray-600 text-text-secondary font-medium rounded-2xl hover:border-gray-500 hover:bg-dark-700 transition-all duration-300"
                  >
                    👋 Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Back to Landing - More playful */}
        <button
          onClick={() => router.push('/landing')}
          className="group absolute top-6 left-6 flex items-center space-x-2 text-text-secondary hover:text-white transition-all duration-300 px-4 py-2 rounded-full hover:bg-dark-800/50 backdrop-blur-sm"
        >
          <span className="group-hover:-translate-x-1 transition-transform duration-300">🏠</span>
          <span>Back to Home</span>
        </button>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;
