import { useState } from "react";
import { Share2, Image as ImageIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LoginModal from "../components/auth/LoginModal";
import { supabase } from "../lib/supabase"; // 

// Replace these filenames with the actual names of the JPEGs in your public/cards/ folder
const TEMPLATES = [
  "/cards/vesak1.png", 
  "/cards/vesak2.png",
  "/cards/vesak3.png",
  "/cards/vesak4.png",
  "/cards/vesak5.png",
  "/cards/vesak6.png", 
  "/cards/vesak7.png",
  "/cards/vesak8.png",
  "/cards/vesak9.png",
  "/cards/vesak10.png",
  "/cards/vesak11.png", 
  "/cards/vesak12.png",
  "/cards/vesak13.png",
  "/cards/vesak14.png",
  "/cards/vesak15.png",
  "/cards/vesak16.png", 
  "/cards/vesak17.png",
  "/cards/vesak18.png",
  "/cards/vesak19.png",
  "/cards/vesak20.png",
  "/cards/vesak21.png", 
  "/cards/vesak22.png",
  "/cards/vesak23.png", 
  "/cards/vesak24.png",
  "/cards/vesak25.png",
  "/cards/vesak26.png", 
  "/cards/vesak27.png",
  "/cards/vesak28.png"
];

const PRESET_MESSAGES = [
  "සිත පිබිදෙනවා, පහන් දැල්වෙනවා,\nඔබගේ පවුලට, සුබ වෙසක් වේවා!",
  "May the light of Vesak guide you on the path of peace and harmony.",
];

export default function CardMaker() {
  const { user } = useAuth(); // Grabbing our global auth state
  const [showLogin, setShowLogin] = useState(false);
  const [selectedBg, setSelectedBg] = useState(TEMPLATES[0]);
  const [message, setMessage] = useState(PRESET_MESSAGES[0]);
  const [isSaving, setIsSaving] = useState(false);

  const handleCreateLink = async () => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    setIsSaving(true);
    try {
      // 1. Figure out their display name
      const displayName = 
        user.user_metadata?.full_name || // If Google login
        user.email?.split('@')[0] ||     // If Email login
        'Anonymous';

      // 2. Save it to Supabase
      const { data, error } = await supabase
        .from('vesak_cards')
        .insert([{ 
          message: message, 
          bg_url: selectedBg, 
          user_id: user.id,
          author_name: displayName // <-- We added this line!
        }])
        .select()
        .single();

      if (error) throw error;
      
      alert("Card saved perfectly! Check the Feed.");
      
    } catch (error) {
      console.error(error);
      alert("Failed to save card.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto flex flex-col gap-6 animate-in fade-in duration-500">
      
      {/* =========================================
          1. THE LIVE PREVIEW
          ========================================= */}
      <div 
        className="w-full aspect-[4/5] rounded-2xl relative overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center p-8 text-center transition-all bg-neutral-800"
      >
        {/* The Background JPEG */}
        <img 
          src={selectedBg} 
          alt="Card Background" 
          className="absolute inset-0 w-full h-full object-cover z-0"
          // Fallback style just in case your images haven't loaded yet
          onError={(e) => { e.target.style.display = 'none'; }} 
        />
        
        {/* A dark overlay so the white text is always readable */}
        <div className="absolute inset-0 bg-black/40 z-10" />

        {/* The Text */}
        <p className="text-white text-xl md:text-2xl font-medium whitespace-pre-wrap drop-shadow-lg z-20 leading-relaxed">
          {message || "Type your greeting below..."}
        </p>
      </div>

      {/* =========================================
          2. THE STUDIO CONTROLS
          ========================================= */}
      <div className="flex flex-col gap-5 bg-neutral-900/50 backdrop-blur-md p-5 rounded-2xl border border-white/5">
        
       {/* Template Selector */}
        <div>
          <label className="text-sm text-neutral-400 font-medium flex items-center gap-2 mb-3">
            <ImageIcon className="w-4 h-4" /> Pick a Design
          </label>
          
          {/* Upgraded to a vertically scrolling grid! */}
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-[180px] overflow-y-auto pr-2 pb-2">
            {TEMPLATES.map((bgPath, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedBg(bgPath)}
                className={`w-full aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  selectedBg === bgPath ? "border-orange-500 scale-105 shadow-[0_0_15px_rgba(249,115,22,0.4)] z-10" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={bgPath} alt={`Template ${idx}`} className="w-full h-full object-cover bg-neutral-800" />
              </button>
            ))}
          </div>
        </div>

        {/* Text Input */}
        <div>
          <label className="text-sm text-neutral-400 font-medium mb-2 block">Your Greeting</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-xl bg-neutral-950 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-neutral-600"
            placeholder="Write a beautiful Vesak wish..."
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleCreateLink}
          disabled={isSaving || !message}
          className="w-full mt-2 rounded-xl py-3.5 font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Share2 className="w-5 h-5" />
          {isSaving ? "Crafting..." : "Create Shareable Link"}
        </button>

      </div>
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}