// client/src/components/Navbar.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // 60px scroll threshold to trigger frosted glass effect
      // This threshold allows the user to scroll slightly before the navbar background kicks in,
      // creating a more fluid transition from the fully transparent initial state.
      setIsScrolled(window.scrollY > 60);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 h-[56px] z-50 flex items-center justify-between px-8 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isScrolled 
          ? 'bg-[rgba(10,10,10,0.75)] backdrop-blur-[14px] backdrop-saturate-[140%] border-b border-[rgba(163,230,53,0.08)]' 
          : 'bg-transparent border-b-transparent shadow-none backdrop-blur-none transition-none'
      }`}
    >
      <div className="flex items-center">
        <Link 
          to="/" 
          className="text-[#ffffff] text-2xl font-bold tracking-[0.12em] font-display uppercase"
          style={{ textShadow: '0 0 20px rgba(0,0,0,0.5)' }}
        >
          Kohnrad
        </Link>
      </div>

      <div className="hidden md:flex space-x-8 absolute left-1/2 transform -translate-x-1/2">
        <span className="text-[rgba(255,255,255,0.65)] hover:text-[#ffffff] cursor-pointer transition-colors duration-200 ease-in-out text-sm uppercase tracking-widest font-medium">Sub Tab 1</span>
        <span className="text-[rgba(255,255,255,0.65)] hover:text-[#ffffff] cursor-pointer transition-colors duration-200 ease-in-out text-sm uppercase tracking-widest font-medium">Sub Tab 2</span>
        <span className="text-[rgba(255,255,255,0.65)] hover:text-[#ffffff] cursor-pointer transition-colors duration-200 ease-in-out text-sm uppercase tracking-widest font-medium">Sub Tab 3</span>
        <span className="text-[rgba(255,255,255,0.65)] hover:text-[#ffffff] cursor-pointer transition-colors duration-200 ease-in-out text-sm uppercase tracking-widest font-medium">Sub Tab 4</span>
        <span className="text-[rgba(255,255,255,0.65)] hover:text-[#ffffff] cursor-pointer transition-colors duration-200 ease-in-out text-sm uppercase tracking-widest font-medium">Sub Tab 5</span>
      </div>

      <div className="flex items-center">
        <button 
          onClick={() => navigate('/signin')}
          className="border border-[rgba(163,230,53,0.5)] text-[#a3e635] bg-transparent hover:bg-[#a3e635] hover:text-[#000000] px-6 py-2 rounded-sm font-medium transition-all duration-200 ease-in-out tracking-wide uppercase text-sm"
        >
          Sign In
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
