import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, PlusSquare, LogIn, Camera, Sparkles, User, Image as ImageIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LoginModal from "../components/auth/LoginModal";

export default function MainLayout() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="min-h-screen text-white font-sans relative selection:bg-orange-500/30">
      
      {/* Ambient Background for Glassmorphism */}
      <div className="fixed inset-0 z-0 bg-neutral-950 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto flex justify-center xl:justify-between w-full relative z-10">
        
        {/* =========================================
            1. LEFT COLUMN: DESKTOP SIDEBAR 
            ========================================= */}
        <aside className="hidden md:flex flex-col w-[280px] h-screen sticky top-0 p-8 shrink-0">
          <Link to="/" className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300 mb-12 drop-shadow-md">
            සඳකඩ
          </Link>
          
          <nav className="flex flex-col gap-3 font-medium text-lg h-full">
            <Link 
              to="/" 
              className={`relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 ease-out group border ${
                isActive('/') 
                  ? 'bg-white/[0.08] backdrop-blur-[40px] saturate-[2.5] border-white/10 text-orange-400 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1),0_8px_32px_0_rgba(0,0,0,0.36)] translate-x-3' 
                  : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/[0.03] hover:translate-x-1'
              }`}
            >
              <Home className={`w-6 h-6 shrink-0 transition-transform duration-500 ${isActive('/') ? 'scale-110 fill-orange-400/20' : 'scale-100 group-hover:scale-110'}`} /> 
              <span>Feed</span>
            </Link>
            
            <Link 
              to="/create" 
              className={`relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 ease-out group border ${
                isActive('/create') 
                  ? 'bg-white/[0.08] backdrop-blur-[40px] saturate-[2.5] border-white/10 text-orange-400 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1),0_8px_32px_0_rgba(0,0,0,0.36)] translate-x-3' 
                  : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/[0.03] hover:translate-x-1'
              }`}
            >
              <PlusSquare className={`w-6 h-6 shrink-0 transition-transform duration-500 ${isActive('/create') ? 'scale-110 fill-orange-400/20' : 'scale-100 group-hover:scale-110'}`} /> 
              <span>Create Card</span>
            </Link>

            <Link 
              to="/share" 
              className={`relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 ease-out group border ${
                isActive('/share') 
                  ? 'bg-white/[0.08] backdrop-blur-[40px] saturate-[2.5] border-white/10 text-orange-400 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1),0_8px_32px_0_rgba(0,0,0,0.36)] translate-x-3' 
                  : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/[0.03] hover:translate-x-1'
              }`}
            >
              <Camera className={`w-6 h-6 shrink-0 transition-transform duration-500 ${isActive('/share') ? 'scale-110 fill-orange-400/20' : 'scale-100 group-hover:scale-110'}`} /> 
              <span>Share Photo</span>
            </Link>

           {/* Vesak Zone Link (Standard Desktop Styling) */}
            <Link 
              to="/zone" 
              className={`relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 ease-out group border ${
                isActive('/zone') 
                  ? 'bg-white/[0.08] backdrop-blur-[40px] saturate-[2.5] border-white/10 text-orange-400 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1),0_8px_32px_0_rgba(0,0,0,0.36)] translate-x-3' 
                  : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/[0.03] hover:translate-x-1'
              }`}
            >
              <Sparkles className={`w-6 h-6 shrink-0 transition-transform duration-500 ${isActive('/zone') ? 'scale-110 fill-orange-400/20' : 'scale-100 group-hover:scale-110'}`} /> 
              <span>Vesak Zone</span>
            </Link>
            
          </nav>
        </aside>

        {/* =========================================
            2. CENTER COLUMN: THE MAIN GLASS PANE
            ========================================= */}
        <main className="flex-1 max-w-xl w-full pb-24 md:pb-0 md:my-6 md:min-h-[calc(100vh-3rem)] md:bg-white/[0.04] md:backdrop-blur-[40px] md:saturate-[1.5] md:border md:border-white/10 md:rounded-3xl md:shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] relative transition-all duration-700 ease-out md:hover:bg-white/[0.06] md:hover:shadow-[0_16px_64px_0_rgba(249,115,22,0.1)] flex flex-col group overflow-hidden">
          
          <div className="hidden md:block absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out" />

          {/* Mobile Header */}
          <header className="md:hidden flex items-center justify-between p-4 border-b border-white/10 sticky top-0 bg-black/40 backdrop-blur-[40px] saturate-200 z-40">
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">සඳකඩ</h1>
            
            {user ? (
              <Link to="/profile" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-yellow-400 flex items-center justify-center shadow-lg active:scale-95 transition-transform border border-white/20">
                  <span className="text-white font-bold text-sm">
                    {(user.user_metadata?.full_name || user.email || "U").charAt(0).toUpperCase()}
                  </span>
                </div>
              </Link>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="text-sm font-bold text-orange-400 bg-orange-400/10 px-4 py-1.5 rounded-full border border-orange-400/20 active:scale-95 transition-transform"
              >
                Sign In
              </button>
            )}
          </header>

          {/* NEW: Mobile "Create Post" Section (Facebook Style) - Only visible on Feed */}
          {isActive('/') && (
            <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-black/20 backdrop-blur-md">
              
              {/* Avatar Profile Picture */}
              {user ? (
                <Link to="/profile" className="shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-yellow-400 flex items-center justify-center shadow-inner border border-white/20">
                    <span className="text-white font-bold text-sm">
                      {(user.user_metadata?.full_name || user.email || "U").charAt(0).toUpperCase()}
                    </span>
                  </div>
                </Link>
              ) : (
                <button onClick={() => setShowLogin(true)} className="shrink-0">
                  <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center border border-white/10">
                    <User className="w-5 h-5 text-neutral-400" />
                  </div>
                </button>
              )}

              {/* The "What's on your mind?" Input Bar */}
              <Link
                to="/share"
                className="flex-1 bg-white/[0.05] border border-white/10 rounded-full px-4 py-2.5 text-sm text-neutral-400 transition-colors active:bg-white/[0.08] flex items-center"
              >
                Share a Vesak photo...
              </Link>

              {/* Photo Upload Icon */}
              <Link
                to="/share"
                className="p-2 text-green-400 hover:text-green-300 transition-colors shrink-0 flex flex-col items-center"
              >
                <ImageIcon className="w-6 h-6" />
              </Link>
            </div>
          )}

          <div className="p-4 md:p-6 flex-1 w-full animate-in fade-in zoom-in-[0.98] duration-700 ease-out">
            <Outlet /> 
          </div>
        </main>

        {/* =========================================
            3. RIGHT COLUMN: DESKTOP WIDGETS
            ========================================= */}
        <aside className="hidden lg:flex flex-col w-[320px] h-screen sticky top-0 p-8 shrink-0">
          
          {/* Top Right Profile / Login Widget */}
          {user ? (
            <Link to="/profile" className="flex items-center gap-4 p-4 mb-8 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 hover:bg-white/[0.06] transition-all group shadow-xl">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-yellow-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-lg">
                  {(user.user_metadata?.full_name || user.email || "U").charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold truncate">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </h3>
                <p className="text-xs text-orange-400 font-medium">View Profile</p>
              </div>
            </Link>
          ) : (
            <div className="mb-8">
              <button
                onClick={() => setShowLogin(true)}
                className="flex w-full items-center justify-center gap-3 p-4 rounded-3xl bg-orange-500/90 hover:bg-orange-500 text-white font-bold transition-all duration-500 ease-out shadow-[0_4px_20px_rgba(249,115,22,0.3)] hover:shadow-[0_8px_30px_rgba(249,115,22,0.5)] active:scale-95"
              >
                <LogIn className="w-5 h-5 shrink-0" /> 
                <span>Sign In to Sandakada</span>
              </button>
            </div>
          )}

          {/* Widget 1: Spread the Light */}
          <div className="bg-white/[0.03] backdrop-blur-2xl saturate-150 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-2 relative z-10">Spread the Light</h3>
            <p className="text-sm text-neutral-300 leading-relaxed mb-6 relative z-10">
              Sandakada marks the birth, enlightenment, and passing of the Buddha. Create a digital greeting to share peace and joy with your loved ones.
            </p>
            
            <Link 
              to="/create" 
              className="block w-full py-3.5 text-center rounded-xl bg-orange-500/80 hover:bg-orange-500 text-white font-medium transition-colors shadow-lg shadow-orange-500/20 relative z-10"
            >
              Start Crafting
            </Link>
          </div>

          <div className="text-center mt-8 space-y-1">
            <p className="text-sm font-medium text-neutral-400">
              © {new Date().getFullYear()} Sandakada. All rights reserved.
            </p>
            <p className="text-xs text-neutral-600">
              Developed by <span className="font-bold">Sethmina</span> • CodeCraft
            </p>
          </div>
        </aside>

      </div>

      {/* =========================================
          MOBILE BOTTOM NAV 
          ========================================= */}
      <div className="md:hidden fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        
        <div className="absolute inset-0 top-6 mx-auto w-[280px] h-[50px] bg-orange-500/20 blur-2xl rounded-full pointer-events-none" />

        <nav className="relative flex items-center justify-between w-full max-w-[380px] bg-white/[0.05] backdrop-blur-[40px] saturate-[2.5] border border-white/10 rounded-full p-2 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] pointer-events-auto">
          
          <Link 
            to="/" 
            className={`relative flex items-center justify-center px-4 py-3 rounded-full transition-all duration-500 ease-out ${
              isActive('/') ? 'bg-white/10 text-orange-400 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)]' : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Home className={`w-5 h-5 shrink-0 transition-transform duration-500 ${isActive('/') ? 'scale-110 fill-orange-400/20' : 'scale-100'}`} />
            <span className={`font-semibold text-sm whitespace-nowrap overflow-hidden transition-all duration-500 ease-out ${
              isActive('/') ? 'max-w-[60px] ml-2 opacity-100' : 'max-w-0 ml-0 opacity-0'
            }`}>
              Feed
            </span>
          </Link>

          <Link 
            to="/create" 
            className={`relative flex items-center justify-center px-4 py-3 rounded-full transition-all duration-500 ease-out ${
              isActive('/create') ? 'bg-white/10 text-orange-400 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)]' : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <PlusSquare className={`w-5 h-5 shrink-0 transition-transform duration-500 ${isActive('/create') ? 'scale-110 fill-orange-400/20' : 'scale-100'}`} />
            <span className={`font-semibold text-sm whitespace-nowrap overflow-hidden transition-all duration-500 ease-out ${
              isActive('/create') ? 'max-w-[60px] ml-2 opacity-100' : 'max-w-0 ml-0 opacity-0'
            }`}>
              Card
            </span>
          </Link>

          <Link 
            to="/share" 
            className={`relative flex items-center justify-center px-4 py-3 rounded-full transition-all duration-500 ease-out ${
              isActive('/share') ? 'bg-white/10 text-orange-400 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)]' : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Camera className={`w-5 h-5 shrink-0 transition-transform duration-500 ${isActive('/share') ? 'scale-110 fill-orange-400/20' : 'scale-100'}`} />
            <span className={`font-semibold text-sm whitespace-nowrap overflow-hidden transition-all duration-500 ease-out ${
              isActive('/share') ? 'max-w-[60px] ml-2 opacity-100' : 'max-w-0 ml-0 opacity-0'
            }`}>
              Photo
            </span>
          </Link>

         {/* Vesak Zone Link (Standard Mobile Styling) */}
          <Link 
            to="/zone" 
            className={`relative flex items-center justify-center px-4 py-3 rounded-full transition-all duration-500 ease-out ${
              isActive('/zone') ? 'bg-white/10 text-orange-400 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)]' : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className={`w-5 h-5 shrink-0 transition-transform duration-500 ${isActive('/zone') ? 'scale-110 fill-orange-400/20' : 'scale-100'}`} />
            <span className={`font-semibold text-sm whitespace-nowrap overflow-hidden transition-all duration-500 ease-out ${
              isActive('/zone') ? 'max-w-[60px] ml-2 opacity-100' : 'max-w-0 ml-0 opacity-0'
            }`}>
              Zone
            </span>
          </Link>
        </nav>
      </div>
      
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />

    </div>
  );
}