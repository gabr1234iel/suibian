import type { AppProps } from 'next/app';
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
    <div className={jetbrainsMono.className}>
      <AppContextProvider>
          <Component {...pageProps} />
      </AppContextProvider>
    </div>
  );
}

export default MyApp;
