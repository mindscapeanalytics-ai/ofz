"use client";

import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { 
  LogOut, 
  User as UserIcon, 
  Settings 
} from "lucide-react";
import { useState } from "react";

export function UserButton({ user }: { user: { name: string; email: string; image?: string | null } }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1 pl-4 bg-black border-4 border-black rounded-2xl hover:scale-105 transition-all shadow-[4px_4px_0px_rgba(0,0,0,0.2)]"
      >
        <span className="text-[10px] font-black uppercase tracking-widest text-[#ffdc42] hidden md:block">
          {user.name.split(" ")[0]}
        </span>
        <div className="w-10 h-10 rounded-xl bg-[#ffdc42] flex items-center justify-center text-black font-black">
          {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
        </div>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-4 w-64 bg-white border-4 border-black rounded-[2rem] shadow-[8px_8px_0px_#000000] p-2 z-50 animate-in fade-in zoom-in duration-200">
            <div className="px-4 py-4 border-b-2 border-black/10 mb-2">
              <p className="text-sm font-black uppercase tracking-tighter truncate">{user.name}</p>
              <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest truncate">{user.email}</p>
            </div>
            <button className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#ffdc42] transition-colors">
              <UserIcon className="w-4 h-4" />
              Identity Profile
            </button>
            <button className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#ffdc42] transition-colors">
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <div className="border-t-2 border-black/10 my-2" />
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 rounded-xl hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Deactivate Session
            </button>
          </div>
        </>
      )}
    </div>
  );
}
