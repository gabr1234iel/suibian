import React, { useState, useMemo } from "react";
import { useRouter } from "next/router";
import { agents as mockAgents } from "../../data/agents";
import { Agent } from "../../types";
import { useTradingAgent } from "../../hooks/useTradingAgents";
import Header from "@/components/Header";

const AgentDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  // Fetch agent from Firestore
  const { agent: firebaseAgent, loading } = useTradingAgent(
    typeof id === "string" ? id : null
  );

  // Map TradingAgent to Agent type
  const agent: Agent | undefined = useMemo(() => {
    if (firebaseAgent) {
      return {
        id: firebaseAgent.agent_id,
        name: firebaseAgent.name,
        creator: firebaseAgent.creator,
        strategy: `Agent ID: ${firebaseAgent.agent_id.slice(0, 10)}...`,
        description: `${firebaseAgent.total_subscribers} subscribers`,
        riskLevel: firebaseAgent.is_active
          ? "Low"
          : ("High" as "Low" | "Medium" | "High"),
        fee: parseInt(firebaseAgent.subscription_fee) / 1000000000,
        subscribers: firebaseAgent.total_subscribers,
        tags: [
          "Blockchain",
          "Automated",
          firebaseAgent.is_active ? "Active" : "Inactive",
        ],
        performanceMetrics: {
          totalReturn: parseFloat((Math.random() * 50 + 10).toFixed(2)), // Mock for demo
          winRate: parseFloat((Math.random() * 40 + 60).toFixed(1)),
          sharpeRatio: parseFloat((Math.random() * 2 + 1).toFixed(2)),
          maxDrawdown: parseFloat((Math.random() * 15 + 5).toFixed(1)),
        },
        createdAt:
          firebaseAgent.created_at instanceof Date
            ? firebaseAgent.created_at.toISOString()
            : new Date().toISOString(),
      };
    }
    // fallback to mock data
    if (typeof id === "string") {
      return mockAgents.find((a: Agent) => a.id === id);
    }
    return undefined;
  }, [firebaseAgent, id]);

  if (loading) {
    return <div className="text-center py-12 text-white">Loading agent...</div>;
  }

  if (!agent) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Agent Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The trading agent you're looking for doesn't exist.
        </p>
        <button
          onClick={() => router.push("/marketplace")}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Back to Marketplace
        </button>
      </div>
    );
  }

  const handleSubscribe = (): void => {
    setIsSubscribed(!isSubscribed);
  };

  const getRiskColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case "Low":
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900";
      case "Medium":
        return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900";
      case "High":
        return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900";
      default:
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-8 pt-24">
        {/* Back Button */}
        <button
          onClick={() => router.push("/marketplace")}
          className="mb-6 flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>Back to Marketplace</span>
        </button>

        {/* Agent Header */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {agent.name}
                </h1>
                <a
                  href={`https://suiscan.xyz/devnet/object/${agent.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View on SuiScan
                </a>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Created by {agent.creator.slice(0, 6)}...{agent.creator.slice(-4)}
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                {agent.description}
              </p>
            </div>
            <div className="lg:ml-8 mt-6 lg:mt-0">
              <div className="text-center mb-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {agent.subscribers} subscribers
                </div>
              </div>
              <button
                onClick={handleSubscribe}
                className={`w-full lg:w-auto min-w-[200px] px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  isSubscribed
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700"
                }`}
              >
                {isSubscribed
                  ? "Subscribed ✓"
                  : `Subscribe (${agent.fee.toFixed(2)}% fee)`}
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(
                agent.riskLevel
              )}`}
            >
              {agent.riskLevel} Risk
            </span>
            {agent.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Performance Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {agent.performanceMetrics.totalReturn.toFixed(2)}%
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Total Return
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                All-time performance
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {agent.performanceMetrics.winRate.toFixed(1)}%
              </div>
              <div className="text-gray-600 dark:text-gray-400">Win Rate</div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Successful trades
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {agent.performanceMetrics.sharpeRatio.toFixed(2)}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Sharpe Ratio
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Risk-adjusted return
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                {agent.performanceMetrics.maxDrawdown.toFixed(1)}%
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Max Drawdown
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Largest loss period
              </div>
            </div>
          </div>
          
          {/* PnL Chart */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              PnL History (Last 30 Days)
            </h3>
            <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-6">
              <div className="h-64 flex items-end justify-between space-x-1">
                {(() => {
                  const generatePnLData = () => {
                    const points = 30;
                    let value = 100;
                    const data = [];
                    
                    for (let i = 0; i < points; i++) {
                      const change = (Math.random() - 0.4) * 5; // Slight upward bias
                      value = Math.max(80, Math.min(150, value + change));
                      data.push(value);
                    }
                    return data;
                  };
                  
                  const pnlData = generatePnLData();
                  const maxValue = Math.max(...pnlData);
                  const minValue = Math.min(...pnlData);
                  const range = maxValue - minValue;
                  
                  return pnlData.map((value, index) => {
                    const height = range > 0 ? ((value - minValue) / range) * 200 + 20 : 120;
                    const isPositive = value >= 100;
                    
                    return (
                      <div
                        key={index}
                        className={`w-full max-w-[8px] rounded-t-sm transition-all duration-300 hover:opacity-80 ${
                          isPositive 
                            ? 'bg-green-500 dark:bg-green-400' 
                            : 'bg-red-500 dark:bg-red-400'
                        }`}
                        style={{ height: `${height}px` }}
                        title={`Day ${index + 1}: ${value.toFixed(1)}%`}
                      />
                    );
                  });
                })()}
              </div>
              
              {/* Chart Legend */}
              <div className="flex justify-between items-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded"></div>
                    <span>Profit</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 dark:bg-red-400 rounded"></div>
                    <span>Loss</span>
                  </div>
                </div>
                <div className="text-xs">
                  Hover over bars for details
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Details */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            🔒 Secure Trading Strategy
          </h2>
          <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-6 mb-6">
            {(() => {
              const strategies = [
                {
                  name: "Arbitrage Trading",
                  description: "Exploits price differences across multiple DEXes on Sui network. Automatically identifies and captures arbitrage opportunities between Cetus, Turbos, and other major exchanges.",
                  indicators: ["Price spread analysis", "Liquidity monitoring", "Gas cost optimization"],
                  dexes: ["Cetus Protocol", "Turbos Finance", "BlueMove", "Aftermath Finance"],
                  tokenPairs: ["SUI/USDC", "SUI/USDT", "WETH/USDC", "WBTC/USDC"],
                  executionFreq: "1-5 minutes",
                  minTradeSize: "50 SUI",
                  maxSlippage: "0.5%"
                },
                {
                  name: "Momentum Trading", 
                  description: "Follows trending movements in SUI and ecosystem tokens. Uses technical indicators to identify and ride strong price trends while managing risk through stop-losses.",
                  indicators: ["RSI (30/70)", "Moving Average (9/21)", "Volume analysis"],
                  dexes: ["Cetus Protocol", "Turbos Finance", "Kriya DEX"],
                  tokenPairs: ["SUI/USDC", "CETUS/SUI", "TURBOS/SUI"],
                  executionFreq: "15 minutes",
                  minTradeSize: "100 SUI",
                  maxSlippage: "2%"
                },
                {
                  name: "Mean Reversion",
                  description: "Identifies oversold/overbought conditions in Sui DeFi tokens. Buys during dips and sells during peaks based on statistical analysis of price movements.",
                  indicators: ["Bollinger Bands", "RSI divergence", "Support/Resistance levels"],
                  dexes: ["Cetus Protocol", "SuiSwap", "FlowX Finance"],
                  tokenPairs: ["SUI/USDC", "SUI/WETH", "DEEP/SUI"],
                  executionFreq: "1 hour",
                  minTradeSize: "75 SUI",
                  maxSlippage: "1.5%"
                },
                {
                  name: "Grid Trading",
                  description: "Places multiple buy and sell orders at predetermined price levels. Profits from market volatility while maintaining a balanced position in SUI ecosystem tokens.",
                  indicators: ["Grid spacing optimization", "Dynamic rebalancing", "Market volatility analysis"],
                  dexes: ["Cetus Protocol", "Turbos Finance", "Kai Finance"],
                  tokenPairs: ["SUI/USDC", "SUI/USDT", "USDC/USDT"],
                  executionFreq: "5 minutes",
                  minTradeSize: "200 SUI",
                  maxSlippage: "1%"
                },
                {
                  name: "Dollar Cost Averaging",
                  description: "Systematically accumulates positions in high-quality Sui ecosystem tokens. Reduces timing risk through regular, automated purchases regardless of market conditions.",
                  indicators: ["Market sentiment analysis", "Fundamental scoring", "Position sizing algorithms"],
                  dexes: ["Cetus Protocol", "Aftermath Finance", "BlueMove"],
                  tokenPairs: ["SUI/USDC", "WETH/USDC", "BLUE/SUI"],
                  executionFreq: "4 hours",
                  minTradeSize: "50 SUI",
                  maxSlippage: "2%"
                }
              ];
              
              // Generate a consistent strategy based on agent ID
              const agentIdHash = agent.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
              const selectedStrategy = strategies[agentIdHash % strategies.length];
              
              return (
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {selectedStrategy.name}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {selectedStrategy.description}
                    </p>
                  </div>

                  {/* Technical Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        📊 Technical Indicators
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedStrategy.indicators.map((indicator, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                          >
                            {indicator}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        🏪 Active DEXes
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedStrategy.dexes.map((dex, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded-full"
                          >
                            {dex}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        💰 Trading Pairs
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedStrategy.tokenPairs.map((pair, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded-full"
                          >
                            {pair}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        ⚙️ Execution Parameters
                      </h4>
                      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                        <div><span className="font-medium">Frequency:</span> {selectedStrategy.executionFreq}</div>
                        <div><span className="font-medium">Min Trade:</span> {selectedStrategy.minTradeSize}</div>
                        <div><span className="font-medium">Max Slippage:</span> {selectedStrategy.maxSlippage}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="text-blue-600 dark:text-blue-400 mt-0.5">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Nautilus TEE Protected</h4>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  This agent executes trades securely within a Trusted Execution Environment with cryptographic attestation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDetailPage;
