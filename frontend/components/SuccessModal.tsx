import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  transactionHash?: string;
  agentId?: string;
  agentName?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  transactionHash,
  agentId,
  agentName,
}) => {
  const [showTick, setShowTick] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Trigger the tick animation after a short delay
      const timer = setTimeout(() => {
        setShowTick(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowTick(false);
    }
  }, [isOpen]);

  const getSuiScanUrl = (hash: string) => {
    return `https://suiscan.xyz/devnet/tx/${hash}`;
  };

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-dark-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-700 max-w-md w-full p-8 transform transition-all duration-300 scale-100">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Success Icon with Animation */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <svg
                className={`w-12 h-12 text-green-600 dark:text-green-400 transition-all duration-500 ${
                  showTick ? "scale-100 opacity-100" : "scale-0 opacity-0"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                  className="animate-[draw_0.5s_ease-in-out_forwards]"
                />
              </svg>
            </div>
            {/* Animated ring */}
            <div 
              className={`absolute inset-0 w-20 h-20 border-4 border-green-400 rounded-full transition-all duration-700 ${
                showTick ? "scale-110 opacity-0" : "scale-100 opacity-100"
              }`}
            />
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {message}
          </p>

          {/* Agent Details */}
          {agentName && (
            <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4 mb-6 text-left">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Agent Details:</h4>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <div><span className="font-medium">Name:</span> {agentName}</div>
                {agentId && (
                  <div><span className="font-medium">ID:</span> {agentId.slice(0, 20)}...</div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {transactionHash && (
              <a
                href={getSuiScanUrl(transactionHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View on SuiScan
              </a>
            )}
            
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default SuccessModal;