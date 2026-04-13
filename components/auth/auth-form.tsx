"use client";

import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";
import { Loader2, Mail, Lock, User, ArrowRight, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { checkUserRegistration } from "@/app/actions/auth";

export function AuthForm({ type }: { type: "login" | "register" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === "login") {
        const isRegistered = await checkUserRegistration(email);
        if (!isRegistered) {
          toast.error("Account not registered. Please sign up first.");
          setLoading(false);
          return;
        }

        const { error } = await signIn.email({
          email,
          password,
          callbackURL: "/",
        });

        if (error) {
          toast.error(error.message || "Invalid credentials. Please attempt again.");
          return;
        }
      } else {
        const { error } = await signUp.email({
          email,
          password,
          name,
          callbackURL: "/",
        });

        if (error) {
          toast.error(error.message || "Registration initialization failed.");
          return;
        }
      }
      
      toast.success(type === "login" ? "OFZ Pulse Established" : "Co-working Account Created");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error("System Protocol Error. Connection lost.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-lg bg-white border-4 border-black rounded-[2.5rem] md:rounded-[3.5rem] shadow-[20px_20px_0px_#000000] transition-all overflow-hidden flex flex-col items-center 
      ${type === "register" ? "p-4 md:p-8 my-2" : "p-6 md:p-10 my-4"}`}>
      
      {/* Header - Dynamically scales for Registration depth */}
      <div className={`flex flex-col items-center text-center ${type === "register" ? "mb-4 md:mb-6" : "mb-6 md:mb-10"}`}>
        <div className={`bg-black rounded-[1.2rem] md:rounded-[2rem] text-[#ffdc42] animate-pulse shadow-xl shadow-black/10 
          ${type === "register" ? "p-3 md:p-4 mb-3 md:mb-4" : "p-3 md:p-5 mb-4 md:mb-6"}`}>
          <Video className={type === "register" ? "w-5 h-5 md:w-8 md:h-8" : "w-6 h-6 md:w-10 md:h-10"} />
        </div>
        <h1 className={`font-black uppercase tracking-tighter leading-none text-black 
          ${type === "register" ? "text-xl md:text-3xl" : "text-2xl md:text-5xl"}`}>
          {type === "login" ? "OFZ Login" : "OFZ Register"}
        </h1>
        <p className="text-black/40 font-bold uppercase text-[8px] md:text-[10px] mt-1 md:mt-3 tracking-[0.3em]">
          {type === "login" ? "Secure Core Access" : "Universal Identity Setup"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className={`w-full ${type === "register" ? "space-y-3 md:space-y-4" : "space-y-4 md:space-y-6"}`}>
        {type === "register" && (
          <div className="space-y-1">
            <label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] ml-4 text-black/60">Full Identity</label>
            <div className="relative group">
              <User className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-black opacity-30 group-focus-within:opacity-100 transition-opacity" />
              <input
                type="text"
                placeholder="Name Surname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 md:h-14 pl-14 pr-6 bg-black/5 border-4 border-transparent focus:border-black rounded-xl md:rounded-2xl outline-none font-bold uppercase transition-all placeholder:text-black/20 text-black text-sm"
                required
              />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] ml-4 text-black/60">Co-working Channel</label>
          <div className="relative group">
            <Mail className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-black opacity-30 group-focus-within:opacity-100 transition-opacity" />
            <input
              type="email"
              placeholder="team@ofz.space"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full pl-14 pr-6 bg-black/5 border-4 border-transparent focus:border-black rounded-xl md:rounded-2xl outline-none font-bold uppercase transition-all placeholder:text-black/20 text-black text-sm
                ${type === "register" ? "h-12 md:h-14" : "h-14 md:h-16"}`}
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] ml-4 text-black/60">Secure Access Key</label>
          <div className="relative group">
            <Lock className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-black opacity-30 group-focus-within:opacity-100 transition-opacity" />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full pl-14 pr-6 bg-black/5 border-4 border-transparent focus:border-black rounded-xl md:rounded-2xl outline-none font-bold uppercase transition-all placeholder:text-black/20 text-black text-sm
                ${type === "register" ? "h-12 md:h-14" : "h-14 md:h-16"}`}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-black text-[#ffdc42] rounded-[1.25rem] md:rounded-[1.5rem] font-black uppercase flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-black/10
            ${type === "register" ? "h-14 md:h-16 text-sm md:text-base" : "h-16 md:h-20 text-base md:text-xl"}`}
        >
          {loading ? (
            <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin" />
          ) : (
            <>
              {type === "login" ? "Initialize Access" : "Setup Protocol"}
              <ArrowRight className="w-4 h-4 md:w-6 md:h-6" />
            </>
          )}
        </button>
      </form>

      {/* Footer Links - Compact and centered */}
      <div className={`w-full text-center border-t-2 border-dashed border-black/10 
        ${type === "register" ? "mt-4 md:mt-6 pt-3 md:pt-4" : "mt-6 md:mt-10 pt-4 md:pt-8"}`}>
        <p className="text-[8px] md:text-[10px] font-bold text-black/30 uppercase tracking-widest mb-1 md:mb-2">Protocol Selection</p>
        <a 
          href={type === "login" ? "/register" : "/login"}
          className="text-[9px] md:text-xs font-black uppercase tracking-widest text-black hover:text-red-600 transition-colors underline-offset-8 hover:underline decoration-4"
        >
          {type === "login" ? "New User? Create Identity" : "Member? Verify Protocol"}
        </a>
      </div>
    </div>
  );
}
