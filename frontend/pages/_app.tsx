import type { AppProps } from 'next/app';
import Head from 'next/head';
import { AppContextProvider } from '../context/AppContext';
import '../styles/globals.css';
import { useEffect } from 'react';
import { JetBrains_Mono } from 'next/font/google';

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-jetbrains'
});

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Force dark mode by adding the class to html element - only on client side
    if (typeof window !== 'undefined') {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <>
      <Head>
        <title>SuiBian - Decentralized Trading Agents</title>
        <meta name="description" content="SuiBian is a decentralized platform for creating, deploying, and subscribing to autonomous trading agents on the Sui blockchain." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </Head>
      <div className={jetbrainsMono.className}>
        <AppContextProvider>
            <Component {...pageProps} />
        </AppContextProvider>
      </div>
    </>
  );
}

export default MyApp;
