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
  const { showAlert } = useAlert(); 
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
  const saveCardToDatabase = async (isPublic) => {
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
          from_name: finalFromName,
          is_public: isPublic // Tells the database if it should hide it from the Feed!
        }])
        .select()
        .single();

      if (error) throw error;
      return data; 
      
    } catch (error) {
      console.error(error);
      showAlert("Crafting Failed", "We couldn't save your card right now. Please try again.");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================
  // BUTTON 1: SAVE & SHARE (Private)
  // ==========================================
  // ==========================================
  // BUTTON 1: SAVE & SHARE (Private)
  // ==========================================
  const handleShare = async () => {
    const savedCard = await saveCardToDatabase(false); // FALSE = Private Card
    if (!savedCard) return; 

    const cardUrl = `${window.location.origin}/card/${savedCard.id}`;
    const shareTitle = `Vesak Greeting from ${savedCard.from_name}`;
    const shareText = `මම ඔයාට ලස්සන වෙසක් පතක් හැදුවා! මෙතනින් බලන්න: `;

    try {
      if (navigator.share) {
        await navigator.share({ title: shareTitle, text: shareText, url: cardUrl });
        showAlert("Shared Successfully", "Your private card is out in the world!");
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${cardUrl}`);
        showAlert("Link Copied!", "Private link copied to your clipboard. Paste it anywhere to share!");
      }
    } catch (shareError) {
      console.log("Share menu closed by user.");
      showAlert("Card Saved!", "Your private card is ready.");
    }

    // THE FIX IS HERE 👇
    // Instead of navigate("/"), we send you straight to your new private card!
    navigate(`/card/${savedCard.id}`);
  };

  // ==========================================
  // BUTTON 2: JUST SAVE TO FEED (Public)
  // ==========================================
  const handleSaveOnly = async () => {
    const savedCard = await saveCardToDatabase(true); // TRUE = Public Card
    if (!savedCard) return;

    showAlert("Card Added!", "Your beautiful card is now on the community feed.");
    navigate("/");
  };

  return (
    <div className="max-w-md mx-auto flex flex-col gap-6 animate-in fade-in duration-500 pb-24">
      
      {/* =========================================
          1. THE 3D FLIP CARD PREVIEW
          ========================================= */}
      <div 
        className="w-full aspect-[4/5] relative [perspective:1000px] cursor-pointer group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Animated Tap Indicator (Ultra-Glass Edition) */}
        <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 pointer-events-none ${
          isFlipped ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'
        }`}>
          <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full pointer-events-none" />
          <div className="relative flex items-center gap-2 bg-white/[0.08] backdrop-blur-[40px] saturate-[2.5] px-5 py-2.5 rounded-full shadow-[0_8px_32px_0_rgba(0,0,0,0.36),inset_0_1px_2px_rgba(255,255,255,0.2)] border border-white/10">
            <div className="relative flex items-center justify-center">
              <span className="absolute inline-flex w-8 h-8 rounded-full bg-orange-500 opacity-40 animate-ping" />
              <RotateCw className="relative inline-flex w-4 h-4 text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
            </div>
            <span className="text-xs font-bold tracking-widest text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Tap to Flip
            </span>
          </div>
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
            
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/paper.png')]" />

            <div className="flex justify-between items-start border-b border-neutral-400/40 pb-4 mb-4 relative z-10">
              <div className="font-serif text-xl text-orange-950 truncate pr-4">
                <span className="text-neutral-500 text-xs uppercase tracking-widest block mb-1">To</span>
                {toName || "..."}
              </div>
              <div className="w-14 h-16 shrink-0 border-2 border-dashed border-neutral-400/60 flex items-center justify-center p-1">
                <span className="text-[10px] text-neutral-400/80 font-medium uppercase tracking-widest rotate-12 text-center">Stamp<br/>Here</span>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center font-serif text-lg text-center whitespace-pre-wrap px-2 leading-relaxed text-neutral-800 relative z-10">
              {message || "Write your beautiful Vesak wish here..."}
            </div>

            <div className="text-right border-t border-neutral-400/40 pt-4 mt-4 font-serif text-xl text-orange-950 relative z-10">
              <span className="text-neutral-500 text-xs uppercase tracking-widest block mb-1">From</span>
              {fromName || user?.user_metadata?.full_name || "..."}
            </div>
          </div>

        </div>
      </div>

      {/* =========================================
          2. THE STUDIO CONTROLS (Ultra Glass Edition)
          ========================================= */}
      <div className="flex flex-col gap-6 bg-white/[0.03] backdrop-blur-[40px] saturate-[2.5] p-6 rounded-3xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] relative overflow-hidden">
        
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Template Selector Grid */}
        <div>
          <label className="text-sm text-neutral-300 font-bold flex items-center gap-2 mb-3 tracking-wide uppercase">
            <ImageIcon className="w-4 h-4 text-orange-400" /> Pick a Design
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-[180px] overflow-y-auto pr-2 pb-2 custom-scrollbar">
            {TEMPLATES.map((bgPath, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedBg(bgPath);
                  setIsFlipped(false); 
                }}
                className={`w-full aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  selectedBg === bgPath 
                    ? "border-orange-500 scale-105 shadow-[0_0_20px_rgba(249,115,22,0.5)] z-10" 
                    : "border-transparent opacity-50 hover:opacity-100 hover:scale-95"
                }`}
              >
                <img src={bgPath} alt={`Template ${idx}`} className="w-full h-full object-cover bg-black/50" />
              </button>
            ))}
          </div>
        </div>

        <div className="h-px w-full bg-white/5 my-1" />

        {/* Text Inputs (Deep Glass Effect) */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-neutral-400 font-bold mb-1.5 block uppercase tracking-widest pl-1">To</label>
              <input
                type="text"
                value={toName}
                onChange={(e) => setToName(e.target.value)}
                onFocus={() => setIsFlipped(true)} 
                className="w-full rounded-xl bg-black/20 backdrop-blur-md border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 focus:bg-black/40 transition-all placeholder:text-neutral-600 shadow-inner"
                placeholder="Recipient name"
              />
            </div>
            <div>
              <label className="text-[10px] text-neutral-400 font-bold mb-1.5 block uppercase tracking-widest pl-1">From</label>
              <input
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                onFocus={() => setIsFlipped(true)} 
                className="w-full rounded-xl bg-black/20 backdrop-blur-md border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 focus:bg-black/40 transition-all placeholder:text-neutral-600 shadow-inner"
                placeholder="Your name"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-neutral-400 font-bold mb-1.5 block uppercase tracking-widest pl-1">Greeting</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={() => setIsFlipped(true)} 
              rows={3}
              className="w-full resize-none rounded-xl bg-black/20 backdrop-blur-md border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 focus:bg-black/40 transition-all placeholder:text-neutral-600 shadow-inner"
              placeholder="Write a beautiful Vesak wish..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-2">
          
          <button
            onClick={handleShare}
            disabled={isSaving || !message}
            className="w-full rounded-xl py-4 font-bold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            <Share2 className="w-5 h-5" />
            {isSaving ? "Crafting..." : "Save & Share (Private)"}
          </button>

          <button
            onClick={handleSaveOnly}
            disabled={isSaving || !message}
            className="w-full rounded-xl py-3.5 font-bold bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-[0_4px_15px_rgba(0,0,0,0.1)]"
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