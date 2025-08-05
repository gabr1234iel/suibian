import React from 'react';
import Link from 'next/link';
import { Agent } from '../types';

interface AgentCardProps {
  agent: Agent;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const getRiskColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'Low':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'Medium':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'High':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getRiskGradient = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'Low':
        return 'from-green-500/10 to-emerald-500/10';
      case 'Medium':
        return 'from-yellow-500/10 to-orange-500/10';
      case 'High':
        return 'from-red-500/10 to-pink-500/10';
      default:
        return 'from-gray-500/10 to-slate-500/10';
    }
  };

  return (
    <div className="group relative">
      {/* Glow effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-gradient-blue to-gradient-purple rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
      
      <div className="relative bg-dark-800 border-2 border-gray-700 rounded-2xl overflow-hidden group-hover:border-gradient-blue/50 transition-all duration-300 shadow-2xl">
        {/* Header with gradient background */}
        <div className={`bg-gradient-to-r ${getRiskGradient(agent.riskLevel)} p-6 border-b border-gray-700/50`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-gradient-blue transition-colors duration-300">
                {agent.name}
              </h3>
              <p className="text-text-secondary font-medium">
                Created by <span className="text-gradient-blue">{agent.creator}</span>
              </p>
            </div>
            <div className={`px-4 py-2 rounded-xl border font-bold text-sm ${getRiskColor(agent.riskLevel)}`}>
              {agent.riskLevel.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Strategy Description */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gradient-purple mb-2 uppercase tracking-wider">Strategy</h4>
            <p className="text-white text-base leading-relaxed mb-3">
              {agent.strategy}
            </p>
            <p className="text-text-secondary text-sm line-clamp-2">
              {agent.description}
            </p>
          </div>

          {/* Performance Metrics - Bold Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-dark-700/50 border border-gray-600 rounded-xl p-4 text-center hover:border-green-500/30 transition-colors">
              <div className="text-3xl font-black text-green-400 mb-1">
                {agent.performanceMetrics.totalReturn > 0 ? '+' : ''}{agent.performanceMetrics.totalReturn}%
              </div>
              <div className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Total Return</div>
            </div>
            <div className="bg-dark-700/50 border border-gray-600 rounded-xl p-4 text-center hover:border-gradient-blue/30 transition-colors">
              <div className="text-3xl font-black text-gradient-blue mb-1">
                {agent.performanceMetrics.winRate}%
              </div>
              <div className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Win Rate</div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gradient-to-r from-gradient-purple/10 to-gradient-pink/10 border border-gradient-purple/20 rounded-lg p-3">
              <div className="text-lg font-bold text-gradient-purple">
                {agent.performanceMetrics.sharpeRatio}
              </div>
              <div className="text-xs text-text-secondary font-medium">Sharpe Ratio</div>
            </div>
            <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/20 rounded-lg p-3">
              <div className="text-lg font-bold text-red-400">
                {agent.performanceMetrics.maxDrawdown}%
              </div>
              <div className="text-xs text-text-secondary font-medium">Max Drawdown</div>
            </div>
          </div>

          {/* Tags with bold styling */}
          <div className="flex flex-wrap gap-2 mb-6">
            {agent.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-gradient-to-r from-gradient-blue/20 to-gradient-purple/20 border border-gradient-blue/30 text-gradient-blue text-xs font-bold rounded-full hover:from-gradient-blue/30 hover:to-gradient-purple/30 transition-all duration-300"
              >
                #{tag.toUpperCase()}
              </span>
            ))}
          </div>

          {/* Footer with enhanced styling */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-700">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-lg font-bold text-white">{agent.subscribers}</div>
                <div className="text-xs text-text-secondary font-medium uppercase">Subscribers</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gradient-cyan">{agent.fee}%</div>
                <div className="text-xs text-text-secondary font-medium uppercase">Fee</div>
              </div>
            </div>
            <Link
              href={`/agent/${agent.id}`}
              className="group/btn relative px-6 py-3 bg-gradient-primary text-white rounded-xl font-bold text-sm hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-gradient-blue/25"
            >
              <span className="relative z-10">VIEW AGENT</span>
              <div className="absolute inset-0 bg-gradient-to-r from-gradient-purple to-gradient-pink rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentCard;
