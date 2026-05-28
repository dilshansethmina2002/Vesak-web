import { useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  Trash2, ShieldAlert, Users, Activity, CreditCard, 
  LayoutDashboard, Search, Filter, ArrowUpDown, Download 
} from "lucide-react";
import { useAlert } from "../context/AlertContext";

const ADMIN_EMAIL = "sethminadilshan@gmail.com"; 

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalCards: 0, publicCards: 0 });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest"); 

  useEffect(() => {
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
      // 1. We added .select() to force Supabase to confirm the deletion
      const { data, error } = await supabase
        .from("vesak_cards")
        .delete()
        .eq("id", id)
        .select(); 

      if (error) throw error;
      
      // 2. Catch the "Silent Fail" if RLS blocks the deletion
      if (!data || data.length === 0) {
        showAlert("Access Denied", "Database blocked deletion. Check your Supabase RLS policies.");
        return; // Stop here, do not remove it from the screen!
      }
      
      // 3. Only remove from screen if the database confirms it's gone
      setCards(cards.filter(card => card.id !== id));
      showAlert("Deleted", "The card has been removed from the platform.");
    } catch (error) {
      console.error("Delete failed:", error);
      showAlert("Error", "Failed to delete the card.");
    }
  };
  const filteredCards = useMemo(() => {
    return cards
      .filter((card) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          (card.author_name?.toLowerCase() || "").includes(searchLower) ||
          (card.to_name?.toLowerCase() || "").includes(searchLower) ||
          (card.message?.toLowerCase() || "").includes(searchLower);

        const matchesStatus = 
          statusFilter === "all" ? true :
          statusFilter === "public" ? card.is_public === true :
          card.is_public === false;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.created_at) - new Date(a.created_at);
        } else {
          return new Date(a.created_at) - new Date(b.created_at);
        }
      });
  }, [cards, searchTerm, statusFilter, sortBy]);

  const exportToCSV = () => {
    const headers = ["ID", "Created At", "Author", "Recipient", "Message", "Status"];
    const csvRows = filteredCards.map(c => [
      c.id,
      new Date(c.created_at).toLocaleString(),
      `"${c.author_name || ''}"`,
      `"${c.to_name || ''}"`,
      `"${c.message?.replace(/"/g, '""') || ''}"`, 
      c.is_public ? 'Public' : 'Private'
    ]);
    
    const csvContent = [headers.join(","), ...csvRows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Lumina_Export_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen w-full bg-neutral-950 text-orange-500 animate-pulse font-bold tracking-widest text-lg sm:text-2xl px-4 text-center">INITIALIZING COMMAND CENTER...</div>;
  }

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-white p-4 sm:p-8 lg:p-12 flex flex-col gap-6 lg:gap-8 animate-in fade-in duration-700 font-sans pb-24">
      
      {/* Header - Responsive Stacking */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-white/10 pb-6 gap-4">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="p-3 sm:p-4 bg-red-500/10 rounded-2xl border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)] shrink-0">
            <ShieldAlert className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-500 tracking-wide mb-1">
              Command Center
            </h1>
            <p className="text-neutral-400 text-xs sm:text-base flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 hidden sm:block" /> Platform Moderation
            </p>
          </div>
        </div>
        
        {/* Admin Badge */}
        <div className="self-start lg:self-auto px-4 sm:px-6 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-full flex items-center gap-3 backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-neutral-300">System Admin Online</span>
        </div>
      </div>

      {/* Analytics Widgets - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col gap-2 sm:gap-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3 text-neutral-400 text-xs sm:text-sm font-bold uppercase tracking-widest">
            <div className="p-2 bg-blue-500/10 rounded-lg"><Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" /></div>
            Total Active Users
          </div>
          <span className="text-4xl sm:text-6xl font-black text-white">{stats.totalUsers}</span>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col gap-2 sm:gap-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3 text-neutral-400 text-xs sm:text-sm font-bold uppercase tracking-widest">
            <div className="p-2 bg-orange-500/10 rounded-lg"><CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" /></div>
            Total Cards Crafted
          </div>
          <span className="text-4xl sm:text-6xl font-black text-white">{stats.totalCards}</span>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col gap-2 sm:gap-4 shadow-xl backdrop-blur-md sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 text-neutral-400 text-xs sm:text-sm font-bold uppercase tracking-widest">
            <div className="p-2 bg-green-500/10 rounded-lg"><Activity className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" /></div>
            Public Feed Entries
          </div>
          <span className="text-4xl sm:text-6xl font-black text-white">{stats.publicCards}</span>
        </div>
      </div>

      {/* Control Panel - Responsive Flex Wrap */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 bg-white/[0.02] border border-white/10 rounded-2xl p-4 backdrop-blur-md">
        
        {/* Search */}
        <div className="relative flex-1 min-w-0 xl:min-w-[250px] xl:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
          <input 
            type="text" 
            placeholder="Search author, recipient, or message..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm sm:text-base text-white focus:outline-none focus:border-orange-500/50 transition-colors"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex-1 sm:flex-none flex items-center bg-black/40 border border-white/10 rounded-xl px-2 sm:px-3 py-2.5 gap-2">
            <Filter className="w-4 h-4 text-neutral-500 shrink-0" />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs sm:text-sm text-white focus:outline-none cursor-pointer appearance-none outline-none w-full"
            >
              <option value="all" className="bg-neutral-900">All Statuses</option>
              <option value="public" className="bg-neutral-900">Public Only</option>
              <option value="private" className="bg-neutral-900">Private Only</option>
            </select>
          </div>

          <div className="flex-1 sm:flex-none flex items-center bg-black/40 border border-white/10 rounded-xl px-2 sm:px-3 py-2.5 gap-2">
            <ArrowUpDown className="w-4 h-4 text-neutral-500 shrink-0" />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs sm:text-sm text-white focus:outline-none cursor-pointer appearance-none outline-none w-full"
            >
              <option value="newest" className="bg-neutral-900">Newest First</option>
              <option value="oldest" className="bg-neutral-900">Oldest First</option>
            </select>
          </div>

          <button 
            onClick={exportToCSV}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm font-bold transition-all active:scale-95"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Responsive Data Table */}
      <div className="flex-1 bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl flex flex-col">
        <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-white/10 bg-black/40 flex justify-between items-center">
          <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-widest">Global Activity Log</h3>
          <span className="text-xs sm:text-sm font-medium text-neutral-500">
            {filteredCards.length} of {cards.length} records
          </span>
        </div>
        
        {/* The overflow-x-auto wrapper is what allows mobile scrolling! */}
        <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
          <table className="w-full text-left text-sm sm:text-base text-neutral-300 min-w-[800px]">
            <thead className="text-xs sm:text-sm uppercase bg-white/5 text-neutral-400 sticky top-0 backdrop-blur-md z-10">
              <tr>
                <th className="px-4 sm:px-8 py-4 sm:py-5 font-bold rounded-tl-xl">Artwork</th>
                <th className="px-4 sm:px-8 py-4 sm:py-5 font-bold">Author</th>
                <th className="px-4 sm:px-8 py-4 sm:py-5 font-bold">Recipient</th>
                <th className="px-4 sm:px-8 py-4 sm:py-5 font-bold w-1/3">Message Content</th>
                <th className="px-4 sm:px-8 py-4 sm:py-5 font-bold text-center">Status</th>
                <th className="px-4 sm:px-8 py-4 sm:py-5 font-bold text-right rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCards.map((card) => (
                <tr key={card.id} className="border-b border-white/5 hover:bg-white/[0.04] transition-colors group">
                  <td className="px-4 sm:px-8 py-4 sm:py-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-white/10 shadow-lg group-hover:scale-105 transition-transform">
                      <img src={card.bg_url} alt="card bg" className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="px-4 sm:px-8 py-4 sm:py-6 font-bold text-white whitespace-nowrap">{card.author_name}</td>
                  <td className="px-4 sm:px-8 py-4 sm:py-6 text-neutral-400 whitespace-nowrap">{card.to_name || "N/A"}</td>
                  <td className="px-4 sm:px-8 py-4 sm:py-6 max-w-xs sm:max-w-md pr-6 sm:pr-12 text-neutral-300 italic truncate">"{card.message}"</td>
                  <td className="px-4 sm:px-8 py-4 sm:py-6 text-center">
                    {card.is_public ? (
                      <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 bg-green-500/10 text-green-400 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">Public</span>
                    ) : (
                      <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 bg-neutral-500/10 text-neutral-400 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-white/10">Private</span>
                    )}
                  </td>
                  <td className="px-4 sm:px-8 py-4 sm:py-6 text-right">
                    <button 
                      onClick={() => handleDelete(card.id)}
                      title="Permanently Delete Card"
                      className="inline-flex p-2 sm:p-3 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 rounded-xl transition-all border border-red-500/20 shadow-lg active:scale-95"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredCards.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 sm:py-32 text-neutral-500 gap-4">
              <Search className="w-10 h-10 sm:w-12 sm:h-12 opacity-20" />
              <p className="text-base sm:text-lg">No records match your filters.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}