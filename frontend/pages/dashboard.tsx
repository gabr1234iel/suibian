import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '../context/AppContext';
import { agents } from '../data/agents';
import NavBar from '../components/NavBar';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  Zap
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { isLoggedIn } = useAppContext();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, router]);

  // Mock subscribed agents (first 3 for demo)
  const subscribedAgents = agents.slice(0, 3);

  if (!isLoggedIn) {
    return null; // Will redirect in useEffect
  }

  // Animation variants inspired by acctual.com
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const cardHoverVariants = {
    rest: { scale: 1, y: 0 },
    hover: { scale: 1.02, y: -4 }
  };

  const statsData = [
    {
      title: "Total Portfolio",
      value: "$125,430",
      change: "+12.5%",
      icon: DollarSign,
      color: "emerald",
      bgGradient: "from-emerald-500/20 to-cyan-500/20"
    },
    {
      title: "Active Agents",
      value: subscribedAgents.length.toString(),
      change: "All performing",
      icon: Users,
      color: "blue",
      bgGradient: "from-blue-500/20 to-purple-500/20"
    },
    {
      title: "Monthly P&L",
      value: "+$8,240",
      change: "+7.0%",
      icon: TrendingUp,
      color: "emerald",
      bgGradient: "from-emerald-500/20 to-teal-500/20"
    },
    {
      title: "Total Fees",
      value: "$320",
      change: "this month",
      icon: Activity,
      color: "amber",
      bgGradient: "from-amber-500/20 to-orange-500/20"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Navigation */}
      <NavBar />
      
      {/* Hero Section with Glass Morphism */}
      <motion.div 
        className="relative overflow-hidden pt-20"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 via-transparent to-cyan-600/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-12">{/* ...existing code... */}
          <motion.div 
            className="text-center mb-16"
            variants={itemVariants}
          >
            <motion.div 
              className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-primary-300">Dashboard Overview</span>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-primary-200 to-cyan-300 bg-clip-text text-transparent mb-4"
              variants={itemVariants}
            >
              Portfolio Command Center
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-300 max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Monitor your subscribed trading agents and portfolio performance in real-time
            </motion.p>
          </motion.div>

          {/* Stats Grid with Enhanced Animations */}
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
                  whileHover="hover"
                  initial="rest"
                  animate="rest"
                >
                  <motion.div 
                    className={`relative group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 overflow-hidden`}
                    variants={cardHoverVariants}
                  >
                    {/* Animated Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-gray-400">{stat.title}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className={`text-sm text-${stat.color}-400`}>{stat.change}</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Active Agents Section with Sophisticated Layout */}
          <motion.div 
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 overflow-hidden relative"
            variants={itemVariants}
            whileHover={{ 
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              transition: { duration: 0.3 }
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
                  <h2 className="text-2xl font-bold text-white">Your Active Agents</h2>
                  <p className="text-gray-400">Currently managing your portfolio</p>
                </div>
              </div>
              
              <motion.div 
                className="flex items-center space-x-2 bg-primary-500/20 border border-primary-500/30 rounded-full px-4 py-2"
                whileHover={{ scale: 1.05 }}
              >
                <Zap className="w-4 h-4 text-primary-400" />
                <span className="text-sm text-primary-300">Live</span>
              </motion.div>
            </motion.div>
            
            {/* Agents List */}
            <motion.div 
              className="space-y-6"
              variants={containerVariants}
            >
              {subscribedAgents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.01,
                    transition: { duration: 0.2 }
                  }}
                  className="group"
                >
                  <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden">
                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1 mb-6 lg:mb-0">
                        <div className="flex items-center space-x-4 mb-3">
                          <h3 className="text-xl font-bold text-white group-hover:text-primary-200 transition-colors duration-300">
                            {agent.name}
                          </h3>
                          <motion.span 
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              agent.riskLevel === 'Low' ? 'text-emerald-300 bg-emerald-900/40 border border-emerald-700/50' :
                              agent.riskLevel === 'Medium' ? 'text-amber-300 bg-amber-900/40 border border-amber-700/50' :
                              'text-rose-300 bg-rose-900/40 border border-rose-700/50'
                            }`}
                            whileHover={{ scale: 1.1 }}
                          >
                            {agent.riskLevel} Risk
                          </motion.span>
                        </div>
                        <p className="text-gray-300 mb-4">{agent.strategy}</p>
                        <div className="flex flex-wrap gap-2">
                          {agent.tags.slice(0, 3).map((tag, tagIndex) => (
                            <motion.span
                              key={tagIndex}
                              className="px-3 py-1 bg-primary-900/30 text-primary-300 text-xs rounded-full border border-primary-700/50"
                              whileHover={{ scale: 1.05, y: -2 }}
                              transition={{ duration: 0.2 }}
                            >
                              {tag}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-8">
                        <motion.div 
                          className="text-center"
                          whileHover={{ scale: 1.1 }}
                        >
                          <div className="text-2xl font-bold text-emerald-400 mb-1">
                            +{(agent.performanceMetrics.totalReturn * 0.8).toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-400">Your Return</div>
                        </motion.div>
                        <motion.div 
                          className="text-center"
                          whileHover={{ scale: 1.1 }}
                        >
                          <div className="text-2xl font-bold text-blue-400 mb-1">
                            ${((Math.random() * 20000) + 5000).toFixed(0)}
                          </div>
                          <div className="text-xs text-gray-400">Allocated</div>
                        </motion.div>
                        <motion.div 
                          className="text-center"
                          whileHover={{ scale: 1.1 }}
                        >
                          <div className="text-2xl font-bold text-white mb-1">
                            {agent.fee}%
                          </div>
                          <div className="text-xs text-gray-400">Fee</div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div 
              className="mt-12 text-center"
              variants={itemVariants}
            >
              <motion.button
                onClick={() => router.push('/marketplace')}
                className="group relative px-8 py-4 bg-gradient-to-r from-primary-600 to-cyan-600 text-white rounded-2xl font-semibold overflow-hidden"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 40px -10px rgba(59, 130, 246, 0.5)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span>Discover More Agents</span>
                  <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;