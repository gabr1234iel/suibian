import React, { useState, useMemo } from "react";
import { agents as mockAgents } from "../data/agents"; // Renamed to avoid confusion
import AgentCard from "../components/AgentCard";
import { Agent } from "../types";
import { useTradingAgents } from "../hooks/useTradingAgents";
import { TradingAgent } from "../api/marketplaceApi";
import Header from "@/components/Header";

const SearchForAgentPage: React.FC = () => {
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

  // Convert Firebase agents and combine with mock data
  const allAgents: Agent[] = useMemo(() => {
    const convertedFirebaseAgents: Agent[] = firebaseAgents.map(
      (fbAgent: TradingAgent) => ({
        id: fbAgent.agent_id,
        name: fbAgent.name,
        creator: fbAgent.creator,
        strategy: `Agent ID: ${fbAgent.agent_id.slice(0, 10)}...`,
        description: `${fbAgent.total_subscribers} subscribers`,
        riskLevel: fbAgent.is_active ? "Low" : "High",
        fee: parseInt(fbAgent.subscription_fee) / 1000000000,
        subscribers: fbAgent.total_subscribers,
        tags: [
          "Blockchain",
          "Automated",
          fbAgent.is_active ? "Active" : "Inactive",
        ],
        performanceMetrics: {
          totalReturn: Math.random() * 50 + 10,
          winRate: Math.random() * 40 + 60,
          sharpeRatio: Math.random() * 2 + 1,
          maxDrawdown: Math.random() * 15 + 5,
        },
        createdAt:
          fbAgent.created_at instanceof Date
            ? fbAgent.created_at.toISOString()
            : new Date().toISOString(),
      })
    );
    return [...convertedFirebaseAgents, ...mockAgents];
  }, [firebaseAgents]);

  // Filter and sort agents based on user input
  const filteredAndSortedAgents = useMemo(() => {
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
    <div className="min-h-screen bg-dark-800 text-white p-8">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8 pt-24">
        <h1 className="text-3xl font-bold text-white mb-4">
          Search For Agents
        </h1>
        <p className="text-text-secondary mb-8">
          Use the filters below to find the perfect trading strategy for your
          needs.
        </p>

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
                      onClick={() => handleSearchChange("")}
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
                <h3 className="text-xl font-medium text-white mb-2">
                  No strategies found
                </h3>
                <p className="text-text-secondary">
                  Try adjusting your search criteria or filters
                </p>
              </div>
            )}

            {/* Load More Button */}
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
      </main>
    </div>
  );
};

export default SearchForAgentPage;
