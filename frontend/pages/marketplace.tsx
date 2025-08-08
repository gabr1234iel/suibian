import React, { useState } from "react";
import { agents } from "../data/agents";
import AgentCard from "../components/AgentCard";
import { Agent } from "../types";
import { useTradingAgents } from "../hooks/useTradingAgents";
import { TradingAgent } from "../api/marketplaceApi";
import Header from "@/components/Header";

const MarketplacePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedRisk, setSelectedRisk] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("totalReturn");

  // Get trading agents from Firebase
  const {
    agents: firebaseAgents,
    loading,
    error,
    hasMore,
    fetchMore,
    searchAgents,
    clearSearch,
  } = useTradingAgents({
    isActive: true,
    limitCount: 50,
  });

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Use Firebase search for better results
      searchAgents(searchTerm.trim());
    } else {
      clearSearch();
    }
  };

  // Handle search term changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (!value.trim()) {
      clearSearch();
    }
  };

  // Convert Firebase agents to display format and combine with mock data for demo
  const allAgents: Agent[] = React.useMemo(() => {
    const convertedFirebaseAgents: Agent[] = firebaseAgents.map(
      (fbAgent: TradingAgent) => ({
        id: fbAgent.agent_id,
        name: fbAgent.name,
        creator: fbAgent.creator,
        strategy: `Agent ID: ${fbAgent.agent_id.slice(0, 10)}...`,
        description: `Created by ${fbAgent.creator.slice(0, 8)}... • ${
          fbAgent.total_subscribers
        } subscribers`,
        riskLevel: fbAgent.is_active
          ? "Low"
          : ("High" as "Low" | "Medium" | "High"), // Simple mapping for demo
        fee: parseInt(fbAgent.subscription_fee) / 1000000000, // Convert from mist to SUI
        subscribers: fbAgent.total_subscribers,
        tags: [
          "Blockchain",
          "Automated",
          fbAgent.is_active ? "Active" : "Inactive",
        ],
        performanceMetrics: {
          totalReturn: Math.random() * 50 + 10, // Mock data for demo
          winRate: Math.random() * 40 + 60, // Mock data for demo
          sharpeRatio: Math.random() * 2 + 1,
          maxDrawdown: Math.random() * 15 + 5,
        },
        createdAt:
          fbAgent.created_at instanceof Date
            ? fbAgent.created_at.toISOString()
            : new Date().toISOString(),
      })
    );

    // For demo purposes, combine with mock data to show variety
    // In production, you'd only use Firebase data
    return [...convertedFirebaseAgents, ...agents];
  }, [firebaseAgents]);

  const filteredAndSortedAgents = React.useMemo(() => {
    let filtered = allAgents.filter((agent: Agent) => {
      const matchesSearch =
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesRisk =
        selectedRisk === "All" || agent.riskLevel === selectedRisk;

      return matchesSearch && matchesRisk;
    });

    // Sort agents
    filtered.sort((a: Agent, b: Agent) => {
      switch (sortBy) {
        case "totalReturn":
          return (
            b.performanceMetrics.totalReturn - a.performanceMetrics.totalReturn
          );
        case "winRate":
          return b.performanceMetrics.winRate - a.performanceMetrics.winRate;
        case "subscribers":
          return b.subscribers - a.subscribers;
        case "fee":
          return a.fee - b.fee;
        default:
          return 0;
      }
    });

    return filtered;
  }, [allAgents, searchTerm, selectedRisk, sortBy]);

  return (
    <div className="min-h-screen bg-dark-900 text-white mt-8">
      {/* Navigation */}
      <Header />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Trading Strategy Marketplace
          </h1>
          <p className="text-text-secondary">
            Discover and subscribe to automated trading strategies from expert
            creators
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-glass-dark backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-8 hover:border-white/20 transition-all duration-300">
          <form onSubmit={handleSearchSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Search Strategies
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="search"
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search by name, description, or tags..."
                    className="flex-1 px-4 py-2 border border-white/20 rounded-lg bg-white/10 text-white placeholder-text-secondary focus:ring-2 focus:ring-primary-500 focus:border-transparent backdrop-blur-sm"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Search
                  </button>
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm("");
                        clearSearch();
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Risk Level Filter */}
              <div>
                <label
                  htmlFor="risk"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Risk Level
                </label>
                <select
                  id="risk"
                  value={selectedRisk}
                  onChange={(e) => setSelectedRisk(e.target.value)}
                  className="w-full px-4 py-2 border border-white/20 rounded-lg bg-white/10 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent backdrop-blur-sm"
                >
                  <option value="All">All Levels</option>
                  <option value="Low">Low Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="High">High Risk</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label
                  htmlFor="sort"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Sort By
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-white/20 rounded-lg bg-white/10 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent backdrop-blur-sm"
                >
                  <option value="totalReturn">Total Return</option>
                  <option value="winRate">Win Rate</option>
                  <option value="subscribers">Popularity</option>
                  <option value="fee">Lowest Fee</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-text-secondary">
            Showing {filteredAndSortedAgents.length} of {allAgents.length}{" "}
            strategies
            {loading && " (Loading more...)"}
          </p>
        </div>

        {/* Loading State */}
        {loading && firebaseAgents.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <span className="ml-3 text-white">Loading trading agents...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400 mb-2">Error loading agents: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/30 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Agents Grid */}
        {!loading || firebaseAgents.length > 0 ? (
          <>
            {filteredAndSortedAgents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedAgents.map((agent: Agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.175-5.5-2.971M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-white mb-2">
                  No strategies found
                </h3>
                <p className="text-text-secondary">
                  Try adjusting your search criteria or filters
                </p>
              </div>
            )}

            {/* Load More Button - Only show if there are more agents and we're not filtering */}
            {hasMore && !searchTerm && selectedRisk === "All" && (
              <div className="text-center mt-8">
                <button
                  onClick={fetchMore}
                  disabled={loading}
                  className="px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Loading..." : "Load More Agents"}
                </button>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default MarketplacePage;
