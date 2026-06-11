// client/src/pages/Landing.tsx
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PixelWaveBackground from '../components/PixelWaveBackground';
const tabs = ['Sub Tab 1', 'Sub Tab 2', 'Sub Tab 3', 'Sub Tab 4', 'Sub Tab 5'];

const Landing = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <main className="relative top-0 min-h-screen flex items-center overflow-hidden">
        <PixelWaveBackground />

        <div className="relative z-20 container mx-auto px-8 md:px-16 pt-[56px] flex flex-col items-start text-left">
          <h1 className="font-display font-bold text-[72px] tracking-[0.15em] text-white leading-none mb-6">
            KOHNRAD
          </h1>
          <p className="font-sans font-light text-[18px] text-muted mb-10 max-w-lg">
            Lorem ipsum your mom kinda gay
          </p>
          <button className="bg-primary text-black rounded-sm px-8 py-3 font-medium tracking-wide uppercase transition-colors duration-200 hover:bg-secondary">
            EARLY ACCESS
          </button>
        </div>
      </main>

      {/* Tab Navigation */}
      <div className="sticky top-[73px] z-40 w-full bg-surface border-b border-border">
        <div className="container mx-auto px-4 flex justify-center space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 font-sans font-medium text-[14px] uppercase tracking-[0.08em] transition-colors border-b-2 ${activeTab === tab
                ? 'text-primary border-primary'
                : 'text-muted border-transparent hover:text-white'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Placeholder Cards */}
      <section className="flex-grow bg-bg py-24 flex items-start justify-center">
        <div className="bg-surface border border-border rounded p-12 max-w-2xl w-full text-center flex flex-col items-center">
          <span className="inline-block bg-transparent border border-primary text-primary text-[11px] uppercase tracking-[0.1em] px-3 py-1 rounded-sm mb-6">
            {activeTab} Module
          </span>
          <h2 className="font-display font-bold text-[28px] text-white mb-4">
            Advanced {activeTab}
          </h2>
          <p className="font-sans font-light text-[16px] text-muted max-w-[480px]">
            Deploy highly scalable, resilient architecture that seamlessly integrates into your existing workflows without compromising on security or performance.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
