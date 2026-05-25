import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import PostCard from "../components/post/PostCard";

export default function ViewCard() {
  const { id } = useParams(); // Grabs the ID from the URL
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCard() {
      try {
        const { data, error } = await supabase
          .from("vesak_cards")
          .select("*")
          .eq("id", id)
          .single(); // Get exactly one row

        if (error) throw error;
        setPost(data);
      } catch (err) {
        console.error("Error fetching card:", err);
        setError("This card could not be found. It may have been deleted.");
      } finally {
        setLoading(false);
      }
    }

    fetchCard();
  }, [id]);

  return (
    <div className="max-w-md mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Navigation Bar */}
      <div className="flex items-center gap-4 mb-6">
        <Link 
          to="/" 
          className="p-2 bg-neutral-900 border border-white/10 hover:bg-white/10 rounded-full transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
        </Link>
        <h2 className="text-xl font-bold text-white">Vesak Greeting</h2>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4 bg-neutral-900/30 rounded-3xl border border-white/5">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <p className="text-neutral-500 text-sm">Opening card...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-neutral-900/50 rounded-3xl border border-white/10 p-8">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">?</span>
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Card Unavailable</h3>
          <p className="text-neutral-400 mb-6">{error}</p>
          <Link to="/" className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors">
            Return to Feed
          </Link>
        </div>
      ) : (
        <div className="animate-in zoom-in-95 duration-500">
          <PostCard post={post} />
        </div>
      )}
      
    </div>
  );
}