import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { X, Mail, Globe, Loader2 } from "lucide-react";

export default function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      setMessage("Check your email for the magic link!");
    } catch (error) {
      console.error("Email login error:", error);
      setMessage("Error sending email. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      
      {/* Modal Box */}
      <div className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-2">Release Your Light</h2>
        <p className="text-sm text-neutral-400 mb-6">Create an account in seconds to save and share your Vesak cards.</p>

        {/* Google Login */}
        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-white hover:bg-neutral-200 text-black font-medium py-3 rounded-xl flex items-center justify-center gap-3 transition-colors mb-4"
        >
          <Globe className="w-5 h-5" />
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-xs text-neutral-500 uppercase font-medium">Or</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        {/* Email Magic Link */}
        <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
          <input 
            type="email" 
            placeholder="name@example.com" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
          />
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
            Send Magic Link
          </button>
        </form>

        {message && (
          <p className="text-green-400 text-sm text-center mt-4 bg-green-400/10 py-2 rounded-lg border border-green-400/20">
            {message}
          </p>
        )}

      </div>
    </div>
  );
}