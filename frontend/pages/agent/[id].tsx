import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { agents } from '../../data/agents';
import { Agent } from '../../types';
import NavBar from '../../components/NavBar';

const AgentDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  const agent: Agent | undefined = agents.find((a: Agent) => a.id === id);

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
          onClick={() => router.push('/marketplace')}
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
      case 'Low':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      case 'High':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <NavBar />
      
      <div className="max-w-4xl mx-auto px-6 py-8 pt-24">
      {/* Back Button */}
      <button
        onClick={() => router.push('/marketplace')}
        className="mb-6 flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
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
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(agent.riskLevel)}`}>
                {agent.riskLevel} Risk
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Created by {agent.creator}
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              {agent.description}
            </p>
          </div>
          <div className="lg:ml-8 mt-6 lg:mt-0">
            <button
              onClick={handleSubscribe}
              className={`w-full lg:w-auto px-8 py-3 rounded-lg font-medium transition-colors ${
                isSubscribed
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {isSubscribed ? 'Subscribed ✓' : `Subscribe (${agent.fee}% fee)`}
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center lg:text-left">
              {agent.subscribers} subscribers
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
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

      {/* Strategy Details */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700 p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Strategy Overview
        </h2>
        <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Trading Strategy
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            {agent.strategy}
          </p>
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
              {agent.performanceMetrics.totalReturn}%
            </div>
            <div className="text-gray-600 dark:text-gray-400">Total Return</div>
            <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              All-time performance
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {agent.performanceMetrics.winRate}%
            </div>
            <div className="text-gray-600 dark:text-gray-400">Win Rate</div>
            <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Successful trades
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {agent.performanceMetrics.sharpeRatio}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Sharpe Ratio</div>
            <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Risk-adjusted return
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
              {agent.performanceMetrics.maxDrawdown}%
            </div>
            <div className="text-gray-600 dark:text-gray-400">Max Drawdown</div>
            <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Largest loss period
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AgentDetailPage;
