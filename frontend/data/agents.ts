import { Agent } from '../types';

export const agents: Agent[] = [
  {
    id: '1',
    name: 'DeFi Yield Maximizer',
    creator: '0x1234...5678',
    strategy: 'Automated yield farming across multiple DeFi protocols',
    riskLevel: 'Medium',
    description: 'This strategy automatically moves funds between the highest-yielding DeFi protocols while managing risk through diversification and automated rebalancing.',
    performanceMetrics: {
      totalReturn: 45.2,
      winRate: 78,
      sharpeRatio: 1.8,
      maxDrawdown: 12.5
    },
    fee: 2.5,
    tags: ['DeFi', 'Yield Farming', 'Automated'],
    createdAt: '2024-01-15',
    subscribers: 1250
  },
  {
    id: '2',
    name: 'Momentum Trading Bot',
    creator: '0x9876...4321',
    strategy: 'Technical analysis-based momentum trading',
    riskLevel: 'High',
    description: 'Uses advanced technical indicators and momentum signals to execute high-frequency trades across major cryptocurrency pairs.',
    performanceMetrics: {
      totalReturn: 89.7,
      winRate: 65,
      sharpeRatio: 2.1,
      maxDrawdown: 28.3
    },
    fee: 3.0,
    tags: ['Technical Analysis', 'High Frequency', 'Momentum'],
    createdAt: '2024-02-01',
    subscribers: 850
  },
  {
    id: '3',
    name: 'Conservative DCA Strategy',
    creator: '0x5555...7777',
    strategy: 'Dollar-cost averaging with risk management',
    riskLevel: 'Low',
    description: 'A conservative approach using dollar-cost averaging combined with market timing indicators to build long-term cryptocurrency positions.',
    performanceMetrics: {
      totalReturn: 23.8,
      winRate: 92,
      sharpeRatio: 1.3,
      maxDrawdown: 8.2
    },
    fee: 1.5,
    tags: ['DCA', 'Conservative', 'Long-term'],
    createdAt: '2024-01-20',
    subscribers: 2100
  },
  {
    id: '4',
    name: 'Arbitrage Hunter',
    creator: '0x2222...8888',
    strategy: 'Cross-exchange arbitrage opportunities',
    riskLevel: 'Medium',
    description: 'Identifies and executes arbitrage opportunities across different exchanges and DEXs to capture price differences.',
    performanceMetrics: {
      totalReturn: 31.5,
      winRate: 85,
      sharpeRatio: 2.5,
      maxDrawdown: 5.1
    },
    fee: 2.0,
    tags: ['Arbitrage', 'Cross-exchange', 'Low Risk'],
    createdAt: '2024-02-10',
    subscribers: 950
  },
  {
    id: '5',
    name: 'NFT Floor Sweeper',
    creator: '0x3333...9999',
    strategy: 'Automated NFT collection floor price monitoring',
    riskLevel: 'High',
    description: 'Monitors popular NFT collections and automatically purchases items below floor price for quick resale opportunities.',
    performanceMetrics: {
      totalReturn: 67.3,
      winRate: 58,
      sharpeRatio: 1.6,
      maxDrawdown: 35.7
    },
    fee: 4.0,
    tags: ['NFT', 'Floor Price', 'Automated'],
    createdAt: '2024-01-25',
    subscribers: 430
  },
  {
    id: '6',
    name: 'Stablecoin Yield Optimizer',
    creator: '0x4444...1111',
    strategy: 'Low-risk stablecoin yield generation',
    riskLevel: 'Low',
    description: 'Optimizes stablecoin holdings across various lending protocols and yield farms to maximize returns while maintaining low risk.',
    performanceMetrics: {
      totalReturn: 12.4,
      winRate: 96,
      sharpeRatio: 3.2,
      maxDrawdown: 2.1
    },
    fee: 1.0,
    tags: ['Stablecoin', 'Low Risk', 'Yield'],
    createdAt: '2024-02-05',
    subscribers: 3200
  }
];
