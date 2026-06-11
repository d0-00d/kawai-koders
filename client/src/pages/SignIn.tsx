// client/src/pages/SignIn.tsx
import { Link } from 'react-router-dom';

const SignIn = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg text-text px-4">
      <div className="max-w-[400px] w-full bg-surface border border-border rounded p-[40px]">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl tracking-[0.12em] mb-2 uppercase text-white">Kohnrad</h1>
          <p className="font-sans font-light text-muted text-sm tracking-wide">Sign in to your console</p>
        </div>
        
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-muted mb-2 font-sans tracking-wide" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="admin@kohnrad.com"
              className="w-full px-[14px] py-[10px] bg-bg border border-border rounded-sm focus:outline-none focus:border-primary transition-colors text-white placeholder-muted font-sans font-light"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted mb-2 font-sans tracking-wide" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full px-[14px] py-[10px] bg-bg border border-border rounded-sm focus:outline-none focus:border-primary transition-colors text-white placeholder-muted font-sans font-light"
            />
          </div>

          <button
            type="button"
            className="w-full bg-primary text-black rounded-sm px-8 py-3 font-medium tracking-wide uppercase transition-colors duration-200 hover:bg-secondary mt-2"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/" className="font-sans font-light text-[13px] text-muted hover:text-primary transition-colors flex items-center justify-center tracking-wide">
            <span className="mr-2">&larr;</span> Back to Platform
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
