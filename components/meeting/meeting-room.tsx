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
import { Loader2, MessageSquare, Edit3, Users, X, Share2, Check, Mic, MicOff, LogOut } from "lucide-react";
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
      onDisconnected={() => {
        window.location.href = "/";
      }}
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
  const [showControls, setShowControls] = useState(true);
  const room = useRoomContext();
  const [whiteboardData, setWhiteboardData] = useState<any>(null);
  const isSyncingRef = useRef(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide controls logic
  const resetHideTimer = useCallback(() => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    setShowControls(true);
    hideTimeoutRef.current = setTimeout(() => {
      if (!sidebar) setShowControls(false); // Don't hide if sidebar is active
    }, 5000);
  }, [sidebar]);

  useEffect(() => {
    resetHideTimer();
    return () => { if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current); };
  }, [resetHideTimer]);

  const toggleUI = () => {
    if (showControls) {
      setShowControls(false);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    } else {
      resetHideTimer();
    }
  };

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
    <div 
      className="flex-1 flex h-full relative overflow-hidden bg-neutral-950 font-sans cursor-pointer"
      onClick={toggleUI}
    >
      <div className="flex-1 flex h-full relative overflow-hidden">
        {/* Main Workspace */}
        <div className="flex-1 flex flex-col relative overflow-hidden group/workspace">
          {/* OFZ Brand Overlay - Responsive scale & Hide logic */}
          <div 
            className={`absolute top-4 md:top-6 left-4 md:left-8 z-30 pointer-events-none transition-all duration-500 
            ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white border-2 md:border-4 border-black px-3 md:px-6 py-1 md:py-2 rounded-xl md:rounded-2xl flex items-center gap-2 md:gap-4 pointer-events-auto shadow-[4px_4px_0px_#000000]">
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] md:text-sm font-black tracking-widest uppercase text-black truncate max-w-[120px] md:max-w-none">
                OFZ // {roomName}
              </span>
            </div>
          </div>

          {/* Video core */}
          <div className="flex-1 relative">
            <VideoConference />
          </div>
          
          {/* OFZ Desktop Side Controls (Hidden on mobile) */}
          <div 
            className={`hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 flex-col gap-5 z-40 transition-all duration-500
            ${showControls ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}
            onClick={(e) => e.stopPropagation()}
          >
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
            <SidebarToggle 
              active={false} 
              type="leave"
              icon={<LogOut className="w-6 h-6" />} 
              onClick={() => {
                room.disconnect();
                window.location.href = "/";
              }} 
            />
          </div>

          {/* Mobile Bottom Dock (TikTok/Zoom style) */}
          <div 
            className={`md:hidden fixed bottom-6 left-4 right-4 z-50 transition-all duration-500
            ${showControls ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95 pointer-events-none'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass-dark border-2 border-white/20 rounded-[2rem] p-4 flex items-center justify-around shadow-2xl backdrop-blur-3xl pb-safe">
              <MobileDockItem 
                active={sidebar === "chat"} 
                icon={<MessageSquare className="w-5 h-5" />} 
                label="Chat"
                onClick={() => setSidebar(sidebar === "chat" ? null : "chat")} 
              />
              <MobileDockItem 
                active={sidebar === "whiteboard"} 
                icon={<Edit3 className="w-5 h-5" />} 
                label="Draw"
                onClick={() => setSidebar(sidebar === "whiteboard" ? null : "whiteboard")} 
              />
              <MobileDockItem 
                active={sidebar === "participants"} 
                icon={<Users className="w-5 h-5" />} 
                label="Team"
                onClick={() => setSidebar(sidebar === "participants" ? null : "participants")} 
              />
              <MobileDockItem 
                active={copied} 
                icon={copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />} 
                label="Invite"
                onClick={copyLink} 
              />
              <MobileDockItem 
                active={false} 
                icon={<LogOut className="w-5 h-5 text-red-500" />} 
                label="Leave"
                onClick={() => {
                  room.disconnect();
                  window.location.href = "/";
                }} 
              />
            </div>
          </div>
        </div>

        {/* Global Sidebar Overlay */}
        {sidebar && (
          <div 
            className="fixed md:relative inset-0 md:inset-auto md:w-[450px] bg-white border-l-0 md:border-l-8 border-black h-full flex flex-col shadow-2xl z-50 animate-in slide-in-from-right duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 md:p-6 border-b-4 border-black bg-[#ffdc42] pt-safe">
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
                <div className="p-4 md:p-6 space-y-4 h-full overflow-y-auto">
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

function MobileDockItem({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? "text-[#ffdc42] scale-110" : "text-white/60"}`}
    >
      <div className={`p-3 rounded-2xl ${active ? "bg-[#ffdc42]/20 shadow-[0_0_20px_rgba(255,220,66,0.2)]" : "bg-white/5"}`}>
        {icon}
      </div>
      <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}


interface SidebarToggleProps {
  active: boolean;
  type: "chat" | "whiteboard" | "participants" | "share" | "leave";
  icon: React.ReactNode;
  onClick: () => void;
}

function SidebarToggle({ active, type, icon, onClick }: SidebarToggleProps) {
  const colors = {
    chat: active ? "bg-blue-600 text-white" : "bg-white text-black hover:bg-blue-50",
    whiteboard: active ? "bg-purple-600 text-white" : "bg-white text-black hover:bg-purple-50",
    participants: active ? "bg-orange-600 text-white" : "bg-white text-black hover:bg-orange-50",
    share: active ? "bg-green-600 text-white" : "bg-white text-black hover:bg-green-50",
    leave: "bg-white text-red-500 border-[3px] border-red-500 hover:bg-red-50",
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
