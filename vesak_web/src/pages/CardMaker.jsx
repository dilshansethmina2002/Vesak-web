import { useState } from "react";
import { Share2, Image as ImageIcon, RotateCw, User, PenLine, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LoginModal from "../components/auth/LoginModal";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../context/AlertContext";

// Shadcn Carousel Imports
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";

const PRESET_MESSAGES = [
  "සිත පිබිදෙනවා, පහන් දැල්වෙනවා,\nඔබගේ පවුලට, සුබ වෙසක් වේවා!",
  "May the light of Vesak guide you on the path of peace and harmony.",
];

// The "AI" Brain (Premium Curated Wishes)
const ENGLISH_WISHES = [
  "May the radiant light of Vesak illuminate your path with peace, joy, and boundless compassion. Wishing you and your family a truly blessed Vesak.",
  "Just as the pure lotus blooms flawlessly above muddy waters, may your life flourish with clarity, wisdom, and inner peace this Vesak season.",
  "May the teachings of the Buddha guide you through times of darkness, and may the glow of the Vesak lanterns bring warmth to your home.",
  "Wishing you a season of reflection and tranquility. May the Dhamma guide your steps and bring harmony to your heart this Vesak.",
  "As the world glows with Vesak lanterns, may your mind be filled with the brilliant light of mindfulness and loving-kindness.",
  "May the supreme blessings of the Triple Gem shower upon you and your loved ones, bringing health, happiness, and spiritual wealth.",
  "Let the peace of the Buddha's teachings resonate within you today and always. Have a serene and beautiful Vesak Poya.",
  "May you find the strength to let go of attachments and the wisdom to embrace the present moment. A very happy and mindful Vesak to you."
];

// Premium Sinhala Wishes
const SINHALA_WISHES = [
  "පහන් ආලෝකයෙන් සිතත්, මෙත් සිතින් ලොවත් ආලෝකමත් වන උතුම් වෙසක් මංගල්‍යයක් වේවා! ඔබගේ නිවසට සාමය සහ සතුට උදාවේවා.",
  "බුදුරජාණන් වහන්සේගේ අනන්ත ගුණ කඳ සිහිපත් කරමින්, ඔබගේත් ඔබ පවුලේ සැමගේත් ජීවිතය ආලෝකමත් වන සුබ වෙසක් මංගල්‍යයක් වේවා!",
  "මෙත් සිතින් සිත පුරවා, දන් පිනින් අත් සරසා, සැනසිල්ලේ ජීවත් වීමට හැකි වන උතුම් වෙසක් මංගල්‍යයක් වේවා!",
  "සම්මා සම්බුදු පියාණන් වහන්සේගේ නිර්මල දහම් ආලෝකයෙන් ඔබගේ ජීවිතය ඒකාලෝක වේවා! පින්බර වෙසක් මංගල්‍යයක් වේවා.",
  "පිබිදෙන නෙළුමක් සේ ඔබගේ සිතත් ප්‍රඥාවෙන් විකසිත වන, නිදුක් නිරෝගී සුවය පිරි සුබ වෙසක් දිනයක් වේවා!",
  "තෙරුවන් සරණින් ඔබගේ සියලු පැතුම් ඉටුවන, බෝධි සත්ත්ව ගුණ පිරි උතුම් වෙසක් පෝය දිනයක් වේවා.",
  "අවිද්‍යා අන්ධකාරය දුරු වී, ප්‍රඥාවේ ආලෝකය උදාවන අර්ථවත් වෙසක් මංගල්‍යයක් ඔබෙත් ඔබ පවුලේ සැමටත් උදාවේවා!",
  "දහම් අමා වැස්සෙන් සිත් සතන් නිවී සැනසෙන, කරුණාව හා මෛත්‍රිය පිරුණු පිංබර වෙසක් මංගල්‍යයක් වේවා."
];

const TEMPLATES = [
  "/cards/vesak9.png", "/cards/vesak12.png", "/cards/vesak13.png", "/cards/vesak8.png",
  "/cards/vesak5.png", "/cards/vesak10.png", "/cards/vesak11.png", "/cards/vesak6.png",
  "/cards/vesak7.png", "/cards/vesak14.png", "/cards/vesak15.png", "/cards/vesak16.png",
  "/cards/vesak17.png", "/cards/vesak18.png", "/cards/vesak19.png", "/cards/vesak20.png",
  "/cards/vesak21.png", "/cards/vesak22.png", "/cards/vesak23.png", "/cards/vesak24.png",
  "/cards/vesak25.png", "/cards/vesak26.png", "/cards/vesak27.png", "/cards/vesak28.png"
];

export default function CardMaker() {
  const { user } = useAuth();
  const { showAlert } = useAlert(); 
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [selectedBg, setSelectedBg] = useState(TEMPLATES[0]);
  
  const [isFlipped, setIsFlipped] = useState(false);
  const [toName, setToName] = useState("");
  const [message, setMessage] = useState(PRESET_MESSAGES[0]);
  const [fromName, setFromName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiLanguage, setAiLanguage] = useState("SIN"); // "SIN" or "EN"

  // ==========================================
  // THE AI WISH WEAVER (Typing Effect)
  // ==========================================
  const handleGenerateWish = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setMessage(""); // Clear the box

    // 1. Pick a random wish from the SELECTED language pool
    const pool = aiLanguage === "EN" ? ENGLISH_WISHES : SINHALA_WISHES;
    const selectedWish = pool[Math.floor(Math.random() * pool.length)];

    // 2. Simulate API thinking delay
    await new Promise(resolve => setTimeout(resolve, 600));

    // 3. The Magical Typing Effect
    let i = 0;
    setIsFlipped(true); 
    
    const typeInterval = setInterval(() => {
      setMessage(selectedWish.slice(0, i + 1));
      i++;
      if (i === selectedWish.length) {
        clearInterval(typeInterval);
        setIsGenerating(false);
      }
    }, 25); 
  };

  // ==========================================
  // CORE SAVE FUNCTION (Always Private Now!)
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
          from_name: finalFromName,
          is_public: false // Hardcoded to FALSE so these never hit the public feed!
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
  // THE SINGLE ACTION BUTTON
  // ==========================================
  const handleShare = async () => {
    const savedCard = await saveCardToDatabase(); 
    if (!savedCard) return; 

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
      showAlert("Card Saved!", "Your private card is ready.");
    }
    
    // Send them directly to view the stunning card they just made
    navigate(`/card/${savedCard.id}`);
  };

  return (
    <div className="max-w-md mx-auto flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">
      
      {/* =========================================
          0. NEW UI: PAGE HEADER
          ========================================= */}
      <div className="mb-8 mt-2 px-2 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-orange-500/10 rounded-full mb-4 ring-1 ring-orange-500/20">
          <Sparkles className="w-6 h-6 text-orange-400" />
        </div>
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300 drop-shadow-sm mb-2">
          Craft Your Wish
        </h2>
        <p className="text-neutral-400 text-sm leading-relaxed px-4">
          Design a personalized digital greeting to share privately with friends and family.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        {/* =========================================
            1. THE 3D FLIP CARD PREVIEW
            ========================================= */}
        <div 
          className="w-full aspect-[4/5] relative [perspective:1000px] cursor-pointer group"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Ambient Background Glow behind the card */}
          <div className="absolute inset-0 bg-orange-500/10 blur-[60px] rounded-full pointer-events-none" />

          {/* Tap Indicator */}
          <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 pointer-events-none ${
            isFlipped ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'
          }`}>
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-2xl">
              <RotateCw className="w-4 h-4 text-orange-400 animate-pulse" />
              <span className="text-xs font-bold tracking-widest text-white uppercase">Tap to Flip</span>
            </div>
          </div>

          {/* The 3D Wrapper */}
          <div className={`relative w-full h-full transition-all duration-700 ease-in-out [transform-style:preserve-3d] shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-3xl ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
            
            {/* FRONT FACE */}
            <div className="absolute inset-0 [backface-visibility:hidden] rounded-3xl overflow-hidden border border-white/10 bg-neutral-900">
              <img 
                src={selectedBg} 
                alt="Card Front" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => { e.target.style.display = 'none'; }} 
              />
            </div>

            {/* BACK FACE */}
            <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-3xl bg-[#F4F1EA] text-neutral-800 p-6 flex flex-col border border-white/20 shadow-inner overflow-hidden">
              <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/paper.png')]" />
              <div className="flex justify-between items-start border-b border-neutral-300 pb-4 mb-4 relative z-10">
                <div className="font-serif text-xl text-orange-950 truncate pr-4">
                  <span className="text-neutral-400 text-[10px] uppercase tracking-widest block mb-1 font-sans">To</span>
                  {toName || "..."}
                </div>
                <div className="w-12 h-14 shrink-0 border-2 border-dashed border-neutral-300 flex items-center justify-center p-1 opacity-70">
                  <span className="text-[8px] text-neutral-400 font-medium uppercase tracking-widest rotate-12 text-center">Stamp</span>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center font-serif text-lg text-center whitespace-pre-wrap px-2 leading-relaxed text-neutral-700 relative z-10">
                {message || "Write your beautiful Vesak wish here..."}
              </div>
              <div className="text-right border-t border-neutral-300 pt-4 mt-4 font-serif text-xl text-orange-950 relative z-10">
                <span className="text-neutral-400 text-[10px] uppercase tracking-widest block mb-1 font-sans">From</span>
                {fromName || user?.user_metadata?.full_name || "..."}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================
            2. THE STUDIO CONTROLS
            ========================================= */}
        <div className="flex flex-col gap-8">
          
          {/* Artwork Strip (Large Thumbnails Edition) */}
          <div className="flex flex-col gap-4 w-full sm:px-8 relative">
            
            {/* Header & Mobile Swipe Instruction */}
            <div className="flex items-center justify-between px-2 sm:px-0">
              <label className="text-[10px] sm:text-xs text-neutral-400 font-bold flex items-center gap-2 tracking-widest uppercase">
                <ImageIcon className="w-4 h-4 text-orange-400" /> Choose Artwork
              </label>
              
              <span className="text-[10px] text-orange-500/80 font-bold tracking-widest uppercase flex items-center gap-1 animate-pulse sm:hidden">
                Swipe <span className="text-sm leading-none">&rarr;</span>
              </span>
            </div>
            
            {/* The Carousel */}
            <Carousel
              opts={{
                align: "start",
                dragFree: true, 
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-3 sm:-ml-4">
                {TEMPLATES.map((bgPath, idx) => (
                  <CarouselItem key={idx} className="pl-3 sm:pl-4 basis-[40%] sm:basis-1/3 md:basis-1/4">
                    <button
                      onClick={() => {
                        setSelectedBg(bgPath);
                        setIsFlipped(false); 
                      }}
                      className={`w-full aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                        selectedBg === bgPath 
                          ? "border-orange-500 scale-100 shadow-[0_0_20px_rgba(249,115,22,0.4)] z-10 ring-4 ring-orange-500/20" 
                          : "border-transparent opacity-60 hover:opacity-100 hover:scale-[0.98] scale-95"
                      }`}
                    >
                      <img src={bgPath} alt={`Template ${idx}`} className="w-full h-full object-cover bg-neutral-900" />
                    </button>
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              {/* Desktop Navigation Arrows */}
              <CarouselPrevious className="hidden sm:flex -left-4 border-white/10 bg-neutral-950/80 text-white hover:bg-black hover:text-orange-400" />
              <CarouselNext className="hidden sm:flex -right-4 border-white/10 bg-neutral-950/80 text-white hover:bg-black hover:text-orange-400" />
            </Carousel>

          </div>

          {/* Personalization Inputs */}
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-neutral-500 group-focus-within:text-orange-400 transition-colors" />
                </div>
                <input
                  type="text"
                  value={toName}
                  onChange={(e) => setToName(e.target.value)}
                  onFocus={() => setIsFlipped(true)} 
                  className="w-full rounded-2xl bg-white/[0.03] border border-white/10 pl-11 pr-4 py-4 text-sm text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.05] transition-all placeholder:text-neutral-600 shadow-inner"
                  placeholder="To (e.g. Mom)"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-neutral-500 group-focus-within:text-orange-400 transition-colors" />
                </div>
                <input
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  onFocus={() => setIsFlipped(true)} 
                  className="w-full rounded-2xl bg-white/[0.03] border border-white/10 pl-11 pr-4 py-4 text-sm text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.05] transition-all placeholder:text-neutral-600 shadow-inner"
                  placeholder="From (You)"
                />
              </div>
            </div>

            <div className="relative group">
              <div className="absolute top-4 left-0 pl-4 pointer-events-none">
                <PenLine className="w-4 h-4 text-neutral-500 group-focus-within:text-orange-400 transition-colors" />
              </div>
              
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={() => setIsFlipped(true)} 
                rows={4}
                className="w-full resize-none rounded-2xl bg-white/[0.03] border border-white/10 pl-11 pr-32 py-4 text-sm text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.05] transition-all placeholder:text-neutral-600 shadow-inner"
                placeholder="Write your beautiful wish here..."
              />

              {/* Ultra-Premium AI Controls (Language Toggle + Sparkles) */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 p-1 rounded-xl bg-black/40 backdrop-blur-md border border-white/5 shadow-lg">
                
                {/* Language Toggle Switch */}
                <div className="flex items-center bg-white/5 rounded-lg p-0.5">
                  <button
                    onClick={() => setAiLanguage("EN")}
                    disabled={isGenerating}
                    className={`px-2 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                      aiLanguage === "EN" 
                        ? 'bg-orange-500/80 text-white shadow-sm' 
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setAiLanguage("SIN")}
                    disabled={isGenerating}
                    className={`px-2 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                      aiLanguage === "SIN" 
                        ? 'bg-orange-500/80 text-white shadow-sm' 
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    සිං
                  </button>
                </div>

                {/* The Sparkles Button */}
                <button
                  onClick={handleGenerateWish}
                  disabled={isGenerating}
                  title="Weave a Wish"
                  className={`p-2 rounded-lg transition-all duration-300 flex items-center justify-center ${
                    isGenerating 
                      ? 'text-orange-400 cursor-wait' 
                      : 'text-neutral-300 hover:text-orange-400 hover:bg-orange-500/20 active:scale-95'
                  }`}
                >
                  <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-pulse' : ''}`} />
                </button>
              </div>
              
              {/* AI Loading Text */}
              {isGenerating && (
                <div className="absolute bottom-3 right-4 text-[10px] font-bold text-orange-500/70 tracking-widest uppercase animate-pulse">
                  Weaving...
                </div>
              )}
            </div>
          </div>

          {/* =========================================
              3. THE FINAL CTA
              ========================================= */}
          <button
            onClick={handleShare}
            disabled={isSaving || !message}
            className="group w-full rounded-2xl py-4 mt-2 font-bold text-lg bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-neutral-950 shadow-[0_8px_30px_rgba(249,115,22,0.3)] flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            <Share2 className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
            {isSaving ? "Crafting your link..." : "Create Shareable Link"}
          </button>

        </div>
      </div>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}