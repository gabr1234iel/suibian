import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '../context/AppContext';

interface AgentFormData {
  name: string;
  strategy: string;
  description: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  fee: number;
  tags: string[];
}

const CreateAgentPage: React.FC = () => {
  const { isLoggedIn } = useAppContext();
  const router = useRouter();
  const [formData, setFormData] = useState<AgentFormData>({
    name: '',
    strategy: '',
    description: '',
    riskLevel: 'Medium',
    fee: 2.0,
    tags: []
  });
  const [tagInput, setTagInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'fee' ? parseFloat(value) || 0 : value
    }));
  };

  const addTag = (): void => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string): void => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // For now, just redirect to marketplace
    router.push('/marketplace');
    setIsSubmitting(false);
  };

  if (!isLoggedIn) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Create Trading Agent
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Share your trading strategy with the community and earn fees from subscribers
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700 p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Agent Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., DeFi Yield Maximizer"
                className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="riskLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
            <label htmlFor="strategy" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="mt-6">
            <label htmlFor="fee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Fee charged to subscribers (0-10%)
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700 p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Tags
          </h2>
          
          <div className="mb-4">
            <label htmlFor="tagInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/marketplace')}
            className="px-6 py-3 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Creating...' : 'Create Agent'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAgentPage;
