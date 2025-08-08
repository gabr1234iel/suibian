import React from "react";
import Link from "next/link"; // Import the Link component
import { Agent } from "../types";

// Define a type for our color mapping
type RiskColors = {
  border: string;
  tagBg: string;
  tagText: string;
};

// Map risk levels to specific Tailwind CSS classes for colors
const riskLevelColors: Record<string, RiskColors> = {
  Low: {
    border: "border-t-green-500",
    tagBg: "bg-green-500/10",
    tagText: "text-green-400",
  },
  Medium: {
    border: "border-t-yellow-500",
    tagBg: "bg-yellow-500/10",
    tagText: "text-yellow-400",
  },
  High: {
    border: "border-t-red-500",
    tagBg: "bg-red-500/10",
    tagText: "text-red-400",
  },
};

// A small component for displaying performance metrics
const MetricDisplay: React.FC<{
  label: string;
  value: string;
  className?: string;
}> = ({ label, value, className = "" }) => (
  <div className={className}>
    <p className="text-lg font-semibold text-white">{value}</p>
    <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
  </div>
);

const AgentCard: React.FC<{ agent: Agent }> = ({ agent }) => {
  const colors = riskLevelColors[agent.riskLevel] || riskLevelColors["Medium"];

  return (
    // Wrap the entire card in a Link component
    <a
      href={`/agents/${agent.id}`}
      className={`bg-dark-800 rounded-lg border border-gray-800 border-t-4 p-4 flex flex-col h-full transition-all duration-200 hover:border-gray-700 hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer`}
    >
      {/* Header: Name and Risk Level */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-bold text-white pr-2">{agent.name}</h3>
        <span
          className={`px-2 py-0.5 text-xs font-semibold rounded-full ${colors.tagBg} ${colors.tagText}`}
        >
          {agent.riskLevel.toUpperCase()}
        </span>
      </div>

      {/* Creator */}
      <p className="text-xs text-gray-500 mb-4">
        Created by{" "}
        <span className="font-mono text-blue-400">
          {agent.creator.slice(0, 6)}...{agent.creator.slice(-4)}
        </span>
      </p>

      {/* Strategy */}
      <div className="mb-4">
        <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">
          Strategy
        </p>
        <p className="text-sm text-gray-300 line-clamp-3">{agent.strategy}</p>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-4">
        <MetricDisplay
          label="Total Return"
          value={`${agent.performanceMetrics.totalReturn.toFixed(2)}%`}
          className="text-green-400"
        />
        <MetricDisplay
          label="Win Rate"
          value={`${agent.performanceMetrics.winRate.toFixed(1)}%`}
        />
        <MetricDisplay
          label="Sharpe Ratio"
          value={agent.performanceMetrics.sharpeRatio.toFixed(1)}
        />
        <MetricDisplay
          label="Max Drawdown"
          value={`${agent.performanceMetrics.maxDrawdown.toFixed(1)}%`}
          className="text-red-400"
        />
      </div>

      {/* Tags */}
      <div className="mt-auto pt-4 border-t border-white/10 flex flex-wrap gap-2">
        {agent.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 text-xs bg-white/5 text-gray-400 rounded"
          >
            #{tag.toUpperCase()}
          </span>
        ))}
      </div>
    </a>
  );
};

export default AgentCard;
