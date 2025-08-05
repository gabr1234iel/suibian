import type { AppProps } from 'next/app';
import { AppContextProvider } from '../context/AppContext';
import Layout from '../components/Layout';
import '../styles/globals.css';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Force dark mode by adding the class to html element
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <AppContextProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AppContextProvider>
  );
}

export default MyApp;
