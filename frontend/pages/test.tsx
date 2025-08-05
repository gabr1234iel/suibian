import React from 'react';
import FirebaseTest from '../components/FirebaseTest';
import Layout from '../components/Layout';

const TestPage: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-purple-900 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl font-bold text-center mb-8 text-white">
            Firebase Connection Test
          </h1>
          <FirebaseTest />
        </div>
      </div>
    </Layout>
  );
};

export default TestPage;
