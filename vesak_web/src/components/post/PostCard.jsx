import { useState, useEffect } from "react";
import { Share2, MessageCircle, Send, Loader2, Flower2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

export default function PostCard({ post }) {
  const { user } = useAuth();
  
  // Like (Lotus) State
  const [likedBy, setLikedBy] = useState(post.liked_by || []);
  const isLiked = user ? likedBy.includes(user.id) : false;
  const [showLotusAnimation, setShowLotusAnimation] = useState(false);

  // Comment State
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0); // Track the number of comments
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch comment count when the post loads
  useEffect(() => {
    async function fetchCommentCount() {
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('card_id', post.id);
        
      if (count !== null) setCommentCount(count);
    }
    fetchCommentCount();
  }, [post.id]);

  // ==========================================
  // LIKE LOGIC
  // ==========================================
  const handleLike = async () => {
    if (!user) {
      alert("Please log in to like cards!");
      return;
    }

    const newLikedBy = isLiked
      ? likedBy.filter((id) => id !== user.id)
      : [...likedBy, user.id];

    setLikedBy(newLikedBy);

    try {
      const { error } = await supabase
        .from("vesak_cards")
        .update({ liked_by: newLikedBy })
        .eq("id", post.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating like:", error);
      setLikedBy(likedBy); 
    }
  };

  const handleDoubleTap = () => {
    if (!user) {
      alert("Please log in to like cards!");
      return;
    }
    
    if (!isLiked) {
      handleLike();
    }
    
    setShowLotusAnimation(true);
    setTimeout(() => setShowLotusAnimation(false), 1000);
  };

  // ==========================================
  // COMMENT LOGIC
  // ==========================================
  const toggleComments = async () => {
    setShowComments(!showComments);
    
    if (!showComments && comments.length === 0) {
      setLoadingComments(true);
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("card_id", post.id)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setComments(data);
      }
      setLoadingComments(false);
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to comment!");
      return;
    }
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    const currentName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Anonymous";

    try {
      const { data, error } = await supabase
        .from("comments")
        .insert([{
          card_id: post.id,
          user_id: user.id,
          author_name: currentName,
          content: newComment.trim(),
        }])
        .select()
        .single();

      if (error) throw error;
      
      setComments([...comments, data]);
      setCommentCount((prev) => prev + 1); // Instantly update the counter!
      setNewComment(""); 
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/card/${post.id}`;
    const text = encodeURIComponent(`මම ඔයාට ලස්සන වෙසක් පතක් හැදුවා! මෙතනින් බලන්න: \n${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="bg-neutral-900/50 border border-white/10 rounded-2xl overflow-hidden mb-8 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Header */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-yellow-400 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-lg">
            {(post.author_name || "A").charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="text-white font-medium text-sm">
            {post.author_name || "Anonymous Soul"}
          </h3>
          <p className="text-neutral-500 text-xs">
            {new Date(post.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* 2. The Card (With Double Tap) */}
      <div 
        onDoubleClick={handleDoubleTap}
        className="w-full aspect-[4/5] relative flex items-center justify-center p-8 text-center bg-neutral-800 select-none cursor-pointer"
      >
        <img 
          src={post.bg_url} 
          alt="Vesak Card" 
          className="absolute inset-0 w-full h-full object-cover z-0"
          onError={(e) => { e.target.style.display = 'none'; }} 
        />
        <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />
        
        <p className="text-white text-xl md:text-2xl font-medium whitespace-pre-wrap drop-shadow-lg z-20 leading-relaxed pointer-events-none">
          {post.message}
        </p>

        {/* Double Tap Lotus Animation */}
        {showLotusAnimation && (
          <div className="absolute inset-0 z-30 flex items-center justify-center animate-in zoom-in duration-300 fade-out pointer-events-none">
            <Flower2 className="w-32 h-32 text-orange-400 fill-orange-500/50 drop-shadow-[0_0_30px_rgba(249,115,22,0.8)] opacity-90" />
          </div>
        )}
      </div>

      {/* 3. Footer Actions */}
      <div className="p-4 flex items-center gap-5">
        <button 
          onClick={handleLike} 
          className="flex items-center gap-2 text-neutral-400 hover:text-orange-500 transition-colors group"
        >
          {/* Changed Heart to Flower2 (Lotus) and styling to Orange */}
          <Flower2 className={`w-6 h-6 transition-all active:scale-90 ${isLiked ? "fill-orange-500 text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.6)]" : "group-hover:text-orange-500"}`} />
          <span className="text-sm font-medium">{likedBy.length > 0 && likedBy.length}</span>
        </button>
        
        <button 
          onClick={toggleComments}
          className={`flex items-center gap-2 transition-colors group ${showComments ? "text-orange-500" : "text-neutral-400 hover:text-orange-500"}`}
        >
          <MessageCircle className="w-6 h-6 active:scale-90 transition-transform" />
          {/* Display the number of comments here! */}
          <span className="text-sm font-medium">{commentCount > 0 && commentCount}</span>
        </button>

        <button 
          onClick={handleShare}
          className="flex items-center gap-2 text-neutral-400 hover:text-green-500 transition-colors group ml-auto"
        >
          <Share2 className="w-6 h-6 active:scale-90 transition-transform" />
        </button>
      </div>

      {/* 4. Comments Section */}
      {showComments && (
        <div className="px-4 pb-4 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="h-px w-full bg-white/10 mb-4" />
          
          <div className="max-h-48 overflow-y-auto hide-scrollbar flex flex-col gap-3 mb-4">
            {loadingComments ? (
              <Loader2 className="w-5 h-5 animate-spin text-orange-500 mx-auto my-2" />
            ) : comments.length === 0 ? (
              <p className="text-xs text-neutral-500 text-center py-2">No comments yet. Be the first!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="text-sm">
                  <span className="font-bold text-orange-400 mr-2">{comment.author_name}</span>
                  <span className="text-neutral-300">{comment.content}</span>
                </div>
              ))
            )}
          </div>

          <form onSubmit={submitComment} className="flex items-center gap-2">
            <input 
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-neutral-950 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors placeholder:text-neutral-600"
            />
            <button 
              type="submit" 
              disabled={isSubmitting || !newComment.trim()}
              className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:opacity-50 transition-colors shrink-0"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}