import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Trash2, ShieldAlert, Users, Activity, CreditCard, LayoutDashboard } from "lucide-react";
import { useAlert } from "../context/AlertContext";

// REPLACE THIS WITH YOUR EXACT SUPABASE LOGIN EMAIL
const ADMIN_EMAIL = "sethminadilshan@gmail.com"; 

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalCards: 0, publicCards: 0 });

  useEffect(() => {
    // 1. Kick out anyone who isn't the admin
    if (!user || user.email !== ADMIN_EMAIL) {
      navigate("/");
      return;
    }

    fetchAdminData();
  }, [user, navigate]);

  const fetchAdminData = async () => {
    try {
      const { data, error } = await supabase
        .from("vesak_cards")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Calculate Stats
      const uniqueUsers = new Set(data.map(card => card.user_id)).size;
      const publicCount = data.filter(card => card.is_public).length;

      setStats({
        totalUsers: uniqueUsers,
        totalCards: data.length,
        publicCards: publicCount
      });
      
      setCards(data);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      showAlert("Error", "Could not load admin data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this card?")) return;

    try {
      const { error } = await supabase.from("vesak_cards").delete().eq("id", id);
      if (error) throw error;
      
      setCards(cards.filter(card => card.id !== id));
      showAlert("Deleted", "The card has been removed from the platform.");
    } catch (error) {
      console.error("Delete failed:", error);
      showAlert("Error", "Failed to delete the card.");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen w-full bg-neutral-950 text-orange-500 animate-pulse font-bold tracking-widest text-2xl">INITIALIZING COMMAND CENTER...</div>;
  }

  return (
    // Full screen wrapper: Takes up min 100vh, spans full width, uses dark background
    <div className="min-h-screen w-full bg-neutral-950 text-white p-12 flex flex-col gap-10 animate-in fade-in duration-700 font-sans">
      
      {/* Header - Full Width */}
      <div className="flex items-center justify-between border-b border-white/10 pb-8">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-500 tracking-wide mb-1">
              Command Center
            </h1>
            <p className="text-neutral-400 text-lg flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" /> Platform Moderation & Global Analytics
            </p>
          </div>
        </div>
        
        {/* Admin Badge */}
        <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-full flex items-center gap-3 backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-bold uppercase tracking-widest text-neutral-300">System Admin Online</span>
        </div>
      </div>

      {/* Analytics Widgets - Forced 3 Column Desktop Grid */}
      <div className="grid grid-cols-3 gap-8">
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 flex flex-col gap-4 shadow-xl backdrop-blur-md hover:bg-white/[0.04] transition-colors">
          <div className="flex items-center gap-3 text-neutral-400 text-sm font-bold uppercase tracking-widest">
            <div className="p-2 bg-blue-500/10 rounded-lg"><Users className="w-5 h-5 text-blue-400" /></div>
            Total Active Users
          </div>
          <span className="text-6xl font-black text-white">{stats.totalUsers}</span>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 flex flex-col gap-4 shadow-xl backdrop-blur-md hover:bg-white/[0.04] transition-colors">
          <div className="flex items-center gap-3 text-neutral-400 text-sm font-bold uppercase tracking-widest">
            <div className="p-2 bg-orange-500/10 rounded-lg"><CreditCard className="w-5 h-5 text-orange-400" /></div>
            Total Cards Crafted
          </div>
          <span className="text-6xl font-black text-white">{stats.totalCards}</span>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 flex flex-col gap-4 shadow-xl backdrop-blur-md hover:bg-white/[0.04] transition-colors">
          <div className="flex items-center gap-3 text-neutral-400 text-sm font-bold uppercase tracking-widest">
            <div className="p-2 bg-green-500/10 rounded-lg"><Activity className="w-5 h-5 text-green-400" /></div>
            Public Feed Entries
          </div>
          <span className="text-6xl font-black text-white">{stats.publicCards}</span>
        </div>
      </div>

      {/* Full Width Data Table */}
      <div className="flex-1 bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl flex flex-col">
        <div className="px-8 py-6 border-b border-white/10 bg-black/40 flex justify-between items-center">
          <h3 className="text-base font-bold text-white uppercase tracking-widest">Global Activity Log</h3>
          <span className="text-sm font-medium text-neutral-500">Showing all records ({cards.length})</span>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          <table className="w-full text-left text-base text-neutral-300">
            <thead className="text-sm uppercase bg-white/5 text-neutral-400 sticky top-0 backdrop-blur-md z-10">
              <tr>
                <th className="px-8 py-5 font-bold rounded-tl-xl">Artwork</th>
                <th className="px-8 py-5 font-bold">Author</th>
                <th className="px-8 py-5 font-bold">Recipient</th>
                <th className="px-8 py-5 font-bold w-1/3">Message Content</th>
                <th className="px-8 py-5 font-bold text-center">Status</th>
                <th className="px-8 py-5 font-bold text-right rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card) => (
                <tr key={card.id} className="border-b border-white/5 hover:bg-white/[0.04] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 shadow-lg group-hover:scale-105 transition-transform">
                      <img src={card.bg_url} alt="card bg" className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="px-8 py-6 font-bold text-white">{card.author_name}</td>
                  <td className="px-8 py-6 text-neutral-400">{card.to_name || "N/A"}</td>
                  <td className="px-8 py-6 max-w-md pr-12 text-neutral-300 italic">"{card.message}"</td>
                  <td className="px-8 py-6 text-center">
                    {card.is_public ? (
                      <span className="inline-block px-4 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-xs font-bold uppercase tracking-wider border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">Public</span>
                    ) : (
                      <span className="inline-block px-4 py-1.5 bg-neutral-500/10 text-neutral-400 rounded-lg text-xs font-bold uppercase tracking-wider border border-white/10">Private</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => handleDelete(card.id)}
                      title="Permanently Delete Card"
                      className="inline-flex p-3 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 rounded-xl transition-all border border-red-500/20 shadow-lg active:scale-95"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {cards.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-neutral-500 gap-4">
              <ShieldAlert className="w-12 h-12 opacity-20" />
              <p className="text-lg">No cards exist in the database yet.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}