"use client";

import { 
  LiveKitRoom, 
  VideoConference, 
  RoomAudioRenderer,
  ControlBar,
  Chat,
  useParticipants,
  useTracks,
  useRoomContext,
  LayoutContextProvider,
} from "@livekit/components-react";
import { RoomEvent, Track } from "livekit-client";
import "@livekit/components-styles";
import { useEffect, useState, useCallback, useRef } from "react";
import { Loader2, MessageSquare, Edit3, Users, X, Share2, Check, Mic, MicOff } from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";

// Dynamic import for Excalidraw to prevent SSR issues
const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false }
);

export function MeetingRoom({ roomName }: { roomName: string }) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(`/api/livekit/token?room=${roomName}`);
        const data = await resp.json();
        if (data.token) {
          setToken(data.token);
        } else {
          setError(data.error || "Failed to get token");
        }
      } catch (e) {
        setError("Failed to fetch conferencing token");
      }
    })();
  }, [roomName]);

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background">
        <div className="p-10 bg-black border-4 border-red-500 rounded-[3rem] text-red-500 max-w-md text-center shadow-[16px_16px_0px_#ef4444]">
          <p className="font-black text-3xl uppercase tracking-tighter mb-4 text-white">CRITICAL FAILURE</p>
          <p className="text-sm font-bold uppercase mb-8 opacity-70 text-white">{error}</p>
          <a href="/" className="px-8 py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all outline-none">ABORT & RETURN</a>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#ffdc42] space-y-4">
        <Loader2 className="w-16 h-16 animate-spin text-black" />
        <p className="text-black font-black uppercase text-xl tracking-tighter animate-pulse text-center">OFZ Pulse Initializing...</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="default"
      className="flex-1 flex flex-col relative selection:bg-[#ffdc42] selection:text-black overflow-hidden"
      connect={true}
    >
      <LayoutContextProvider>
        <MeetingInner roomName={roomName} />
      </LayoutContextProvider>
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function MeetingInner({ roomName }: { roomName: string }) {
  const [sidebar, setSidebar] = useState<"chat" | "whiteboard" | "participants" | null>(null);
  const [copied, setCopied] = useState(false);
  const room = useRoomContext();
  const [whiteboardData, setWhiteboardData] = useState<any>(null);
  const isSyncingRef = useRef(false);

  // Whiteboard sync logic
  const handleWhiteboardChange = useCallback((elements: any) => {
    if (isSyncingRef.current) return;
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify({ type: "whiteboard", elements }));
    room.localParticipant.publishData(data, { reliable: true });
  }, [room]);

  useEffect(() => {
    const handleData = (payload: Uint8Array) => {
      const decoder = new TextDecoder();
      const str = decoder.decode(payload);
      try {
        const data = JSON.parse(str);
        if (data.type === "whiteboard") {
          isSyncingRef.current = true;
          setWhiteboardData(data.elements);
          setTimeout(() => { isSyncingRef.current = false; }, 100);
        }
      } catch (e) { /* Ignore non-JSON */ }
    };
    room.on(RoomEvent.DataReceived, handleData);
    return () => { room.off(RoomEvent.DataReceived, handleData); };
  }, [room]);

  const copyLink = () => {
    const url = `${window.location.origin}/room/${roomName}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("INVITE PULSE COPIED");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex h-full relative overflow-hidden bg-neutral-950 font-sans">
      <div className="flex-1 flex h-full relative overflow-hidden">
        {/* Main Workspace - Using VideoConference but HIDING its chat for single-stream UX */}
        <div className="flex-1 flex flex-col relative overflow-hidden group/workspace">
          {/* OFZ Brand Overlay */}
          <div className="absolute top-6 left-8 z-30 pointer-events-none transition-all group-hover/workspace:scale-105">
            <div className="bg-white border-4 border-black px-6 py-2 rounded-2xl flex items-center gap-4 pointer-events-auto shadow-[4px_4px_0px_#000000]">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-black tracking-widest uppercase text-black">OFZ Workspace // {roomName}</span>
            </div>
          </div>

          {/* Battle-tested initialized video core */}
          <div className="flex-1 relative">
            <VideoConference />
          </div>
          
          {/* OFZ Side Controls - Left Strip */}
          <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-5 z-40 animate-in slide-in-from-left duration-700">
            <SidebarToggle 
              active={sidebar === "chat"} 
              type="chat"
              icon={<MessageSquare className="w-6 h-6" />} 
              onClick={() => setSidebar(sidebar === "chat" ? null : "chat")} 
            />
            <SidebarToggle 
              active={sidebar === "whiteboard"} 
              type="whiteboard"
              icon={<Edit3 className="w-6 h-6" />} 
              onClick={() => setSidebar(sidebar === "whiteboard" ? null : "whiteboard")} 
            />
            <SidebarToggle 
              active={sidebar === "participants"} 
              type="participants"
              icon={<Users className="w-6 h-6" />} 
              onClick={() => setSidebar(sidebar === "participants" ? null : "participants")} 
            />
            <SidebarToggle 
              active={copied} 
              type="share"
              icon={copied ? <Check className="w-6 h-6" /> : <Share2 className="w-6 h-6" />} 
              onClick={copyLink} 
            />
          </div>
        </div>

        {/* Global Sidebar Overlay */}
        {sidebar && (
          <div className="w-full md:w-[450px] bg-white border-l-8 border-black h-full flex flex-col shadow-2xl z-50 animate-in slide-in-from-right duration-500">
            <div className="flex items-center justify-between p-6 border-b-4 border-black bg-[#ffdc42]">
              <h2 className="font-black uppercase text-xl tracking-tighter text-black">{sidebar}</h2>
              <button 
                onClick={() => setSidebar(null)}
                className="p-2 border-2 border-black hover:bg-black hover:text-[#ffdc42] rounded-xl transition-colors text-black"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden relative">
              {sidebar === "chat" && (
                <div className="h-full bg-white selection:bg-black selection:text-[#ffdc42]">
                  <Chat />
                </div>
              )}
              {sidebar === "participants" && (
                <div className="p-6 space-y-4 h-full overflow-y-auto">
                  <ParticipasList />
                </div>
              )}
              {sidebar === "whiteboard" && (
                <div className="absolute inset-0 bg-white">
                  <Excalidraw 
                    theme="light" 
                    initialData={{ elements: whiteboardData }}
                    onChange={handleWhiteboardChange}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface SidebarToggleProps {
  active: boolean;
  type: "chat" | "whiteboard" | "participants" | "share";
  icon: React.ReactNode;
  onClick: () => void;
}

function SidebarToggle({ active, type, icon, onClick }: SidebarToggleProps) {
  const colors = {
    chat: active ? "bg-blue-600 text-white" : "bg-white text-black hover:bg-blue-50",
    whiteboard: active ? "bg-purple-600 text-white" : "bg-white text-black hover:bg-purple-50",
    participants: active ? "bg-orange-600 text-white" : "bg-white text-black hover:bg-orange-50",
    share: active ? "bg-green-600 text-white" : "bg-white text-black hover:bg-green-50",
  };

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-[1.8rem] border-4 border-black transition-all duration-300 shadow-[6px_6px_0px_#000000] outline-none group flex items-center justify-center ${colors[type]}`}
    >
      <div className="group-hover:scale-110 transition-transform">
        {icon}
      </div>
    </button>
  );
}

function ParticipasList() {
  const participants = useParticipants();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-black/30">Active Pulse</span>
        <span className="text-[10px] font-black uppercase text-[#ffdc42] bg-black px-2 py-1 rounded-md">{participants.length} Active</span>
      </div>
      {participants.map((p) => (
        <div key={p.sid} className="flex items-center gap-4 p-4 rounded-3xl bg-black/5 border-2 border-black/10 group hover:border-black transition-all">
          <div className="w-12 h-12 rounded-2xl bg-black text-[#ffdc42] flex items-center justify-center text-sm font-black uppercase shadow-lg group-hover:scale-110 transition-transform">
            {p.identity[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-black uppercase tracking-tight truncate text-black">{p.identity}</p>
              {p.isSpeaking && <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />}
            </div>
            <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest">{p.isLocal ? "ORIGIN (YOU)" : "REMOTE"}</p>
          </div>
          <div className="flex items-center gap-2 bg-black/5 p-2 rounded-xl">
            {p.isMicrophoneEnabled ? <Mic className="w-4 h-4 text-green-600" /> : <MicOff className="w-4 h-4 text-red-500" />}
          </div>
        </div>
      ))}
    </div>
  );
}
