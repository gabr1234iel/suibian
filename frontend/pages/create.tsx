import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAppContext } from "../context/AppContext";
import { useSuiTransactions } from "../hooks/useSuiTransactions";
import Header from "@/components/Header";
import SuccessModal from "@/components/SuccessModal";

interface AgentFormData {
  name: string;
  strategy: string;
  description: string;
  riskLevel: "Low" | "Medium" | "High";
  fee: number;
  tags: string[];
  // Sui DeFi specific fields
  dexes: string[];
  tradingStrategy:
    | "arbitrage"
    | "momentum"
    | "meanReversion"
    | "gridTrading"
    | "dca"
    | "custom";
  tokenPairs: string[];
  // TEE & Security Configuration
  allowedDomains: string[];
  agentEndpoint: string;
  attestationRequired: boolean;
  // Technical indicators
  rsiEnabled: boolean;
  rsiBuyThreshold: number;
  rsiSellThreshold: number;
  maEnabled: boolean;
  maShortPeriod: number;
  maLongPeriod: number;
  // Risk management
  maxPositionSize: number;
  stopLossPercent: number;
  takeProfitPercent: number;
  maxDrawdown: number;
  // Execution parameters
  executionFrequency: "1min" | "5min" | "15min" | "1hour" | "4hour" | "1day";
  minTradeAmount: number;
  maxSlippage: number;
}

const CreateAgentPage: React.FC = () => {
  const {
    isLoggedIn,
    userGoogleId,
    userSalt,
    jwt,
    ephemeralKeypair,
    initializeZkLoginSession,
  } = useAppContext();
  const { createAgent, isTransacting, isReady } = useSuiTransactions();
  const router = useRouter();
  const [formData, setFormData] = useState<AgentFormData>({
    name: "",
    strategy: "",
    description: "",
    riskLevel: "Medium",
    fee: 2.0,
    tags: [],
    // Sui DeFi specific fields
    dexes: [],
    tradingStrategy: "momentum",
    tokenPairs: ["SUI/USDC"],
    // TEE & Security Configuration
    allowedDomains: [],
    agentEndpoint: "",
    attestationRequired: true,
    // Technical indicators
    rsiEnabled: false,
    rsiBuyThreshold: 30,
    rsiSellThreshold: 70,
    maEnabled: false,
    maShortPeriod: 9,
    maLongPeriod: 21,
    // Risk management
    maxPositionSize: 10,
    stopLossPercent: 5,
    takeProfitPercent: 10,
    maxDrawdown: 15,
    // Execution parameters
    executionFrequency: "15min",
    minTradeAmount: 100,
    maxSlippage: 2,
  });
  const [tagInput, setTagInput] = useState<string>("");
  const [allowedDomainInput, setAllowedDomainInput] = useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [successData, setSuccessData] = useState<{
    agentId?: string;
    transactionDigest?: string;
    agentName?: string;
  }>({});

  // Sui ecosystem DEXes
  const availableDexes = [
    "Cetus Protocol",
    "Turbos Finance",
    "BlueMove",
    "Aftermath Finance",
    "Kriya DEX",
    "SuiSwap",
    "Kai Finance",
    "FlowX Finance",
  ];

  // Popular Sui token pairs
  const popularTokenPairs = [
    "SUI/USDC",
    "SUI/USDT",
    "WETH/USDC",
    "WBTC/USDC",
    "USDC/USDT",
    "SUI/WETH",
    "CETUS/SUI",
    "TURBOS/SUI",
    "BLUE/SUI",
    "DEEP/SUI",
  ];
  const [isInitializingBlockchain, setIsInitializingBlockchain] =
    useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  // Check if we have the necessary zkLogin data for blockchain transactions
  const hasZkLoginData = !!(userSalt && jwt && ephemeralKeypair);

  // Function to initialize blockchain connection if needed
  const ensureBlockchainReady = async (): Promise<boolean> => {
    // If we already have zkLogin data, we're good
    if (hasZkLoginData) {
      console.log(
        "✅ zkLogin data already available from localStorage restore"
      );
      return true;
    }

    // If we don't have a Google ID, we can't proceed
    if (!userGoogleId) {
      console.error("No Google ID available for blockchain initialization");
      return false;
    }

    setIsInitializingBlockchain(true);

    try {
      console.log("🔄 zkLogin data missing, need to re-authenticate...");

      // If we don't have a Google ID, we can't proceed
      if (!userGoogleId) {
        console.error("No Google ID available for blockchain initialization");
        return false;
      }

      // If we don't have a zkLogin session, prompt the user to log in again
      alert(
        "Your session has expired. Please log out and log back in to continue with blockchain transactions."
      );

      return false;
    } catch (error) {
      console.error("❌ Failed to initialize blockchain connection:", error);
      alert(
        "Failed to initialize blockchain connection. Please try logging out and back in."
      );
      return false;
    } finally {
      setIsInitializingBlockchain(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ): void => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: target.checked,
      }));
    } else if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const addTag = (): void => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string): void => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addDex = (dex: string): void => {
    if (dex && !formData.dexes.includes(dex)) {
      setFormData((prev) => ({
        ...prev,
        dexes: [...prev.dexes, dex],
      }));
    }
  };

  const removeDex = (dexToRemove: string): void => {
    setFormData((prev) => ({
      ...prev,
      dexes: prev.dexes.filter((dex) => dex !== dexToRemove),
    }));
  };

  const addTokenPair = (pair: string): void => {
    if (pair && !formData.tokenPairs.includes(pair)) {
      setFormData((prev) => ({
        ...prev,
        tokenPairs: [...prev.tokenPairs, pair],
      }));
    }
  };

  const removeTokenPair = (pairToRemove: string): void => {
    setFormData((prev) => ({
      ...prev,
      tokenPairs: prev.tokenPairs.filter((pair) => pair !== pairToRemove),
    }));
  };

  const addAllowedDomain = (): void => {
    if (
      allowedDomainInput.trim() &&
      !formData.allowedDomains.includes(allowedDomainInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        allowedDomains: [...prev.allowedDomains, allowedDomainInput.trim()],
      }));
      setAllowedDomainInput("");
    }
  };

  const removeAllowedDomain = (domainToRemove: string): void => {
    setFormData((prev) => ({
      ...prev,
      allowedDomains: prev.allowedDomains.filter(
        (domain) => domain !== domainToRemove
      ),
    }));
  };

  const handleSuccessModalClose = (): void => {
    setShowSuccessModal(false);
    setSuccessData({});
    router.push("/dashboard");
  };

  const handleTagInputKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    // Ensure blockchain is ready before proceeding
    const blockchainReady = await ensureBlockchainReady();
    if (!blockchainReady) {
      return;
    }

    // Double-check that the transaction hook is ready
    if (!isReady) {
      alert(
        "Blockchain connection not ready. Please make sure you are logged in and try again."
      );
      return;
    }

    // Validate required fields
    if (formData.dexes.length === 0) {
      alert("Please select at least one DEX for your agent to trade on.");
      return;
    }

    if (formData.tokenPairs.length === 0) {
      alert("Please select at least one token pair for your agent to trade.");
      return;
    }

    if (!formData.agentEndpoint.trim()) {
      alert("Please provide your agent's endpoint URL.");
      return;
    }

    try {
      console.log("🚀 Creating agent on blockchain...", {
        name: formData.name,
        description: formData.description,
        fee: formData.fee,
        riskLevel: formData.riskLevel,
        tags: formData.tags,
        dexes: formData.dexes,
        tradingStrategy: formData.tradingStrategy,
        tokenPairs: formData.tokenPairs,
        agentEndpoint: formData.agentEndpoint,
        allowedDomains: formData.allowedDomains,
        attestationRequired: formData.attestationRequired,
      });

      // Create agent using the hook
      const result = await createAgent({
        name: formData.name,
        description: formData.description,
        fee: formData.fee,
      });

      if (result.success) {
        setSuccessData({
          agentId: result.agentId,
          transactionDigest: result.transactionDigest,
          agentName: formData.name,
        });
        setShowSuccessModal(true);
      } else {
        throw new Error(result.error || "Agent creation failed");
      }
    } catch (error) {
      console.error("❌ Failed to create agent:", error);

      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      alert(`❌ Failed to create agent: ${errorMessage}

This could be due to:
- Network connectivity issues
- Insufficient SUI balance for gas fees
- zkLogin proof generation failure
- Smart contract execution error

Please check the console for detailed error information and try again.`);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  // Determine the blockchain status
  const getBlockchainStatus = () => {
    if (isInitializingBlockchain) {
      return {
        color: "yellow",
        message: "🔄 Initializing blockchain connection...",
      };
    }

    if (hasZkLoginData && isReady) {
      return {
        color: "green",
        message: "✅ Blockchain Ready - Agent will be deployed to Sui Devnet",
      };
    }

    if (hasZkLoginData && !isReady) {
      return {
        color: "yellow",
        message: "⏳ Finalizing blockchain connection...",
      };
    }

    return {
      color: "red",
      message:
        "🔐 Session expired - please log out and log back in for transactions",
    };
  };

  const blockchainStatus = getBlockchainStatus();

  return (
    <div className="min-h-screen bg-dark-900 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[32rem] h-[32rem] bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-bl from-green-500/10 via-transparent to-blue-500/10 pointer-events-none" />
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-8 pt-24 mt-5 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create Secure Trading Agent
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Deploy a verifiable trading agent powered by Nautilus TEE. Your
            strategy executes securely in a Trusted Execution Environment, with
            cryptographic proof of execution.
          </p>

          {/* Enhanced Blockchain Status Indicator */}
          <div className="flex items-center space-x-2 text-sm mb-4">
            <div
              className={`w-2 h-2 rounded-full animate-pulse ${
                blockchainStatus.color === "green"
                  ? "bg-green-400"
                  : blockchainStatus.color === "yellow"
                    ? "bg-yellow-400"
                    : "bg-red-400"
              }`}
            ></div>
            <span
              className={`${isReady ? "text-green-400" : "text-yellow-400"}`}
            >
              {isReady
                ? "✅ Blockchain Ready - Agent Metadata will be submitted to Sui Devnet"
                : "⏳ Waiting for complete login data..."}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700 p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-white mb-2"
                >
                  Agent Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., DeFi Trading Pro"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="riskLevel"
                  className="block text-sm font-medium text-gray-700 dark:text-white mb-2"
                >
                  Risk Level *
                </label>
                <select
                  id="riskLevel"
                  name="riskLevel"
                  required
                  value={formData.riskLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="Low">Low Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="High">High Risk</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label
                htmlFor="strategy"
                className="block text-sm font-medium text-gray-700 dark:text-white mb-2"
              >
                Strategy Summary *
              </label>
              <input
                type="text"
                id="strategy"
                name="strategy"
                required
                value={formData.strategy}
                onChange={handleInputChange}
                placeholder="Brief description of your trading strategy"
                className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="mt-6">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-white mb-2"
              >
                Detailed Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={6}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Explain how your strategy works, what markets it targets, and what makes it unique..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="mt-6">
              <label
                htmlFor="fee"
                className="block text-sm font-medium text-gray-700 dark:text-white mb-2"
              >
                Management Fee (%) *
              </label>
              <input
                type="number"
                id="fee"
                name="fee"
                required
                min="0"
                max="10"
                step="0.1"
                value={formData.fee}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                Fee charged to subscribers (0-10%)
              </p>
            </div>
          </div>

          {/* Sui DeFi Configuration */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700 p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              🌊 Sui DeFi Configuration
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                  Supported DEXes *
                </label>
                <div className="space-y-2">
                  {availableDexes.map((dex) => (
                    <label
                      key={dex}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.dexes.includes(dex)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            addDex(dex);
                          } else {
                            removeDex(dex);
                          }
                        }}
                        className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-white">
                        {dex}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-300 mt-2">
                  Select the DEXes your agent will trade on
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                  Trading Strategy *
                </label>
                <select
                  name="tradingStrategy"
                  value={formData.tradingStrategy}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="arbitrage">Arbitrage Trading</option>
                  <option value="momentum">Momentum Trading</option>
                  <option value="meanReversion">Mean Reversion</option>
                  <option value="gridTrading">Grid Trading</option>
                  <option value="dca">Dollar Cost Averaging</option>
                  <option value="custom">Custom Strategy</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                  Primary trading strategy approach
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                Target Token Pairs
              </label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {popularTokenPairs.map((pair) => (
                    <button
                      key={pair}
                      type="button"
                      onClick={() => addTokenPair(pair)}
                      disabled={formData.tokenPairs.includes(pair)}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        formData.tokenPairs.includes(pair)
                          ? "bg-primary-100 border-primary-300 text-primary-700 dark:bg-primary-900 dark:border-primary-700 dark:text-primary-300 cursor-not-allowed"
                          : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-primary-50 hover:border-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-primary-900"
                      }`}
                    >
                      {pair}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tokenPairs.map((pair, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm rounded-full"
                    >
                      {pair}
                      <button
                        type="button"
                        onClick={() => removeTokenPair(pair)}
                        className="ml-2 text-primary-500 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-300 mt-2">
                  Select from pre-verified token pairs on Sui network
                </p>
              </div>
            </div>
          </div>

          {/* TEE & Security Configuration */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700 p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              🔒 Nautilus TEE Configuration
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Configure your agent's endpoint and security settings for the
              Trusted Execution Environment
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                  Agent Endpoint URL *
                </label>
                <input
                  type="url"
                  name="agentEndpoint"
                  required
                  value={formData.agentEndpoint}
                  onChange={handleInputChange}
                  placeholder="https://your-agent.example.com/api/trade"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                  Your agent's API endpoint that will call the Nautilus enclave
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                  Allowed Domains
                </label>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={allowedDomainInput}
                      onChange={(e) => setAllowedDomainInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addAllowedDomain();
                        }
                      }}
                      placeholder="your-agent.example.com"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addAllowedDomain}
                      className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.allowedDomains.map((domain, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded-full"
                      >
                        {domain}
                        <button
                          type="button"
                          onClick={() => removeAllowedDomain(domain)}
                          className="ml-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-300">
                    Domains authorized to make requests to your TEE enclave
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-dark-600 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="attestationRequired"
                    name="attestationRequired"
                    checked={formData.attestationRequired}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <div>
                    <label
                      htmlFor="attestationRequired"
                      className="text-sm font-medium text-gray-700 dark:text-white"
                    >
                      Require TEE Attestation
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-300">
                      Enforce cryptographic proof that trades execute within the
                      secure enclave
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-blue-600 dark:text-blue-400 mt-0.5">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      How it works
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      Your agent will send trading requests to a Nautilus TEE
                      enclave. The enclave verifies your agent's identity,
                      executes trades securely, and provides cryptographic
                      attestation of execution.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Indicators */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700 p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              📊 Technical Indicators
            </h2>

            <div className="space-y-6">
              {/* RSI Configuration */}
              <div className="border border-gray-200 dark:border-dark-600 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    id="rsiEnabled"
                    name="rsiEnabled"
                    checked={formData.rsiEnabled}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label
                    htmlFor="rsiEnabled"
                    className="text-sm font-medium text-gray-700 dark:text-white"
                  >
                    Enable RSI (Relative Strength Index)
                  </label>
                </div>
                {formData.rsiEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">
                        Buy Threshold (Oversold)
                      </label>
                      <input
                        type="number"
                        name="rsiBuyThreshold"
                        min="0"
                        max="100"
                        value={formData.rsiBuyThreshold}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">
                        Sell Threshold (Overbought)
                      </label>
                      <input
                        type="number"
                        name="rsiSellThreshold"
                        min="0"
                        max="100"
                        value={formData.rsiSellThreshold}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Moving Average Configuration */}
              <div className="border border-gray-200 dark:border-dark-600 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    id="maEnabled"
                    name="maEnabled"
                    checked={formData.maEnabled}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label
                    htmlFor="maEnabled"
                    className="text-sm font-medium text-gray-700 dark:text-white"
                  >
                    Enable Moving Average Crossover
                  </label>
                </div>
                {formData.maEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">
                        Short Period (Fast MA)
                      </label>
                      <input
                        type="number"
                        name="maShortPeriod"
                        min="1"
                        max="200"
                        value={formData.maShortPeriod}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">
                        Long Period (Slow MA)
                      </label>
                      <input
                        type="number"
                        name="maLongPeriod"
                        min="1"
                        max="200"
                        value={formData.maLongPeriod}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Risk Management */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700 p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              🛡️ Risk Management
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                  Max Position Size (%)
                </label>
                <input
                  type="number"
                  name="maxPositionSize"
                  min="1"
                  max="100"
                  value={formData.maxPositionSize}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                  Maximum % of portfolio per trade
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                  Stop Loss (%)
                </label>
                <input
                  type="number"
                  name="stopLossPercent"
                  min="0.1"
                  max="50"
                  step="0.1"
                  value={formData.stopLossPercent}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                  Automatic stop loss percentage
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                  Take Profit (%)
                </label>
                <input
                  type="number"
                  name="takeProfitPercent"
                  min="0.1"
                  max="100"
                  step="0.1"
                  value={formData.takeProfitPercent}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                  Automatic profit taking percentage
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                  Max Drawdown (%)
                </label>
                <input
                  type="number"
                  name="maxDrawdown"
                  min="1"
                  max="50"
                  value={formData.maxDrawdown}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                  Maximum portfolio drawdown limit
                </p>
              </div>
            </div>
          </div>

          {/* Execution Parameters */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700 p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              ⚡ Execution Parameters
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                  Execution Frequency
                </label>
                <select
                  name="executionFrequency"
                  value={formData.executionFrequency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="1min">Every 1 minute</option>
                  <option value="5min">Every 5 minutes</option>
                  <option value="15min">Every 15 minutes</option>
                  <option value="1hour">Every 1 hour</option>
                  <option value="4hour">Every 4 hours</option>
                  <option value="1day">Once daily</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                  Min Trade Amount (SUI)
                </label>
                <input
                  type="number"
                  name="minTradeAmount"
                  min="1"
                  value={formData.minTradeAmount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                  Minimum trade size in SUI
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                  Max Slippage (%)
                </label>
                <input
                  type="number"
                  name="maxSlippage"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={formData.maxSlippage}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                  Maximum acceptable slippage
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700 p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Tags
            </h2>

            <div className="mb-4">
              <label
                htmlFor="tagInput"
                className="block text-sm font-medium text-gray-700 dark:text-white mb-2"
              >
                Add Tags
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="tagInput"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagInputKeyPress}
                  placeholder="e.g., DeFi, Arbitrage, Low Risk"
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-primary-500 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push("/marketplace")}
              className="px-6 py-3 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isTransacting || isInitializingBlockchain}
              className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isTransacting
                ? "Creating on Blockchain..."
                : !isReady
                  ? "Waiting for Blockchain..."
                  : "Create Agent on Sui"}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="🎉 Agent Created Successfully!"
        message={`Your secure trading agent "${successData.agentName}" has been deployed to the Sui blockchain.`}
        transactionHash={successData.transactionDigest}
        agentId={successData.agentId}
        agentName={successData.agentName}
      />
    </div>
  );
};

export default CreateAgentPage;
