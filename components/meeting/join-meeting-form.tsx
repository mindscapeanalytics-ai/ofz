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
    <div className="flex items-center gap-2 flex-1 w-full bg-white p-1.5 md:p-2 rounded-xl md:rounded-[2rem] border-2 md:border-4 border-black group focus-within:ring-4 md:focus-within:ring-8 ring-white/20 transition-all shadow-[4px_4px_0px_#000000] md:shadow-[8px_8px_0px_#000000]">
      <Keyboard className="w-5 h-5 ml-2 md:ml-4 opacity-40 group-focus-within:opacity-100 transition-opacity" />
      <input
        type="text"
        placeholder="CODE"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleJoin()}
        className="flex-1 bg-transparent border-none outline-none py-3 md:py-4 px-1 md:px-2 text-sm md:text-xl font-black uppercase placeholder:opacity-20 placeholder:text-black min-w-0"
      />
      <button 
        onClick={handleJoin}
        disabled={!roomId.trim()}
        className="p-3 md:p-4 bg-black text-[#ffdc42] rounded-lg md:rounded-[1.5rem] transition-all duration-300 disabled:opacity-30 disabled:grayscale hover:scale-105 active:scale-95"
      >
        <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>
    </div>
  );

}
