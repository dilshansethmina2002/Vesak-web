import { useState, useEffect } from "react";
import { Share2, MessageCircle, Send, Loader2, Flower2, Trash2, RotateCw } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { useAlert } from "../../context/AlertContext";

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const { showAlert } = useAlert();

  // Flip State
  const [isFlipped, setIsFlipped] = useState(false);

  // Like (Lotus) State
  const [likedBy, setLikedBy] = useState(post.liked_by || []);
  const isLiked = user ? likedBy.includes(user.id) : false;
  const [showLotusAnimation, setShowLotusAnimation] = useState(false);

  // Comment State
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  // INTERACTION LOGIC
  // ==========================================
  const handleLike = async () => {
    if (!user) {
      showAlert("Authentication Required", "Please log in to like cards!", true);
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

  const handleDoubleTap = (e) => {
    e.stopPropagation(); // Stop the single click from registering weirdly
    if (!user) {
      showAlert("Authentication Required", "Please log in to like cards!", true);
      return;
    }
    
    if (!isLiked) handleLike();
    
    setShowLotusAnimation(true);
    setTimeout(() => setShowLotusAnimation(false), 1000);
  };

 const handleDelete = () => {
    // Stop the card from flipping when you click the trash icon
    event?.stopPropagation(); 

    // Use our beautiful new confirmation alert
    showAlert(
      "Delete Card",
      "Are you sure you want to delete this beautiful Vesak greeting? This cannot be undone.",
      false, // showLoginBtn is false
      async () => {
        // This code only runs IF they click "Delete" in the dialog
        try {
          const { error } = await supabase
            .from("vesak_cards")
            .delete()
            .eq("id", post.id)
            .eq("user_id", user.id);

          if (error) throw error;
          
          if (onDelete) {
            onDelete(post.id);
          } else {
            window.location.reload();
          }
        } catch (error) {
          console.error("Error deleting post:", error);
          showAlert("Delete Failed", "We could not delete this post right now.");
        }
      },
      "Delete" // The text for the confirm button
    );
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

      if (!error && data) setComments(data);
      setLoadingComments(false);
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!user) {
      showAlert("Authentication Required", "Please log in to comment!", true);
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
      setCommentCount((prev) => prev + 1);
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
        <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-yellow-400 rounded-full flex items-center justify-center shadow-lg shrink-0">
          <span className="text-white font-bold text-lg">
            {(post.author_name || "A").charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium text-sm truncate">
            {post.author_name || "Anonymous Soul"}
          </h3>
          <p className="text-neutral-500 text-xs">
            {new Date(post.created_at).toLocaleDateString()}
          </p>
        </div>
        
        {user?.id === post.user_id && (
          <button 
            onClick={handleDelete}
            className="p-2 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors shrink-0"
            title="Delete Post"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. THE 3D FLIP CARD */}
      <div 
        className="w-full aspect-[4/5] relative [perspective:1000px] select-none cursor-pointer group bg-neutral-950"
        onClick={() => setIsFlipped(!isFlipped)}
        onDoubleClick={handleDoubleTap}
      >
        {/* Flip Indicator */}
        <div className="absolute top-4 right-4 z-40 bg-black/40 backdrop-blur-md p-2 rounded-full shadow-xl text-white opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none">
          <RotateCw className="w-4 h-4" />
        </div>

        {/* Lotus Animation Container (Sits outside the flip so it always stays visible) */}
        {showLotusAnimation && (
          <div className="absolute inset-0 z-50 flex items-center justify-center animate-in zoom-in duration-300 fade-out pointer-events-none">
            <Flower2 className="w-32 h-32 text-orange-400 fill-orange-500/50 drop-shadow-[0_0_30px_rgba(249,115,22,0.8)] opacity-90" />
          </div>
        )}

        {/* The 3D Wrapper */}
        <div className={`relative w-full h-full transition-all duration-700 ease-in-out [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
          
          {/* ---- FRONT FACE ---- */}
          <div className="absolute inset-0 [backface-visibility:hidden] bg-neutral-800 border-y border-white/5">
            <img 
              src={post.bg_url} 
              alt="Vesak Card" 
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }} 
            />
          </div>

          {/* ---- BACK FACE (Postcard) ---- */}
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#EFE9D9] text-neutral-800 p-6 flex flex-col border-y border-white/5 shadow-inner overflow-hidden">
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/paper.png')]" />

            <div className="flex justify-between items-start border-b border-neutral-400/40 pb-4 mb-4 relative z-10">
              <div className="font-serif text-xl text-orange-950 truncate pr-4">
                <span className="text-neutral-500 text-xs uppercase tracking-widest block mb-1">To</span>
                {/* Fallback to "Everyone" for older posts without a to_name */}
                {post.to_name || "Everyone"}
              </div>
              <div className="w-14 h-16 shrink-0 border-2 border-dashed border-neutral-400/60 flex items-center justify-center p-1">
                <span className="text-[10px] text-neutral-400/80 font-medium uppercase tracking-widest rotate-12 text-center">Stamp<br/>Here</span>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center font-serif text-lg text-center whitespace-pre-wrap px-2 leading-relaxed text-neutral-800 relative z-10">
              {post.message}
            </div>

            <div className="text-right border-t border-neutral-400/40 pt-4 mt-4 font-serif text-xl text-orange-950 relative z-10">
              <span className="text-neutral-500 text-xs uppercase tracking-widest block mb-1">From</span>
              {/* Fallback to author name for older posts */}
              {post.from_name || post.author_name || "Anonymous"}
            </div>
          </div>

        </div>
      </div>

      {/* 3. Footer Actions */}
      <div className="p-4 flex items-center gap-5">
        <button 
          onClick={handleLike} 
          className="flex items-center gap-2 text-neutral-400 hover:text-orange-500 transition-colors group"
        >
          <Flower2 className={`w-6 h-6 transition-all active:scale-90 ${isLiked ? "fill-orange-500 text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.6)]" : "group-hover:text-orange-500"}`} />
          <span className="text-sm font-medium">{likedBy.length > 0 && likedBy.length}</span>
        </button>
        
        <button 
          onClick={toggleComments}
          className={`flex items-center gap-2 transition-colors group ${showComments ? "text-orange-500" : "text-neutral-400 hover:text-orange-500"}`}
        >
          <MessageCircle className="w-6 h-6 active:scale-90 transition-transform" />
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