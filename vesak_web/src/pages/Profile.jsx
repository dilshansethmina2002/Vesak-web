import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import PostCard from "../components/post/PostCard";
import LoginModal from "../components/auth/LoginModal";
import { Loader2, LogOut, User as UserIcon, Edit2, Check, X as CloseIcon } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const [myCards, setMyCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  // Name Editing State
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  // Figure out their current display name
  const currentName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Anonymous";

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setNewName(currentName);

    async function fetchMyCards() {
      try {
        const { data, error } = await supabase
          .from("vesak_cards")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setMyCards(data || []);
      } catch (error) {
        console.error("Error fetching my cards:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMyCards();
  }, [user, currentName]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleUpdateName = async () => {
    const trimmedName = newName.trim();
    
    // Validation
    if (!trimmedName || trimmedName === currentName) {
      setIsEditingName(false);
      return;
    }
    
    if (trimmedName.length > 24) {
      alert("Name is too long! Please keep it under 24 characters.");
      return;
    }

    setIsSavingName(true);
    try {
      // 1. Update Supabase Auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: trimmedName }
      });
      if (authError) throw authError;

      // 2. Update author_name on all past cards
      const { error: dbError } = await supabase
        .from('vesak_cards')
        .update({ author_name: trimmedName })
        .eq('user_id', user.id);
      if (dbError) throw dbError;

      // 3. Update UI
      setMyCards(prev => prev.map(card => ({ ...card, author_name: trimmedName })));
      setIsEditingName(false);
      
    } catch (error) {
      console.error("Error updating name:", error);
      alert("Failed to update name.");
    } finally {
      setIsSavingName(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center justify-center py-32 px-4 text-center animate-in fade-in">
        <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-6 border border-white/10">
          <UserIcon className="w-10 h-10 text-neutral-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Your Profile</h2>
        <p className="text-neutral-400 text-sm mb-8">Sign in to view your saved Vesak cards and manage your account.</p>
        
        <button 
          onClick={() => setShowLogin(true)}
          className="w-full rounded-xl py-3.5 font-bold bg-white text-black hover:bg-neutral-200 transition-colors"
        >
          Sign In
        </button>

        <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto pb-20 animate-in fade-in">
      
      {/* 1. Profile Header */}
      <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6 mb-8 flex items-center justify-between mt-2">
        <div className="flex items-center gap-4 flex-1 pr-4">
          
          <div className="w-14 h-14 shrink-0 bg-gradient-to-tr from-orange-500 to-yellow-400 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">
              {currentName.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            {isEditingName ? (
              // EDIT MODE
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    maxLength={24}
                    className="w-full bg-neutral-950 border border-orange-500 rounded-lg px-2 py-1 text-white text-sm focus:outline-none"
                    autoFocus
                  />
                  <button onClick={handleUpdateName} disabled={isSavingName} className="p-1.5 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-colors">
                    {isSavingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setIsEditingName(false)} disabled={isSavingName} className="p-1.5 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                    <CloseIcon className="w-4 h-4" />
                  </button>
                </div>
                <span className={`text-[10px] text-right ${newName.length >= 24 ? 'text-red-500' : 'text-neutral-500'}`}>
                  {newName.length}/24 characters
                </span>
              </div>
            ) : (
              // VIEW MODE
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-white truncate">
                  {currentName}
                </h2>
                <button 
                  onClick={() => setIsEditingName(true)}
                  className="text-neutral-500 hover:text-orange-400 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-orange-400 text-sm font-medium">Lightstream Creator</p>
          </div>

        </div>

        <button 
          onClick={handleLogout}
          className="p-3 shrink-0 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors"
          title="Log Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* 2. My Cards Section */}
      <div className="mb-6 px-2">
        <h3 className="text-xl font-bold text-white">My Cards</h3>
        <p className="text-neutral-400 text-sm mt-1">Cards you have shared with the world.</p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-10 text-orange-500 gap-3">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      )}

      {!loading && myCards.length === 0 && (
        <div className="text-center py-16 border border-white/5 rounded-2xl bg-neutral-900/30 px-6">
          <h3 className="text-lg font-medium text-white mb-2">No cards crafted yet</h3>
          <p className="text-neutral-400 text-sm mb-6">Head over to the studio to create your first beautiful greeting.</p>
          <a 
            href="/create" 
            className="inline-block rounded-xl px-6 py-3 font-medium bg-orange-500 hover:bg-orange-600 text-white transition-colors"
          >
            Create a Card
          </a>
        </div>
      )}

      {!loading && myCards.length > 0 && (
        <div className="flex flex-col gap-2">
          {myCards.map((card) => (
            <PostCard key={card.id} post={card} />
          ))}
        </div>
      )}

    </div>
  );
}