import React from 'react';
import { useRouter } from 'next/router';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const isLoginPage = router.pathname === '/login';
  const isLandingPage = router.pathname === '/landing';
  const isHomePage = router.pathname === '/';

  return (
    <div className="min-h-screen bg-dark-900 text-white transition-colors duration-200">
      {!isLoginPage && !isLandingPage && !isHomePage && <Header />}
      <main className={`${!isLoginPage && !isLandingPage && !isHomePage ? 'container mx-auto px-4 py-8' : ''}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
