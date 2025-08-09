import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useAppContext } from "../context/AppContext";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  Zap,
  Link, // Added Link icon for subscriptions
} from "lucide-react";
// Import both hooks
import {
  useUserTradingAgents,
  useUserSubscribedAgents, // Import the new hook
} from "../hooks/useTradingAgents"; // Assuming hooks are in the same file for simplicity
import Header from "@/components/Header";

const DashboardPage: React.FC = () => {
  const { isLoggedIn, userAddress } = useAppContext();
  const router = useRouter();

  // Get user's CREATED trading agents from Firebase
  const {
    agents: userTradingAgents,
    loading: agentsLoading,
    error: agentsError,
  } = useUserTradingAgents(userAddress || null);

  // Get user's SUBSCRIBED trading agents from Firebase
  const {
    agents: subscribedAgents,
    loading: subscribedAgentsLoading,
    error: subscribedAgentsError,
  } = useUserSubscribedAgents(userAddress || null);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return null; // Will redirect in useEffect
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const cardHoverVariants = {
    rest: { scale: 1, y: 0 },
    hover: { scale: 1.02, y: -4 },
  };

  // Stats data remains the same
  const statsData = [
    {
      title: "Total Portfolio",
      value: "$125,430",
      change: "+12.5%",
      icon: DollarSign,
      color: "emerald",
      bgGradient: "from-emerald-500/20 to-cyan-500/20",
    },
    {
      title: "Active Agents",
      value: userTradingAgents
        .filter((agent) => agent.is_active)
        .length.toString(),
      change: "All performing",
      icon: Users,
      color: "blue",
      bgGradient: "from-blue-500/20 to-purple-500/20",
    },
    {
      title: "Monthly P&L",
      value: "+$8,240",
      change: "+7.0%",
      icon: TrendingUp,
      color: "emerald",
      bgGradient: "from-emerald-500/20 to-teal-500/20",
    },
    {
      title: "Total Fees",
      value: `$${(
        userTradingAgents.reduce(
          (total, agent) =>
            total + parseInt(agent.subscription_fee) / 1000000000,
          0
        ) * userTradingAgents.length
      ).toFixed(0)}`,
      change: "this month",
      icon: Activity,
      color: "amber",
      bgGradient: "from-blue-500/20 to-purple-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <Header />
      <motion.div
        className="relative overflow-hidden pt-20"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-green-500/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <motion.div className="mb-16" variants={itemVariants}>
            <motion.h1
              className="text-3xl md:text-4xl font-bold text-white bg-clip-text text-transparent mb-4 text-left"
              variants={itemVariants}
            >
              Portfolio Command Center
            </motion.h1>
            <motion.p
              className="text-m text-gray-300 text-left"
              variants={itemVariants}
            >
              Monitor your subscribed trading agents and portfolio performance
              in real-time.
            </motion.p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
            variants={containerVariants}
          >
            {statsData.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  variants={itemVariants}
                  initial="rest"
                  animate="rest"
                >
                  <motion.div
                    className={`relative group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 overflow-hidden`}
                    variants={cardHoverVariants}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`w-12 h-12 bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                        >
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-400">{stat.title}</p>
                        <p className="text-2xl font-bold text-white">
                          {stat.value}
                        </p>
                        <p className={`text-sm text-${stat.color}-400`}>
                          {stat.change}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* User's CREATED Agents Section */}
          <motion.div
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 overflow-hidden relative"
            variants={itemVariants}
            whileHover={{
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              transition: { duration: 0.3 },
            }}
          >
            {/* Section Header */}
            <motion.div
              className="flex items-center justify-between mb-8"
              variants={itemVariants}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Your Created Agents
                  </h2>
                  <p className="text-gray-400">Agents you have built</p>
                </div>
              </div>
            </motion.div>
            {/* Content for user's created agents... */}
            {agentsLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <span className="ml-3 text-gray-400">
                  Loading your trading agents...
                </span>
              </div>
            )}
            {agentsError && (
              <div className="text-center py-12">
                <p className="text-red-400">Error: {agentsError}</p>
              </div>
            )}
            {!agentsLoading &&
              !agentsError &&
              userTradingAgents.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400">
                    You haven't created any agents yet.
                  </p>
                </div>
              )}
            {!agentsLoading && !agentsError && userTradingAgents.length > 0 && (
              <div className="space-y-6">
                {/* Mapping over userTradingAgents */}
                {userTradingAgents.map((agent) => (
                  <div
                    key={agent.agent_id}
                    className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
                    onClick={() =>
                      router.push(`/creator-agents/${agent.agent_id}`)
                    }
                  >
                    {/* ... agent card JSX ... */}
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1 mb-6 lg:mb-0">
                        <div className="flex items-center space-x-4 mb-3">
                          <h3 className="text-xl font-bold text-white group-hover:text-primary-200 transition-colors duration-300">
                            {agent.name}
                          </h3>
                        </div>
                        <p className="text-gray-300 mb-4">Creator: You</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* ==================================================================== */}
          {/* NEW: User's SUBSCRIBED Agents Section */}
          {/* ==================================================================== */}
          <motion.div
            className="mt-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 overflow-hidden relative"
            variants={itemVariants}
            whileHover={{
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              transition: { duration: 0.3 },
            }}
          >
            {/* Section Header */}
            <motion.div
              className="flex items-center justify-between mb-8"
              variants={itemVariants}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <Link className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Your Subscribed Agents
                  </h2>
                  <p className="text-gray-400">
                    Agents you are currently following
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Loading state */}
            {subscribedAgentsLoading && (
              <motion.div
                className="flex items-center justify-center py-12"
                variants={itemVariants}
              >
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <span className="ml-3 text-gray-400">
                  Loading your subscriptions...
                </span>
              </motion.div>
            )}

            {/* Error state */}
            {subscribedAgentsError && (
              <motion.div className="text-center py-12" variants={itemVariants}>
                <p className="text-red-400 mb-4">
                  Error loading subscriptions: {subscribedAgentsError}
                </p>
                <button
                  onClick={() => window.location.reload()} // Simple refresh action
                  className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/30 transition-colors"
                >
                  Try Again
                </button>
              </motion.div>
            )}

            {/* Empty state */}
            {!subscribedAgentsLoading &&
              !subscribedAgentsError &&
              subscribedAgents.length === 0 && (
                <motion.div
                  className="text-center py-12"
                  variants={itemVariants}
                >
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Link className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-gray-400 mb-4">
                    You haven't subscribed to any trading agents yet.
                  </p>
                  <motion.button
                    onClick={() => router.push("/marketplace")}
                    className="px-6 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-500/30 transition-colors"
                    whileHover={{ scale: 1.05 }}
                  >
                    Explore Marketplace
                  </motion.button>
                </motion.div>
              )}

            {/* Agents List */}
            {!subscribedAgentsLoading &&
              !subscribedAgentsError &&
              subscribedAgents.length > 0 && (
                <motion.div className="space-y-6" variants={containerVariants}>
                  {subscribedAgents.map((agent, index) => (
                    <motion.div
                      key={agent.agent_id}
                      variants={itemVariants}
                      whileHover={{
                        scale: 1.01,
                        transition: { duration: 0.2 },
                      }}
                      className="group cursor-pointer"
                      onClick={() => router.push(`/agents/${agent.agent_id}`)} // Link to public marketplace page
                    >
                      <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex-1 mb-6 lg:mb-0">
                            <div className="flex items-center space-x-4 mb-3">
                              <h3 className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors duration-300">
                                {agent.name}
                              </h3>
                              <motion.span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  agent.is_active
                                    ? "text-emerald-300 bg-emerald-900/40 border border-emerald-700/50"
                                    : "text-red-300 bg-red-900/40 border border-red-700/50"
                                }`}
                                whileHover={{ scale: 1.1 }}
                              >
                                {agent.is_active ? "Active" : "Inactive"}
                              </motion.span>
                            </div>
                            <p className="text-gray-300 mb-4">
                              Creator: {agent.creator.slice(0, 10)}...
                              {agent.creator.slice(-4)}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                            <motion.div
                              className="text-center"
                              whileHover={{ scale: 1.1 }}
                            >
                              <div className="text-2xl font-bold text-emerald-400 mb-1">
                                {agent.total_subscribers}
                              </div>
                              <div className="text-xs text-gray-400">
                                Subscribers
                              </div>
                            </motion.div>
                            <motion.div
                              className="text-center"
                              whileHover={{ scale: 1.1 }}
                            >
                              <div className="text-2xl font-bold text-blue-400 mb-1">
                                {(
                                  parseInt(agent.subscription_fee) / 1000000000
                                ).toFixed(2)}{" "}
                                SUI
                              </div>
                              <div className="text-xs text-gray-400">
                                Sub Fee
                              </div>
                            </motion.div>
                            <motion.div
                              className="text-center"
                              whileHover={{ scale: 1.1 }}
                            >
                              <div className="text-2xl font-bold text-white mb-1">
                                {(agent.created_at &&
                                typeof agent.created_at === "object" &&
                                "toDate" in agent.created_at
                                  ? agent.created_at.toDate()
                                  : new Date(agent.created_at)
                                ).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-400">
                                Created
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
