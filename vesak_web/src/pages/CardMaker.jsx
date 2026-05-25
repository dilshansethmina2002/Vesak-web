import { useState } from "react";
import { Share2, Image as ImageIcon, RotateCw, Save } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LoginModal from "../components/auth/LoginModal";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../context/AlertContext";

const TEMPLATES = [
  "/cards/vesak1.png", "/cards/vesak2.png", "/cards/vesak3.png", "/cards/vesak4.png",
  "/cards/vesak5.png", "/cards/vesak6.png", "/cards/vesak7.png", "/cards/vesak8.png",
  "/cards/vesak9.png", "/cards/vesak10.png", "/cards/vesak11.png", "/cards/vesak12.png",
  "/cards/vesak13.png", "/cards/vesak14.png", "/cards/vesak15.png", "/cards/vesak16.png",
  "/cards/vesak17.png", "/cards/vesak18.png", "/cards/vesak19.png", "/cards/vesak20.png",
  "/cards/vesak21.png", "/cards/vesak22.png", "/cards/vesak23.png", "/cards/vesak24.png",
  "/cards/vesak25.png", "/cards/vesak26.png", "/cards/vesak27.png", "/cards/vesak28.png"
];

const PRESET_MESSAGES = [
  "සිත පිබිදෙනවා, පහන් දැල්වෙනවා,\nඔබගේ පවුලට, සුබ වෙසක් වේවා!",
  "May the light of Vesak guide you on the path of peace and harmony.",
];

export default function CardMaker() {
  const { user } = useAuth();
  const { showAlert } = useAlert(); // <-- Grab our custom alert
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [selectedBg, setSelectedBg] = useState(TEMPLATES[0]);
  
  // New State for the Postcard
  const [isFlipped, setIsFlipped] = useState(false);
  const [toName, setToName] = useState("");
  const [fromName, setFromName] = useState("");
  const [message, setMessage] = useState(PRESET_MESSAGES[0]);
  
  const [isSaving, setIsSaving] = useState(false);

 // ==========================================
  // CORE SAVE FUNCTION
  // ==========================================
  const saveCardToDatabase = async () => {
    if (!user) {
      setShowLogin(true);
      return null;
    }

    setIsSaving(true);
    try {
      const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous';
      const finalFromName = fromName.trim() || displayName;

      const { data, error } = await supabase
        .from('vesak_cards')
        .insert([{ 
          message: message, 
          bg_url: selectedBg, 
          user_id: user.id,
          author_name: finalFromName, 
          to_name: toName,         
          from_name: finalFromName 
        }])
        .select()
        .single();

      if (error) throw error;
      return data; // Return the saved card data to whichever button clicked it
      
    } catch (error) {
      console.error(error);
      showAlert("Crafting Failed", "We couldn't save your card right now. Please try again.");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================
  // BUTTON 1: SAVE & SHARE
  // ==========================================
  const handleShare = async () => {
    const savedCard = await saveCardToDatabase();
    if (!savedCard) return; // Stop if saving failed

    const cardUrl = `${window.location.origin}/card/${savedCard.id}`;
    const shareTitle = `Vesak Greeting from ${savedCard.from_name}`;
    const shareText = `මම ඔයාට ලස්සන වෙසක් පතක් හැදුවා! මෙතනින් බලන්න: `;

    try {
      if (navigator.share) {
        await navigator.share({ title: shareTitle, text: shareText, url: cardUrl });
        showAlert("Shared Successfully", "Your beautiful card is out in the world!");
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${cardUrl}`);
        showAlert("Link Copied!", "Link copied to your clipboard. Paste it anywhere to share!");
      }
    } catch (shareError) {
      console.log("Share menu closed by user.");
      showAlert("Card Saved!", "Your card has been saved to the Feed.");
    }

    navigate("/");
  };

  // ==========================================
  // BUTTON 2: JUST SAVE TO FEED
  // ==========================================
  const handleSaveOnly = async () => {
    const savedCard = await saveCardToDatabase();
    if (!savedCard) return;

    showAlert("Card Added!", "Your beautiful card is now on the community feed.");
    navigate("/");
  };

  return (
    <div className="max-w-md mx-auto flex flex-col gap-6 animate-in fade-in duration-500">
      
      {/* =========================================
          1. THE 3D FLIP CARD
          ========================================= */}
      <div 
        className="w-full aspect-[4/5] relative [perspective:1000px] cursor-pointer group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Flip Indicator */}
        <div className="absolute -top-4 -right-4 z-50 bg-neutral-900 border border-white/20 p-2 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <RotateCw className="w-5 h-5 text-orange-400" />
        </div>

        {/* The 3D Wrapper */}
        <div className={`relative w-full h-full transition-all duration-700 ease-in-out [transform-style:preserve-3d] shadow-2xl rounded-2xl ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
          
          {/* ---- FRONT FACE (Image Only) ---- */}
          <div className="absolute inset-0 [backface-visibility:hidden] rounded-2xl overflow-hidden border border-white/10 bg-neutral-800">
            <img 
              src={selectedBg} 
              alt="Card Front" 
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }} 
            />
          </div>

          {/* ---- BACK FACE (Classic Postcard) ---- */}
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl bg-[#EFE9D9] text-neutral-800 p-6 flex flex-col border border-white/20 shadow-inner overflow-hidden">
            
            {/* Texture Overlay (Optional subtle grain) */}
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/paper.png')]" />

            {/* To Section & Stamp */}
            <div className="flex justify-between items-start border-b border-neutral-400/40 pb-4 mb-4 relative z-10">
              <div className="font-serif text-xl text-orange-950 truncate pr-4">
                <span className="text-neutral-500 text-xs uppercase tracking-widest block mb-1">To</span>
                {toName || "..."}
              </div>
              <div className="w-14 h-16 shrink-0 border-2 border-dashed border-neutral-400/60 flex items-center justify-center p-1">
                <span className="text-[10px] text-neutral-400/80 font-medium uppercase tracking-widest rotate-12 text-center">Stamp<br/>Here</span>
              </div>
            </div>

            {/* Message Body */}
            <div className="flex-1 flex items-center justify-center font-serif text-lg text-center whitespace-pre-wrap px-2 leading-relaxed text-neutral-800 relative z-10">
              {message || "Write your beautiful Vesak wish here..."}
            </div>

            {/* From Section */}
            <div className="text-right border-t border-neutral-400/40 pt-4 mt-4 font-serif text-xl text-orange-950 relative z-10">
              <span className="text-neutral-500 text-xs uppercase tracking-widest block mb-1">From</span>
              {fromName || user?.user_metadata?.full_name || "..."}
            </div>
          </div>

        </div>
      </div>

      {/* =========================================
          2. THE STUDIO CONTROLS
          ========================================= */}
      <div className="flex flex-col gap-5 bg-neutral-900/50 backdrop-blur-md p-5 rounded-2xl border border-white/5">
        
        {/* Template Selector Grid */}
        <div>
          <label className="text-sm text-neutral-400 font-medium flex items-center gap-2 mb-3">
            <ImageIcon className="w-4 h-4" /> Pick a Design
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-[180px] overflow-y-auto pr-2 pb-2 custom-scrollbar">
            {TEMPLATES.map((bgPath, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedBg(bgPath);
                  setIsFlipped(false); // Auto-flip to front when picking a picture
                }}
                className={`w-full aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  selectedBg === bgPath ? "border-orange-500 scale-105 shadow-[0_0_15px_rgba(249,115,22,0.4)] z-10" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={bgPath} alt={`Template ${idx}`} className="w-full h-full object-cover bg-neutral-800" />
              </button>
            ))}
          </div>
        </div>

        <div className="h-px w-full bg-white/10 my-1" />

        {/* Text Inputs */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-neutral-400 font-medium mb-1.5 block uppercase tracking-wider">To</label>
              <input
                type="text"
                value={toName}
                onChange={(e) => setToName(e.target.value)}
                onFocus={() => setIsFlipped(true)} // Auto-flip to back when typing
                className="w-full rounded-xl bg-neutral-950 border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors placeholder:text-neutral-600"
                placeholder="Recipient name"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400 font-medium mb-1.5 block uppercase tracking-wider">From</label>
              <input
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                onFocus={() => setIsFlipped(true)} // Auto-flip to back when typing
                className="w-full rounded-xl bg-neutral-950 border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors placeholder:text-neutral-600"
                placeholder="Your name"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-neutral-400 font-medium mb-1.5 block uppercase tracking-wider">Greeting</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={() => setIsFlipped(true)} // Auto-flip to back when typing
              rows={3}
              className="w-full resize-none rounded-xl bg-neutral-950 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-all placeholder:text-neutral-600"
              placeholder="Write a beautiful Vesak wish..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-2">
          
          {/* Primary Share Button */}
          <button
            onClick={handleShare}
            disabled={isSaving || !message}
            className="w-full rounded-xl py-3.5 font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            <Share2 className="w-5 h-5" />
            {isSaving ? "Crafting..." : "Save & Share"}
          </button>

          {/* Secondary Save Button */}
          <button
            onClick={handleSaveOnly}
            disabled={isSaving || !message}
            className="w-full rounded-xl py-3.5 font-bold bg-neutral-800 hover:bg-neutral-700 text-white border border-white/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            <Save className="w-5 h-5" />
            {isSaving ? "Crafting..." : "Post to Feed Only"}
          </button>
          
        </div>

      </div>
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}