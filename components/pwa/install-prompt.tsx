"use client";

import { useEffect, useState } from "react";
import { Download, X, Smartphone, Share } from "lucide-react";
import { toast } from "sonner";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
      return;
    }

    // Detect iOS (Safari/Chrome on iOS doesn't support beforeinstallprompt)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIOSDevice);

    if (isIOSDevice) {
      setTimeout(() => setIsVisible(true), 3000);
      return;
    }

    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show the custom install prompt after a short delay for better UX
      setTimeout(() => setIsVisible(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      toast.info("Tap the Share icon at the bottom, then 'Add to Home Screen'", { duration: 5000 });
      return;
    }

    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      toast.success("OFZ WORKSPACE INITIALIZING...");
      setIsVisible(false);
    }
    
    setDeferredPrompt(null);
  };

  if (isStandalone || !isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-8 animate-in slide-in-from-bottom-full duration-700 pb-safe">
      <div className="max-w-xl mx-auto bg-black border-4 border-[#ffdc42] rounded-[2.5rem] p-6 md:p-8 shadow-[0px_0px_50px_rgba(255,220,66,0.5)] flex flex-col md:flex-row items-center gap-6 pointer-events-auto">
        <div className="bg-[#ffdc42] p-4 rounded-[1.5rem] shrink-0 text-black hidden sm:block">
          <Smartphone className="w-8 h-8" />
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-white font-black uppercase text-xl md:text-2xl tracking-tighter">Install OFZ Workspace</h3>
          <p className="text-white/60 text-xs md:text-sm font-bold uppercase tracking-widest mt-1">
            {isIos ? "Tap Share -> Add to Home Screen" : "Get the native app experience."}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleInstallClick}
            className="flex-1 md:flex-none px-6 py-4 bg-[#ffdc42] text-black rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isIos ? <Share className="w-5 h-5" /> : <Download className="w-5 h-5" />}
            {isIos ? "Share" : "Install"}
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-4 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
