import { createContext, useContext, useState } from "react";
import LoginModal from "../components/auth/LoginModal";

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [alertData, setAlertData] = useState({ 
    title: "", 
    description: "", 
    showLoginBtn: false,
    onConfirm: null, 
    confirmText: "Okay"
  });
  
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Upgraded signature to accept an onConfirm function and custom text
  const showAlert = (title, description, showLoginBtn = false, onConfirm = null, confirmText = "Okay") => {
    setAlertData({ title, description, showLoginBtn, onConfirm, confirmText });
    setIsOpen(true);
  };

  const handleLoginClick = () => {
    setIsOpen(false); 
    setShowLoginModal(true); 
  };

  const handleConfirmClick = () => {
    setIsOpen(false);
    if (alertData.onConfirm) {
      alertData.onConfirm();
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          
          <div className="bg-neutral-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300 mb-2">
              {alertData.title}
            </h3>
            
            <p className="text-neutral-300 text-sm mb-8 leading-relaxed">
              {alertData.description}
            </p>
            
            <div className="flex justify-end gap-3">
              {/* 1. Login Mode */}
              {alertData.showLoginBtn ? (
                <>
                  <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-white font-medium px-4 py-2.5 transition-colors active:scale-95">
                    Cancel
                  </button>
                  <button onClick={handleLoginClick} className="bg-orange-500/90 hover:bg-orange-500 text-white font-medium px-6 py-2.5 rounded-xl transition-colors shadow-lg shadow-orange-500/20 active:scale-95">
                    Sign In
                  </button>
                </>
              ) : 
              /* 2. Confirmation Mode (e.g., Deleting) */
              alertData.onConfirm ? (
                <>
                  <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-white font-medium px-4 py-2.5 transition-colors active:scale-95">
                    Cancel
                  </button>
                  <button onClick={handleConfirmClick} className="bg-red-500/90 hover:bg-red-600 text-white font-medium px-6 py-2.5 rounded-xl transition-colors shadow-lg shadow-red-500/20 active:scale-95">
                    {alertData.confirmText}
                  </button>
                </>
              ) : 
              /* 3. Standard Alert Mode */
              (
                <button onClick={() => setIsOpen(false)} className="bg-orange-500/90 hover:bg-orange-500 text-white font-medium px-6 py-2.5 rounded-xl transition-colors shadow-lg shadow-orange-500/20 active:scale-95">
                  Okay
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </AlertContext.Provider>
  );
}

export const useAlert = () => useContext(AlertContext);