import React, { useState } from 'react';
import { agents } from '../data/agents';
import AgentCard from '../components/AgentCard';
import { Agent } from '../types';

const MarketplacePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRisk, setSelectedRisk] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('totalReturn');

  const filteredAndSortedAgents = React.useMemo(() => {
    let filtered = agents.filter((agent: Agent) => {
      const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          agent.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRisk = selectedRisk === 'All' || agent.riskLevel === selectedRisk;
      
      return matchesSearch && matchesRisk;
    });

    // Sort agents
    filtered.sort((a: Agent, b: Agent) => {
      switch (sortBy) {
        case 'totalReturn':
          return b.performanceMetrics.totalReturn - a.performanceMetrics.totalReturn;
        case 'winRate':
          return b.performanceMetrics.winRate - a.performanceMetrics.winRate;
        case 'subscribers':
          return b.subscribers - a.subscribers;
        case 'fee':
          return a.fee - b.fee;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedRisk, sortBy]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Trading Strategy Marketplace
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover and subscribe to automated trading strategies from expert creators
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Strategies
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, description, or tags..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Risk Level Filter */}
          <div>
            <label htmlFor="risk" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Risk Level
            </label>
            <select
              id="risk"
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="All">All Levels</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="totalReturn">Total Return</option>
              <option value="winRate">Win Rate</option>
              <option value="subscribers">Popularity</option>
              <option value="fee">Lowest Fee</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          Showing {filteredAndSortedAgents.length} of {agents.length} strategies
        </p>
      </div>

      {/* Agents Grid */}
      {filteredAndSortedAgents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedAgents.map((agent: Agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.175-5.5-2.971M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            No strategies found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search criteria or filters
          </p>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
