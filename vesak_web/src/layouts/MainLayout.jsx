import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, PlusSquare, User } from "lucide-react";

export default function MainLayout() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen text-white font-sans relative selection:bg-orange-500/30">
      
      {/* =========================================
          AMBIENT BACKGROUND (The secret to the glass effect!)
          ========================================= */}
      {/* We put large, heavily blurred glowing orbs in the background so the glass panels have colors to distort */}
      <div className="fixed inset-0 z-0 bg-neutral-950 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-[150px]" />
      </div>

      {/* Main Wrapper (z-10 brings it above the background orbs) */}
      <div className="max-w-7xl mx-auto flex justify-center xl:justify-between w-full relative z-10">
        
        {/* =========================================
            1. LEFT COLUMN: DESKTOP SIDEBAR
            ========================================= */}
        <aside className="hidden md:flex flex-col w-[280px] h-screen sticky top-0 p-8 shrink-0">
          <Link to="/" className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300 mb-12 drop-shadow-md">
            Lumina
          </Link>
          
          <nav className="flex flex-col gap-4 font-medium text-lg">
            <Link 
              to="/" 
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${isActive('/') ? 'bg-white/10 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.1)] border border-white/10 text-orange-400 font-bold' : 'hover:bg-white/5 hover:backdrop-blur-sm hover:text-orange-400 text-neutral-300'}`}
            >
              <Home className={`w-6 h-6 ${isActive('/') ? 'fill-orange-400/20' : ''}`} /> Feed
            </Link>
            
            <Link 
              to="/create" 
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${isActive('/create') ? 'bg-white/10 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.1)] border border-white/10 text-orange-400 font-bold' : 'hover:bg-white/5 hover:backdrop-blur-sm hover:text-orange-400 text-neutral-300'}`}
            >
              <PlusSquare className={`w-6 h-6 ${isActive('/create') ? 'fill-orange-400/20' : ''}`} /> Create Card
            </Link>
            
            <Link 
              to="/profile" 
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${isActive('/profile') ? 'bg-white/10 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.1)] border border-white/10 text-orange-400 font-bold' : 'hover:bg-white/5 hover:backdrop-blur-sm hover:text-orange-400 text-neutral-300'}`}
            >
              <User className={`w-6 h-6 ${isActive('/profile') ? 'fill-orange-400/20' : ''}`} /> Profile
            </Link>
          </nav>
        </aside>

        {/* =========================================
            2. CENTER COLUMN: THE MAIN GLASS PANE
            ========================================= */}
        {/* We apply a massive frosted glass effect to the entire center column on desktop */}
        <main className="flex-1 max-w-xl w-full pb-20 md:pb-0 min-h-screen md:bg-white/[0.02] md:backdrop-blur-3xl md:border-x md:border-white/10 md:shadow-2xl relative">
          
          {/* Mobile Header - iOS Glass Header */}
          <header className="md:hidden flex items-center justify-between p-4 border-b border-white/10 sticky top-0 bg-black/40 backdrop-blur-2xl saturate-150 z-40">
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">Lumina</h1>
          </header>

          <div className="p-4 md:p-6">
            <Outlet /> 
          </div>
        </main>

        {/* =========================================
            3. RIGHT COLUMN: DESKTOP WIDGETS
            ========================================= */}
        <aside className="hidden lg:flex flex-col w-[320px] h-screen sticky top-0 p-8 shrink-0">
          
          {/* iOS Frosted Widget */}
          <div className="bg-white/[0.03] backdrop-blur-2xl saturate-150 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-2 relative z-10">Spread the Light</h3>
            <p className="text-sm text-neutral-300 leading-relaxed mb-6 relative z-10">
              Vesak marks the birth, enlightenment, and passing of the Buddha. Create a digital greeting to share peace and joy with your loved ones.
            </p>
            
            <Link 
              to="/create" 
              className="block w-full py-3.5 text-center rounded-xl bg-orange-500/80 hover:bg-orange-500 text-white font-medium transition-colors shadow-lg shadow-orange-500/20 relative z-10"
            >
              Start Crafting
            </Link>
          </div>

          <div className="mt-8 text-xs text-neutral-500 px-4">
            <p>© 2026 Vesak Lumina. Built with React & Supabase.</p>
          </div>
        </aside>

      </div>

      {/* =========================================
          MOBILE BOTTOM NAV - iOS Frosted Tab Bar
          ========================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-white/10 bg-black/40 backdrop-blur-2xl saturate-150 flex justify-around items-center p-4 z-50 pb-safe">
        <Link to="/" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/') ? 'text-orange-400' : 'text-neutral-400 hover:text-white'}`}>
          <Home className={`w-6 h-6 ${isActive('/') ? 'fill-orange-400/20' : ''}`} />
        </Link>
        <Link to="/create" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/create') ? 'text-orange-400' : 'text-neutral-400 hover:text-white'}`}>
          <PlusSquare className={`w-6 h-6 ${isActive('/create') ? 'fill-orange-400/20' : ''}`} />
        </Link>
        <Link to="/profile" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/profile') ? 'text-orange-400' : 'text-neutral-400 hover:text-white'}`}>
          <User className={`w-6 h-6 ${isActive('/profile') ? 'fill-orange-400/20' : ''}`} />
        </Link>
      </nav>

    </div>
  );
}