import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Loader2, LogIn } from "lucide-react";

export default function LoginModal({ isOpen, onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // A secure, hidden password used for all "instant" guest accounts
  const INSTANT_PASSWORD = "SandakadaVesak2026!";

  const handleInstantLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Clean the email to ensure it matches perfectly every time
      const loginEmail = email.trim().toLowerCase();
      const displayName = name.trim() || "Anonymous";

      if (!loginEmail.includes('@')) {
        throw new Error("Please enter a valid email address.");
      }

      // 2. We attempt to sign them up first. 
      // If they are new, this works instantly.
      const { error: signUpError } = await supabase.auth.signUp({
        email: loginEmail,
        password: INSTANT_PASSWORD,
        options: {
          data: {
            full_name: displayName,
          },
        },
      });

      // 3. Intercept the "User already registered" error.
      // This means they are a returning user, so we just log them in!
      if (signUpError && signUpError.message.includes("User already registered")) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: INSTANT_PASSWORD,
        });
        
        if (signInError) throw signInError; // Only throw if the actual login fails
      } else if (signUpError) {
        throw signUpError; // Throw any other weird signup errors (like rate limits)
      }

      // Success! Close the modal.
      // WE DO NOT RELOAD HERE so the user's card data is preserved!
      onClose();

    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
    } catch (err) {
      setError("Google login failed. Please try the standard login.");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md p-8 bg-neutral-900 border border-white/10 shadow-2xl rounded-3xl overflow-hidden"
        >
          {/* Decorative Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-orange-500/20 blur-[60px] rounded-full pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6 relative z-10">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300 mb-2">
              සඳකඩ
            </h2>
            <p className="text-neutral-400 text-sm">
              Enter your details to start crafting.
            </p>
          </div>

          <form onSubmit={handleInstantLogin} className="space-y-4 relative z-10">
            {/* Name Input */}
            <div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded-lg border border-red-400/20">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !name || !email}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-black font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <LogIn className="w-5 h-5" />
                  Enter Sandakada
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center py-6 z-10">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-neutral-500 text-xs font-bold uppercase tracking-wider">Or</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Google Login Option */}
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-xl transition-all active:scale-[0.98] relative z-10"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}