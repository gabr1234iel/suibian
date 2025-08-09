import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAppContext } from "../context/AppContext";
import LoadingScreen from "../components/LoadingScreen";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  type CredentialResponse,
} from "@react-oauth/google";

const GOOGLE_CLIENT_ID =
  "1027686321621-8j8ctl1uld0bv85ndac92bd8smr3cim0.apps.googleusercontent.com";

const LoginPage: React.FC = () => {
  const {
    isLoggedIn,
    login,
    nonce,
    isLoadingUser,
    userAddress,
    isFirstTimeUser,
    balance,
    isBalanceLoading,
    logout,
    isZkLoginReady,
    initializeZkLoginSession,
  } = useAppContext();
  const router = useRouter();
  const [showLoading, setShowLoading] = useState(true);
  const [isInitializingLogin, setIsInitializingLogin] = useState(false);

  // Show loading screen for 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleGoogleLoginSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    await login(credentialResponse);
    router.push("/marketplace");
  };

  const handleStartLogin = async () => {
    setIsInitializingLogin(true);
    try {
      const result = await initializeZkLoginSession();
      if (!result) {
        alert("Failed to initialize login session. Please try again.");
      }
    } catch (error) {
      console.error("Failed to initialize login session:", error);
      alert("Failed to initialize login session. Please try again.");
    } finally {
      setIsInitializingLogin(false);
    }
  };

  // Redirect if already logged in
  React.useEffect(() => {
    if (isLoggedIn && !showLoading) {
      router.push("/marketplace");
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
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 opacity-30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 opacity-30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-md mx-auto bg-dark-800/95 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl p-8 min-h-[600px] flex flex-col justify-center">
          {!isLoggedIn ? (
            <>
              {/* Welcome section */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Log in to SuiBian
                </h2>
                <p className="text-xs text-text-muted">
                  By signing in, you agree to our{" "}
                  <span className="text-blue-400 hover:underline cursor-pointer inline-block transition-transform">
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span className="text-blue-400 hover:underline cursor-pointer inline-block transition-transform">
                    Privacy Policy
                  </span>
                </p>
              </div>

              {/* Features with playful design */}
              <div className="space-y-4 mb-8 text-left">
                <div className="border border-gray-700 group flex items-center space-x-3 p-3 rounded-xl hover:bg-dark-700/50 transition-all duration-300">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500/30 to-blue-500/10 rounded-full flex items-center justify-center transition-transform duration-300">
                    <span className="text-lg">🔗</span>
                  </div>
                  <span className="text-text-secondary text-sm group-hover:text-white transition-colors duration-300">
                    Persistent Sui wallet address
                  </span>
                </div>
                <div className="border border-gray-700 group flex items-center space-x-3 p-3 rounded-xl hover:bg-dark-700/50 transition-all duration-300">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500/30 to-green-500/10 rounded-full flex items-center justify-center transition-transform duration-300">
                    <span className="text-lg">🛡️</span>
                  </div>
                  <span className="text-text-secondary text-sm group-hover:text-white transition-colors duration-300">
                    Secure blockchain authentication
                  </span>
                </div>
                <div className="border border-gray-700 group flex items-center space-x-3 p-3 rounded-xl hover:bg-dark-700/50 transition-all duration-300">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-400/30 to-green-400/10 rounded-full flex items-center justify-center transition-transform duration-300">
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
                      <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-500 border-t-transparent"></div>
                    </div>
                    <span className="text-text-secondary animate-pulse">
                      Creating your secure connection...
                    </span>
                  </div>
                </div>
              )}

              {!nonce && !isLoadingUser && !isInitializingLogin && (
                <div className="mb-6">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                    <div className="relative">
                      <button
                        onClick={handleStartLogin}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        Start zkLogin Session
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isInitializingLogin && (
                <div className="mb-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-blue-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    Initializing secure session...
                  </div>
                </div>
              )}

              {nonce && !isLoadingUser && (
                <div className="mb-6">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-300"></div>

                    <GoogleLogin
                      onSuccess={handleGoogleLoginSuccess}
                      onError={() => console.error("Login Failed")}
                      useOneTap={false}
                      nonce={nonce}
                      theme="outline"
                      size="large"
                      width="100%"
                      text="signin_with"
                      shape="rectangular"
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Logged in state */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-blue-500/30 rounded-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse"></div>
                <div className="relative">
                  {isFirstTimeUser ? (
                    <p className="text-blue-400 font-medium">
                      🎉 Welcome to SuiBian! Your account has been created
                      successfully.
                    </p>
                  ) : (
                    <p className="text-blue-400 font-medium">
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
                  <div className="p-4 bg-dark-700/50 border border-gray-600 rounded-xl group-hover:border-blue-500/50 transition-colors duration-300">
                    <code className="text-xs text-blue-400 break-all font-mono">
                      {userAddress}
                    </code>
                  </div>
                </div>

                <div className="text-center p-4 bg-dark-700/30 rounded-xl">
                  {isBalanceLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                      <span className="text-text-secondary">
                        💰 Loading balance...
                      </span>
                    </div>
                  ) : (
                    <p className="text-lg font-semibold text-white">
                      💰 Balance:{" "}
                      {balance !== null ? `${balance.toFixed(4)} SUI` : "N/A"}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => router.push("/marketplace")}
                  className="group w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 relative overflow-hidden"
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
        onClick={() => router.push("/landing")}
        className="group absolute top-6 left-6 flex items-center space-x-2 text-text-secondary hover:text-white transition-all duration-300 px-4 py-2 rounded-full hover:bg-dark-800/50 backdrop-blur-sm"
      >
        <span className="group-hover:-translate-x-1 transition-transform duration-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7m4 14l-7-7 7-7"
            />
          </svg>
        </span>
        <span>Back to Home</span>
      </button>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;
