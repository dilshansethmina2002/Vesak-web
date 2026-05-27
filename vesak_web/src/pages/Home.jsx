import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PostCard from "../components/post/PostCard";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeed() {
      try {
        // Fetch posts from newest to oldest
        const { data, error } = await supabase
          .from("vesak_cards")
          .select("*")
          .eq("is_public", true)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPosts(data || []);
      } catch (error) {
        console.error("Error fetching feed:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFeed();
  }, []);

  return (
    // 👇 We added the smooth animation classes right here on the main wrapper!
    <div className="max-w-md mx-auto pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both">
      
      {/* Page Header */}
      <div className="mb-6 mt-2 px-2">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">
          Global Lightstream
        </h2>
        <p className="text-neutral-400 text-sm mt-1">See the wishes created around the world.</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-32 text-orange-500 gap-4 animate-in fade-in duration-500">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm font-medium text-neutral-400">Loading cards...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-20 border border-white/5 rounded-3xl bg-neutral-900/30 px-6 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-500">
          <h3 className="text-lg font-medium text-white mb-2">No cards yet</h3>
          <p className="text-neutral-400 text-sm">Be the first to create and share a beautiful Vesak greeting!</p>
        </div>
      )}

      {/* The Feed */}
      {!loading && posts.length > 0 && (
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}