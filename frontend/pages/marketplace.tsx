import React, { useState } from "react";
import { agents } from "../data/agents";
import { Agent } from "../types";
import { useTradingAgents } from "../hooks/useTradingAgents";
import { TradingAgent } from "../api/marketplaceApi";
import Header from "@/components/Header";
import ReviewsCarousel from "@/components/ReviewsCarousel";
import Link from "next/dist/client/link";

const MarketplacePage: React.FC = () => {
  // Get trading agents from Firebase
  const { agents: firebaseAgents } = useTradingAgents({
    isActive: true,
    limitCount: 50,
  });

  // Convert Firebase agents to display format and combine with mock data for demo
  const allAgents: Agent[] = React.useMemo(() => {
    const convertedFirebaseAgents: Agent[] = firebaseAgents.map(
      (fbAgent: TradingAgent) => ({
        id: fbAgent.agent_id,
        name: fbAgent.name,
        creator: fbAgent.creator,
        strategy: `Agent ID: ${fbAgent.agent_id.slice(0, 10)}...`,
        description: `${fbAgent.total_subscribers} subscribers`,
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

  return (
    <div
      className="min-h-screen bg-dark-800 text-white p-8 relative overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 60% 15% at 0% 22%, rgba(0,255,180,0.18) 40%, transparent 90%)",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "scroll", // Changed from 'fixed' to 'scroll'
        imageRendering: "pixelated", // This will pixelate the background image
      }}
    >
      {/* Navigation */}
      <Header />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Trading Strategy Marketplace
          </h1>
          <p className="text-sm">
            Discover and subscribe to automated trading strategies from expert
            creators
          </p>
        </div>

        {/* Reviews Carousel */}
        <div className="w-full mb-12">
          <ReviewsCarousel />
        </div>

        {/* Hot Agents Section */}
        <div className="w-full mt-12 mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-white">Hot Agents</h2>
            <Link
              href="/browse-agents"
              className="flex items-center gap-1 px-3 py-2 text-white rounded-lg text-sm cursor-pointer hover:text-gray-200"
              style={{ minWidth: 0 }}
            >
              <svg
                className="ml-1"
                width={20}
                height={20}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
          <div className="flex flex-col md:flex-row gap-6 w-full">
            {/* Left Table: 1-5 */}
            <div className="flex-1">
              <div className="bg-glass-dark backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg">
                <table className="min-w-full text-left">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-sm font-medium text-white/70">
                        #
                      </th>
                      <th className="px-3 py-2 text-sm font-medium text-white/70">
                        Name
                      </th>
                      <th className="px-3 py-2 text-sm font-medium text-white/70">
                        Subscribers
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allAgents
                      .slice()
                      .sort((a, b) => b.subscribers - a.subscribers)
                      .slice(0, 5)
                      .map((agent, idx) => (
                        <tr
                          key={agent.id}
                          className="border-b border-white/10 last:border-0 cursor-pointer hover:bg-white/5 transition"
                          onClick={() => {
                            window.location.href = `/agents/${agent.id}`;
                          }}
                        >
                          <td className="px-3 py-2">{idx + 1}</td>
                          <td className="px-3 py-2">{agent.name}</td>
                          <td className="px-3 py-2">{agent.subscribers}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Right Table: 6-10 (hidden on mobile) */}
            <div className="flex-1 hidden md:block">
              <div className="bg-glass-dark backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg">
                <table className="min-w-full text-left">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-sm font-medium text-white/70">
                        #
                      </th>
                      <th className="px-3 py-2 text-sm font-medium text-white/70">
                        Name
                      </th>
                      <th className="px-3 py-2 text-sm font-medium text-white/70">
                        Subscribers
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allAgents
                      .slice()
                      .sort((a, b) => b.subscribers - a.subscribers)
                      .slice(5, 10)
                      .map((agent, idx) => (
                        <tr
                          key={agent.id}
                          className="border-b border-white/10 last:border-0 cursor-pointer hover:bg-white/5 transition"
                          onClick={() => {
                            window.location.href = `/agents/${agent.id}`;
                          }}
                        >
                          <td className="px-3 py-2">{idx + 6}</td>
                          <td className="px-3 py-2">{agent.name}</td>
                          <td className="px-3 py-2">{agent.subscribers}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* New Agents Section */}
        <div className="w-full mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-white">New Agents</h2>
            <Link
              href="/browse-agents"
              className="flex items-center gap-1 px-3 py-2 text-white rounded-lg text-sm cursor-pointer hover:text-gray-200"
              style={{ minWidth: 0 }}
            >
              <svg
                className="ml-1"
                width={20}
                height={20}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>{" "}
          <div className="relative min-h-[420px]">
            <div className="overflow-x-auto">
              <div className="flex gap-6" id="new-agents-carousel">
                {allAgents
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )
                  .slice(0, 10)
                  .map((agent) => (
                    <div
                      key={agent.id}
                      className="min-w-[320px] max-w-xs w-full flex-shrink-0"
                      style={{
                        width: "100%",
                        maxWidth: "350px",
                        minWidth: "260px",
                      }}
                    >
                      <div className="bg-glass-dark backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-lg h-full flex flex-col md:p-6">
                        <div className="flex items-center mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg md:text-xl font-bold text-white truncate">
                              {agent.name}
                            </h3>
                          </div>
                          <span className="ml-2 px-2 py-1 text-xs rounded bg-primary-700/30 text-primary-300">
                            NEW
                          </span>
                        </div>
                        <p className="text-xs md:text-sm text-white/70 mb-2 line-clamp-2">
                          {agent.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {agent.tags.map((tag) => (
                            <span
                              key={tag}
                              className="bg-white/10 text-xs md:text-sm text-white/70 px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex flex-col gap-1 text-xs md:text-sm text-white/80 mb-2">
                          <div>
                            <span className="font-medium">Risk:</span>{" "}
                            {agent.riskLevel}
                          </div>
                          <div>
                            <span className="font-medium">Fee:</span>{" "}
                            {agent.fee} SUI
                          </div>
                          <div>
                            <span className="font-medium">Subscribers:</span>{" "}
                            {agent.subscribers}
                          </div>
                          <div>
                            <span className="font-medium">Total Return:</span>{" "}
                            {agent.performanceMetrics.totalReturn.toFixed(2)}%
                          </div>
                          <div>
                            <span className="font-medium">Win Rate:</span>{" "}
                            {agent.performanceMetrics.winRate.toFixed(1)}%
                          </div>
                        </div>
                        <div className="mt-auto flex justify-end">
                          <Link
                            href={`/agents/${agent.id}`}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-xs md:text-sm hover:bg-primary-700 transition-colors"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            {/* Carousel scroll buttons for desktop */}
            <button
              type="button"
              className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-0 z-20 bg-dark-800/80 hover:bg-dark-700/90 rounded-full p-2 shadow-lg mr-2"
              style={{ pointerEvents: "auto" }}
              onClick={() => {
                const flex = document.getElementById("new-agents-carousel");
                const container = flex?.parentElement;
                if (container)
                  container.scrollBy({ left: -350, behavior: "smooth" });
              }}
            >
              <svg
                width={20}
                height={20}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              type="button"
              className="hidden md:flex absolute top-1/2 -translate-y-1/2 right-0 z-20 bg-dark-800/80 hover:bg-dark-700/90 rounded-full p-2 shadow-lg ml-2"
              style={{ pointerEvents: "auto" }}
              onClick={() => {
                const flex = document.getElementById("new-agents-carousel");
                const container = flex?.parentElement;
                if (container)
                  container.scrollBy({ left: 350, behavior: "smooth" });
              }}
            >
              <svg
                width={20}
                height={20}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
          {/* Carousel container id for scroll buttons */}
          <style jsx>{`
            @media (min-width: 768px) {
              .overflow-x-auto > .flex {
                scroll-snap-type: x mandatory;
              }
              .overflow-x-auto > .flex > div {
                scroll-snap-align: start;
              }
            }
            .overflow-x-auto::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
