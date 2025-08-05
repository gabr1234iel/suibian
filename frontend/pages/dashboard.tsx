import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '../context/AppContext';
import { agents } from '../data/agents';

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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor your subscribed trading agents and portfolio performance
        </p>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Portfolio</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">$125,430</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 dark:text-green-400">+12.5%</span>
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">this month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Agents</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{subscribedAgents.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-blue-600 dark:text-blue-400">All performing</span>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly P&L</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">+$8,240</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 dark:text-green-400">+7.0%</span>
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">vs last month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Fees Paid</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">$320</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">this month</span>
          </div>
        </div>
      </div>

      {/* Subscribed Agents */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700 p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Your Active Agents
        </h2>
        
        <div className="space-y-6">
          {subscribedAgents.map((agent) => (
            <div key={agent.id} className="border border-gray-200 dark:border-dark-700 rounded-lg p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {agent.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      agent.riskLevel === 'Low' ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900' :
                      agent.riskLevel === 'Medium' ? 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900' :
                      'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900'
                    }`}>
                      {agent.riskLevel} Risk
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {agent.strategy}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {agent.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-6 mt-6 lg:mt-0 lg:ml-8">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      +{(agent.performanceMetrics.totalReturn * 0.8).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Your Return</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      ${((Math.random() * 20000) + 5000).toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Allocated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {agent.fee}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Fee</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/marketplace')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Discover More Agents
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
