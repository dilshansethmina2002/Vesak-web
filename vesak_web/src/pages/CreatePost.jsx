import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus, X, Loader2, UploadCloud, LogIn } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";

export default function CreatePost() {
  // Always call hooks at the top level
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // ==========================================
  // 1. IMAGE COMPRESSION MAGIC
  // ==========================================
  const compressImage = (imageFile) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1080;
          const scaleSize = MAX_WIDTH / img.width;

          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          canvas.toBlob((blob) => {
            const compressedFile = new File([blob], imageFile.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          }, "image/jpeg", 0.7);
        };
      };
    });
  };

  // ==========================================
  // 2. HANDLE FILE SELECTION
  // ==========================================
  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      showAlert("Invalid File", "Please select an image file (JPG, PNG, etc).");
      return;
    }

    setPreviewUrl(URL.createObjectURL(selectedFile));
    const compressed = await compressImage(selectedFile);
    setFile(compressed);
  };

  const clearImage = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ==========================================
  // 3. UPLOAD TO SUPABASE
  // ==========================================
  const handleShare = async () => {
    if (!file) {
      showAlert("Missing Photo", "Please select a photo to share.");
      return;
    }

    setIsUploading(true);
    const currentName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Anonymous";

    try {
      // 1. Upload the image to the Storage Bucket
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('vesak_media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Get the public URL for the image
      const { data: { publicUrl } } = supabase.storage
        .from('vesak_media')
        .getPublicUrl(fileName);

      // 3. Save it as a post in your existing feed table
      const { error: dbError } = await supabase
        .from('vesak_cards')
        .insert([{
          message: caption,
          bg_url: publicUrl,
          user_id: user.id,
          author_name: currentName,
          is_public: true // Ensures it shows up on the public feed
        }]);

      if (dbError) throw dbError;

      showAlert("Success!", "Your photo has been shared with the community.");
      navigate('/'); // Redirect to feed

    } catch (error) {
      console.error("Upload error:", error);
      showAlert("Upload Failed", "There was an error sharing your photo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // ==========================================
  // CONDITIONAL RENDERING: NOT LOGGED IN
  // ==========================================
  if (!user) {
    return (
      <div className="max-w-md mx-auto pt-10 pb-24 px-4 text-center animate-in fade-in slide-in-from-bottom-4">
        <div className="w-24 h-24 bg-neutral-900 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
          <UploadCloud className="w-10 h-10 text-orange-400" />
        </div>
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300 mb-3">
          Login Required
        </h2>
        <p className="text-neutral-400 text-sm mb-8 leading-relaxed">
          You need to be logged in to share your beautiful Vesak photos, lanterns, and decorations with the Sandakada community.
        </p>
        <button
          onClick={() => showAlert("Authentication Required", "Please log in to share photos!", true)}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-black font-bold transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <LogIn className="w-5 h-5" />
          Log In to Continue
        </button>
      </div>
    );
  }

  // ==========================================
  // CONDITIONAL RENDERING: LOGGED IN (NORMAL FORM)
  // ==========================================
  return (
    <div className="max-w-md mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-2xl font-bold text-white mb-2">Share a Photo</h2>
      <p className="text-neutral-400 text-sm mb-6">Share your Vesak lanterns, toranas, and decorations with the community.</p>

      {/* Image Uploader Area */}
      <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-4 mb-6 relative overflow-hidden">

        {!previewUrl ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[4/5] bg-neutral-950 border-2 border-dashed border-white/10 hover:border-orange-500/50 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors group"
          >
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ImagePlus className="w-8 h-8 text-neutral-400 group-hover:text-orange-400" />
            </div>
            <p className="text-white font-medium">Tap to choose a photo</p>
            <p className="text-neutral-500 text-sm mt-1">JPG, PNG, WEBP</p>
          </div>
        ) : (
          <div className="w-full aspect-[4/5] relative rounded-2xl overflow-hidden bg-black group">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={clearImage}
              className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Caption Input */}
      <div className="mb-8">
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption... (e.g., 'My beautiful new Vesak lantern!')"
          className="w-full h-32 bg-neutral-900/50 border border-white/10 rounded-2xl p-4 text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleShare}
        disabled={!file || isUploading}
        className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Sharing...
          </>
        ) : (
          <>
            <UploadCloud className="w-5 h-5" />
            Share Photo
          </>
        )}
      </button>

    </div>
  );
}