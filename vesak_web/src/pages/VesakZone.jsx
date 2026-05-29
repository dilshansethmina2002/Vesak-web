import { motion } from "framer-motion";

export default function VesakZone() {
  return (
    <section className="relative flex w-full flex-col items-center justify-center py-4 sm:py-10 animate-in fade-in duration-500 pb-24">
      
      {/* Title Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-8 px-4 text-center"
      >
        <h2 className="mb-4 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] sm:text-4xl">
          ඩිජිටල් වෙසක් තොරණ
        </h2>
        <p className="text-[10px] uppercase tracking-[0.2em] text-yellow-500/70 sm:text-xs">
          CodeCraft Interactive Experience
        </p>
      </motion.div>

      {/* ─── Iframe Container (Larger & Longer) ─── */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        onViewportEnter={() => window.dispatchEvent(new Event("pause-bgm"))}
        onViewportLeave={() => window.dispatchEvent(new Event("resume-bgm"))}
        viewport={{ once: false, amount: 0.4 }} 
        transition={{ duration: 1, delay: 0.2 }}
        // Removed aspect-video, added fixed height for vertical length
        className="relative w-full max-w-3xl h-[600px] md:h-[750px] overflow-hidden rounded-2xl border border-white/10 bg-black/50 shadow-[0_0_40px_rgba(250,204,21,0.15)]"
      >
        
        {/* Loading Spinner */}
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-neutral-950/80 backdrop-blur-md">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
          <p className="mt-4 animate-pulse text-xs text-orange-400 sm:text-sm font-medium">
            තොරණ Load වෙමින් පවතී...
          </p>
        </div>

        {/* The External Link */}
        <iframe
          src="https://codecraft-thorana.vercel.app/index.html"
          title="Digital Vesak Thorana"
          className="absolute inset-0 z-10 h-full w-full border-none"
          allowFullScreen 
        />
      </motion.div>

      {/* Button Section */}
      <motion.div
         initial={{ opacity: 0 }}
         whileInView={{ opacity: 1 }}
         viewport={{ once: true }}
         transition={{ delay: 0.8 }}
         className="mt-8 flex flex-col items-center px-4"
      >
        <p className="mb-4 text-center text-xs text-neutral-400 md:hidden">
          * හොඳම අත්දැකීම සඳහා දුරකථනය හරවන්න (Landscape)
        </p>
        <a 
          href="https://codecraft-thorana.vercel.app/index.html" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full border border-orange-500/50 bg-orange-500/10 px-6 py-2.5 text-sm font-bold text-orange-400 shadow-[0_0_15px_rgba(234,179,8,0.2)] transition-all hover:bg-orange-500 hover:text-white active:scale-95"
        >
          Full Screen නැරඹීමට ↗
        </a>
      </motion.div>

    </section>
  );
}