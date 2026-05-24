import { createContext, useContext, useState } from "react";
import LoginModal from "../components/auth/LoginModal";

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [alertData, setAlertData] = useState({ title: "", description: "", showLoginBtn: false });
  
  // State to handle popping open the Login Modal from inside the alert
  const [showLoginModal, setShowLoginModal] = useState(false);

  // We added a 3rd parameter: showLoginBtn (defaults to false)
  const showAlert = (title, description, showLoginBtn = false) => {
    setAlertData({ title, description, showLoginBtn });
    setIsOpen(true);
  };

  const handleLoginClick = () => {
    setIsOpen(false); // Hide the alert
    setShowLoginModal(true); // Pop the login modal!
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}

      {/* =========================================
          CUSTOM GLASSMORPHISM ALERT MODAL
          ========================================= */}
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
              {/* If showLoginBtn is true, show Cancel + Sign In. Otherwise, just show Okay. */}
              {alertData.showLoginBtn ? (
                <>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="text-neutral-400 hover:text-white font-medium px-4 py-2.5 transition-colors active:scale-95"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleLoginClick}
                    className="bg-orange-500/90 hover:bg-orange-500 text-white font-medium px-6 py-2.5 rounded-xl transition-colors shadow-lg shadow-orange-500/20 active:scale-95"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsOpen(false)}
                  className="bg-orange-500/90 hover:bg-orange-500 text-white font-medium px-6 py-2.5 rounded-xl transition-colors shadow-lg shadow-orange-500/20 active:scale-95"
                >
                  Okay
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Inject the LoginModal so the AlertContext can trigger it globally */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

    </AlertContext.Provider>
  );
}

export const useAlert = () => useContext(AlertContext);