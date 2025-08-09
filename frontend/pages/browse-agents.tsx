import React, { useState, useMemo } from "react";
import { agents as mockAgents } from "../data/agents";
import AgentCard from "../components/AgentCard";
import { Agent } from "../types";
import { useTradingAgents } from "../hooks/useTradingAgents";
import { TradingAgent } from "../api/marketplaceApi";
import Header from "@/components/Header";

// Helper for active button styles
const getButtonClasses = (isActive: boolean) =>
  `px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
    isActive
      ? "bg-white/10 text-white"
      : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
  }`;

const SearchForAgentPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<
    "All" | "High" | "Medium" | "Low"
  >("All");
  const [sortBy, setSortBy] = useState<string>("subscribers"); // Default to trending

  // Get localStorage agents
  const [localAgents, setLocalAgents] = useState<any[]>([]);

  React.useEffect(() => {
    // Load agents from localStorage on component mount
    const loadLocalAgents = () => {
      const storedAgents = JSON.parse(localStorage.getItem('localAgents') || '[]');
      setLocalAgents(storedAgents);
      console.log('📱 Browse page loaded', storedAgents.length, 'agents from localStorage');
    };

    loadLocalAgents();

    // Refresh local agents when the page becomes visible (e.g., returning from create page)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadLocalAgents();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const {
    agents: firebaseAgents,
    loading,
    error,
    hasMore,
    fetchMore,
  } = useTradingAgents({
    isActive: true,
    limitCount: 50,
  });

  const allAgents: Agent[] = useMemo(() => {
    const convertedFirebaseAgents: Agent[] = firebaseAgents.map(
      (fbAgent: TradingAgent) => ({
        id: fbAgent.agent_id,
        name: fbAgent.name,
        creator: fbAgent.creator,
        strategy: `Agent ID: ${fbAgent.agent_id.slice(0, 10)}...`,
        description: `${fbAgent.total_subscribers} subscribers`,
        riskLevel: fbAgent.is_active ? "Low" : "High", // This should probably be more nuanced
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

    // Convert localStorage agents to display format
    const convertedLocalAgents: Agent[] = localAgents.map((localAgent) => ({
      id: localAgent.agent_id,
      name: localAgent.name,
      creator: localAgent.creator,
      strategy: `Agent ID: ${localAgent.agent_id.slice(0, 10)}...`,
      description: localAgent.description,
      riskLevel: "Low" as "Low" | "Medium" | "High",
      fee: parseInt(localAgent.subscription_fee) / 1000000000, // Convert from mist to SUI
      subscribers: localAgent.total_subscribers,
      tags: [
        "Blockchain",
        "Automated",
        "Just Created", // Special tag for newly created agents
        "TEE Protected",
      ],
      performanceMetrics: {
        totalReturn: Math.random() * 50 + 10, // Mock data for demo
        winRate: Math.random() * 40 + 60, // Mock data for demo
        sharpeRatio: Math.random() * 2 + 1,
        maxDrawdown: Math.random() * 15 + 5,
      },
      createdAt: localAgent.created_at,
      _isLocalAgent: true, // Flag to identify local agents
    }));

    // Add mock agents with varied risk levels for demonstration
    const variedMockAgents = mockAgents.map((agent, index) => ({
      ...agent,
      riskLevel: index % 3 === 0 ? "High" : index % 3 === 1 ? "Medium" : "Low",
    })) as Agent[];

    // Combine all sources: localStorage agents first (newest), then Firebase, then mock data
    // Filter out duplicates by agent ID (localStorage takes precedence)
    const allCombined = [...convertedLocalAgents, ...convertedFirebaseAgents, ...variedMockAgents];
    const uniqueAgents = allCombined.filter((agent, index, self) =>
      index === self.findIndex((a) => a.id === agent.id)
    );

    return uniqueAgents;
  }, [firebaseAgents, localAgents]);

  const filteredAndSortedAgents = useMemo(() => {
    let agentsToShow = [...allAgents];

    // 1. Apply the main risk filter
    if (activeFilter !== "All") {
      agentsToShow = agentsToShow.filter(
        (agent) => agent.riskLevel === activeFilter
      );
    }

    // 2. Apply search term
    if (searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase();
      agentsToShow = agentsToShow.filter(
        (agent) =>
          agent.name.toLowerCase().includes(searchLower) ||
          agent.description.toLowerCase().includes(searchLower) ||
          agent.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // 3. Apply final sorting
    agentsToShow.sort((a, b) => {
      switch (sortBy) {
        case "totalReturn":
          return (
            b.performanceMetrics.totalReturn - a.performanceMetrics.totalReturn
          );
        case "winRate":
          return b.performanceMetrics.winRate - a.performanceMetrics.winRate;
        case "fee":
          return a.fee - b.fee;
        case "subscribers": // Default "Trending"
        default:
          return b.subscribers - a.subscribers;
      }
    });

    return agentsToShow;
  }, [allAgents, activeFilter, searchTerm, sortBy]);

  return (
    <div className="min-h-screen bg-dark-900 text-white mt-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[32rem] h-[32rem] bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-green-500/5 pointer-events-none" />
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 relative z-10">
        {/* Header and Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          {/* Left: Main Filters */}
          <div className="flex items-center gap-2 bg-dark-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveFilter("All")}
              className={getButtonClasses(activeFilter === "All")}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter("High")}
              className={getButtonClasses(activeFilter === "High")}
            >
              High
            </button>
            <button
              onClick={() => setActiveFilter("Medium")}
              className={getButtonClasses(activeFilter === "Medium")}
            >
              Medium
            </button>
            <button
              onClick={() => setActiveFilter("Low")}
              className={getButtonClasses(activeFilter === "Low")}
            >
              Low
            </button>
          </div>

          {/* Right: Search and secondary filters */}
          <div className="w-full md:w-auto flex flex-col md:flex-row items-center gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search"
                className="w-full pl-9 pr-3 py-2 text-sm bg-dark-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort Toggle */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm bg-dark-800 border border-gray-700 rounded-lg py-2 pl-3 pr-8 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="subscribers">Trending</option>
                <option value="totalReturn">Total Return</option>
                <option value="winRate">Win Rate</option>
                <option value="fee">Lowest Fee</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && firebaseAgents.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
            <span className="ml-3 text-sm text-gray-400">
              Loading trading agents...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 my-6">
            <p className="text-sm text-red-400">
              Error loading agents: {error}
            </p>
          </div>
        )}

        {/* Agents Grid */}
        {!loading || firebaseAgents.length > 0 ? (
          <>
            {filteredAndSortedAgents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredAndSortedAgents.map((agent: Agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-lg font-semibold text-white mb-1">
                  No Agents Found
                </h3>
                <p className="text-sm text-gray-400">
                  Try adjusting your search or filters.
                </p>
              </div>
            )}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-10">
                <button
                  onClick={fetchMore}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Loading..." : "Load More"}
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
