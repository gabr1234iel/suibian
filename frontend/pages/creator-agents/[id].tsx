import React, { useState, useMemo } from "react";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useTradingAgent } from "@/hooks/useTradingAgents";
import { Agent } from "../../types";

// --- MOCK DATA: Based on the provided screenshots ---
// TODO: Update your useTradingAgent hook and Firestore to return data in this structure.
const traderData = {
  name: "Gandalf the greedy",
  rank: "Cadet",
  avatarUrl: "", // URL to the avatar image
  stats: {
    followers: 45,
    tradingDays: 386,
    stabilityIndex: 5.0,
    views7d: 1061,
    slotsLeft: 55,
  },
  aum: 407.98,
  totalAssets: "10,000+", // Using a string as the original is partially hidden
  profitSharing: 10,
  tags: ["High Frequency", "Veteran"],
  performance: {
    roi: 80.68,
    masterPnl: 12240.24,
    followersPnl: 11.96,
    winRate: 59.72,
    maxDrawdown: 5.32,
    avgPnlPerTrade: 48.33,
    winTrades: 156,
    lossTrades: 111,
    profitToLossRatio: 1.54,
    weeklyTrades: 60.52,
    avgHoldingTime: "21.73 Hours",
    roiVolatility: 5.1,
    sharpeRatio: 2.88,
    sortinoRatio: 9.72,
    lastTradedAt: "2025-08-09 20:11:18",
  },
  followers: [
    { name: "bit**@***", cumulativeProfit: 43.27, totalRoi: 18.27 },
    { name: "kac**@***", cumulativeProfit: 19.43, totalRoi: 15.74 },
    { name: "arb**@***", cumulativeProfit: 13.31, totalRoi: 10.37 },
    { name: "100**@***", cumulativeProfit: 3.83, totalRoi: 10.32 },
    { name: "lgo**@***", cumulativeProfit: 3.05, totalRoi: 2.99 },
  ],
};

const charts = {
  earnings: [
    { name: "07/19", roi: 20, profit: 3000 },
    { name: "07/23", roi: 25, profit: 4000 },
    { name: "07/25", roi: 30, profit: 4500 },
    { name: "07/30", roi: 60, profit: 8000 },
    { name: "08/04", roi: 75, profit: 11000 },
    { name: "08/08", roi: 80.68, profit: 12240 },
  ],
  dailyProfit: [
    { name: "07/10", profit: 1500 },
    { name: "07/13", profit: -800 },
    { name: "07/15", profit: 600 },
    { name: "07/20", profit: 400 },
    { name: "07/25", profit: 1400 },
    { name: "07/28", profit: -1200 },
    { name: "08/01", profit: 2000 },
    { name: "08/04", profit: -900 },
    { name: "08/08", profit: 2200 },
  ],
};

// --- Helper Components ---

const MetricItem: React.FC<{ label: string; value: string | number }> = ({
  label,
  value,
}) => (
  <div className="flex justify-between items-center text-sm py-2">
    <span className="text-gray-400">{label}</span>
    <span className="font-medium text-white">{value}</span>
  </div>
);

const AgentDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [activeTab, setActiveTab] = useState("Statistics");

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
        subscriptionFee: firebaseAgent.subscription_fee,
        teeWalletAddress: firebaseAgent.tee_wallet_address,
        txDigest: firebaseAgent.tx_digest,
        tags: traderData.tags,
        aum: traderData.aum,
        totalAssets: traderData.totalAssets,
        profitSharing: traderData.profitSharing,
        stats: traderData.stats,
        performance: traderData.performance,
        followers: traderData.followers,
        createdAt:
          firebaseAgent.created_at instanceof Date
            ? firebaseAgent.created_at.toISOString()
            : new Date().toISOString(),
        performanceMetrics: {
          ...traderData.performance,
          totalReturn: traderData.performance.roi, // Assuming roi is used as totalReturn
        },
      };
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
        <button
          onClick={() => router.push("/dashboard")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="container mx-auto px-4 pt-24 pb-12 mt-4">
        <button
          onClick={() => router.push("/dashboard")}
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
          <span>Back to Dashboard</span>
        </button>
        {/* Top Banner */}
        <div className="bg-[#101010] p-6 rounded-lg mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start">
            {/* Left Side: Profile */}
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  PW
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white flex items-center">
                    {agent.name}{" "}
                  </h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                      High Frequency
                    </span>
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                      Veteran
                    </span>
                  </div>
                </div>
              </div>
              {/* <div className="flex space-x-6 text-sm mt-4 text-gray-400">
                <p>
                  AUM:{" "}
                  <span className="text-white font-medium">$407.98 USDT</span>
                </p>
                <p>
                  Total Assets:{" "}
                  <span className="text-white font-medium">10,000+ USDT</span>
                </p>
                <p>
                  Profit Sharing:{" "}
                  <span className="text-white font-medium">10%</span>
                </p>
              </div> */}
            </div>

            {/* Right Side: Actions & Stats */}
            <div className="flex items-center space-x-2">
              <button className="text-sm text-gray-400 hover:text-white">
                Share
              </button>
            </div>
          </div>
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-gray-800 pt-4">
            <div className="text-center md:text-left">
              <span className="text-gray-400">Subscriber(s):</span>{" "}
              <span className="text-white font-semibold">
                {agent.subscribers}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content: Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Performance Panel */}
          <div className="lg:col-span-1 bg-[#101010] p-6 rounded-lg h-fit">
            <h2 className="text-xl font-bold text-white mb-4">Performance</h2>
            <div className="space-y-2 border-b border-gray-800 pb-4">
              <MetricItem label="Master's PnL" value="+$12,240.24" />
              <MetricItem label="Win Rate" value="59.72%" />
              <MetricItem label="Followers' PnL" value="+11.96" />
              <MetricItem label="Avg. PnL per Trade" value="+48.33" />
            </div>
            {/* <div className="py-4 border-b border-gray-800">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-400">Win 156</span>
                <span className="text-red-400">Lose 111</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: "58.43%" }}
                ></div>
              </div>
            </div> */}
            <div className="space-y-2 py-4 border-b border-gray-800">
              <MetricItem label="Profit-to-Loss Ratio" value="1.54:1" />
              <MetricItem label="Weekly Trades" value="60.52" />
              <MetricItem label="Avg. Holding Time" value="21.73 Hours" />
              <MetricItem label="ROI Volatility" value="5.1%" />
              <MetricItem label="Last Traded at" value="2025-08-09 20:11:18" />
            </div>
          </div>

          {/* Right Column: Charts Panel */}
          <div className="lg:col-span-2 bg-[#101010] p-6 rounded-lg">
            <div className="flex border-b border-gray-800 mb-6">
              {["Statistics", "Subscriber(s)"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-medium  ${
                    activeTab === tab
                      ? "text-yellow-500 border-b-2 border-yellow-500"
                      : "text-gray-400"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "Statistics" && (
              <div>
                {/* Earnings Chart */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-white mb-4">
                    Earnings
                  </h3>
                  <div style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer>
                      <LineChart
                        data={[
                          { name: "07/19", roi: 20, profit: 3000 },
                          { name: "07/23", roi: 25, profit: 4000 },
                          { name: "07/25", roi: 30, profit: 4500 },
                          { name: "07/30", roi: 60, profit: 8000 },
                          { name: "08/04", roi: 75, profit: 11000 },
                          { name: "08/08", roi: 80.68, profit: 12240 },
                        ]}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF" />
                        <YAxis yAxisId="left" stroke="#9CA3AF" />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          stroke="#9CA3AF"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #374151",
                          }}
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="roi"
                          stroke="#FBBF24"
                          name="Cumulative ROI (%)"
                          dot={false}
                          strokeWidth={2}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="profit"
                          stroke="#34D399"
                          name="Cumulative Profit (USDT)"
                          dot={false}
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                {/* Daily Profit Chart */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Profit</h3>
                  <div style={{ width: "100%", height: 200 }}>
                    <ResponsiveContainer>
                      <BarChart
                        data={charts.dailyProfit}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        barCategoryGap={32} // Increase gap between bars
                        barGap={8} // Optional: gap between bars in the same category
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #374151",
                          }}
                          cursor={{ fill: "rgba(107, 114, 128, 0.2)" }}
                        />
                        <Bar
                          dataKey="profit"
                          name="Daily Profit (USDT)"
                          barSize={14} // Make bars slimmer (default is ~32)
                        >
                          {charts.dailyProfit.map(
                            (entry: { profit: number }, index: any) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.profit >= 0 ? "#34D399" : "#F87171"}
                              />
                            )
                          )}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
            {activeTab !== "Statistics" && (
              <div className="text-center text-gray-500 py-20">
                Content for {activeTab} goes here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDetailPage;
