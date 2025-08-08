import React, { useState } from "react";
import Header from "@/components/Header";

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  isOpen,
  onToggle,
}) => {
  return (
    <div className="border border-gray-200 dark:border-dark-700 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 text-left bg-gray-50 dark:bg-dark-700 hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors flex justify-between items-center"
      >
        <span className="font-medium text-gray-900 dark:text-white">
          {title}
        </span>
        <svg
          className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-700">
          <div className="text-gray-700 dark:text-gray-300">{children}</div>
        </div>
      )}
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);
  const [profileData, setProfileData] = useState({
    email: "user@example.com",
    notifications: true,
    riskTolerance: "Medium",
  });

  const handleAccordionToggle = (index: number): void => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value, type } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // Handle profile update
    alert("Profile updated successfully!");
  };

  const faqItems = [
    {
      title: "What is a trading agent?",
      content:
        "A trading agent is an automated strategy created by experienced traders that can execute trades on your behalf based on predefined algorithms and market conditions.",
    },
    {
      title: "How do fees work?",
      content:
        "Each trading agent charges a management fee (typically 1-5%) which is deducted from your profits. You only pay fees when the agent generates positive returns for you.",
    },
    {
      title: "Is my money safe?",
      content:
        "All funds are secured through smart contracts on the blockchain. Agent creators cannot directly access your funds - they can only execute trades according to their published strategies.",
    },
    {
      title: "Can I withdraw my money anytime?",
      content:
        "Yes, you can unsubscribe from any agent and withdraw your funds at any time. However, some strategies may have lock-up periods for optimal performance.",
    },
    {
      title: "How are performance metrics calculated?",
      content:
        "All performance metrics are calculated in real-time based on actual trading results. Total return shows the cumulative performance, while win rate shows the percentage of profitable trades.",
    },
    {
      title: "What happens if an agent performs poorly?",
      content:
        "You can unsubscribe from any underperforming agent at any time. We also provide risk management tools and recommendations to help you diversify your portfolio.",
    },
    {
      title: "How do I create my own trading agent?",
      content:
        "To create an agent, you need to define your trading strategy, provide historical performance data, and pass our verification process. Visit the 'Create Agent' page to get started.",
    },
    {
      title: "What are the risks involved?",
      content:
        "Trading cryptocurrencies involves significant risk and you may lose some or all of your investment. Different agents have different risk levels clearly marked to help you make informed decisions.",
    },
  ];

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account preferences and get answers to common questions
          </p>
        </div>

        <div className="space-y-8">
          {/* Profile Settings */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Profile Settings
            </h2>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="riskTolerance"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Risk Tolerance
                </label>
                <select
                  id="riskTolerance"
                  name="riskTolerance"
                  value={profileData.riskTolerance}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="Low">Conservative</option>
                  <option value="Medium">Moderate</option>
                  <option value="High">Aggressive</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notifications"
                  name="notifications"
                  checked={profileData.notifications}
                  onChange={handleProfileChange}
                  className="w-4 h-4 text-primary-600 bg-gray-100 dark:bg-dark-700 border-gray-300 dark:border-dark-600 rounded focus:ring-primary-500 dark:focus:ring-primary-600 focus:ring-2"
                />
                <label
                  htmlFor="notifications"
                  className="ml-3 text-sm text-gray-700 dark:text-gray-300"
                >
                  Receive email notifications about your agents' performance
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* FAQ Section */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  title={item.title}
                  isOpen={openAccordion === index}
                  onToggle={() => handleAccordionToggle(index)}
                >
                  {item.content}
                </AccordionItem>
              ))}
            </div>
          </div>

          {/* Support Section */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Need Help?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-6 border border-gray-200 dark:border-dark-700 rounded-lg">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-primary-600 dark:text-primary-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Email Support
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Get help from our support team within 24 hours
                </p>
                <a
                  href="mailto:support@.com"
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                >
                  support@suibian.com
                </a>
              </div>

              <div className="text-center p-6 border border-gray-200 dark:border-dark-700 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Live Chat
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Chat with us in real-time for immediate assistance
                </p>
                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                  Start Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
