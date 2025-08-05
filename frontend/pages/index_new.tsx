import React from 'react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const HomePage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to landing page on app start
    router.push('/landing');
  }, [router]);

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gradient-blue border-t-transparent mx-auto mb-4"></div>
        <p className="text-text-secondary">Redirecting to landing page...</p>
      </div>
    </div>
  );
};

export default HomePage;
