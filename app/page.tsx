import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import HomepageClient from '@/components/HomepageClient';

export default function Home() {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <Header />
        <HomepageClient />
        <Footer />
      </div>
    </ThemeProvider>
  );
}
