"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Keyboard, ArrowRight } from "lucide-react";

export function JoinMeetingForm() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  const handleJoin = () => {
    if (roomId.trim()) {
      router.push(`/room/${roomId.trim()}`);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-1 w-full bg-white p-2 rounded-[2rem] border-4 border-black group focus-within:ring-8 ring-white/20 transition-all shadow-[8px_8px_0px_#000000]">
      <Keyboard className="w-6 h-6 ml-4 opacity-40 group-focus-within:opacity-100 transition-opacity" />
      <input
        type="text"
        placeholder="MEETING CODE"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleJoin()}
        className="flex-1 bg-transparent border-none outline-none py-4 px-2 text-xl font-black uppercase placeholder:opacity-20 placeholder:text-black"
      />
      <button 
        onClick={handleJoin}
        disabled={!roomId.trim()}
        className="p-4 bg-black text-[#ffdc42] rounded-[1.5rem] transition-all duration-300 disabled:opacity-30 disabled:grayscale hover:scale-105 active:scale-95"
      >
        <ArrowRight className="w-6 h-6" />
      </button>
    </div>
  );
}
