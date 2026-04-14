import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createMeeting } from "@/app/actions/meeting";
import { UserButton } from "@/components/auth/user-button";
import { JoinMeetingForm } from "@/components/meeting/join-meeting-form";
import { Video, Plus, Shield, Zap, Globe, Layout, Monitor, Mic, Edit2 } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex-1 flex flex-col font-sans h-[100dvh] overflow-hidden bg-[#ffdc42] pt-safe pb-safe">
      {/* Hero Section - Explicitly using dvh for locking */}
      <section className="relative h-full flex flex-col overflow-hidden">
        {/* Navigation Bar */}
        <nav className="h-14 md:h-20 shrink-0 flex items-center justify-between px-4 md:px-12">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-black p-1.5 md:p-2 rounded-lg md:rounded-xl text-[#ffdc42]">
              <Video className="w-5 h-5 md:w-7 md:h-7" />
            </div>
            <span className="text-lg md:text-2xl font-black tracking-tighter text-black uppercase">OFZ</span>
          </div>
          <div className="flex items-center gap-3">
            {session ? (
              <UserButton user={session.user} />
            ) : (
              <Link 
                href="/login"
                className="px-4 py-2 bg-black text-[#ffdc42] rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                Access
              </Link>
            )}
          </div>
        </nav>

        {/* Main Hero Content - Responsive scaling for Zero-Scroll */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0 py-2">
          <div className="max-w-6xl w-full text-center space-y-2 md:space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h1 className="text-[2.75rem] sm:text-5xl md:text-7xl lg:text-[7.5rem] font-black text-black leading-[0.9] tracking-tighter uppercase select-none">
              Virtual <br />
              <span className="text-white drop-shadow-[2px_2px_0px_#000000] md:drop-shadow-[4px_4px_0px_#000000]">Co-Working.</span>
            </h1>
            
            <p className="text-[11px] md:text-xl text-black/80 font-bold max-w-2xl mx-auto leading-tight tracking-tight mt-1 md:mt-4">
              High-performance workspace for elite teams. 
              <span className="hidden sm:inline italic opacity-80 ml-1">Secure. Fast. Infinite Sync.</span>
            </p>

            <div className="flex flex-col md:flex-row items-stretch justify-center gap-2 md:gap-4 max-w-3xl mx-auto w-full pt-2 md:pt-6">
              {session ? (
                <form action={createMeeting} className="flex-1">
                  <button
                    type="submit"
                    className="w-full h-14 md:h-16 group relative overflow-hidden bg-black text-[#ffdc42] text-base md:text-lg font-black uppercase rounded-xl md:rounded-[1.5rem] hover:scale-[1.03] active:scale-[0.97] transition-all"
                  >
                    <div className="flex items-center justify-center gap-3 relative z-10">
                      <Plus className="w-4 h-4 md:w-5 md:h-5" />
                      Init Space
                    </div>
                  </button>
                </form>
              ) : (
                <Link 
                  href="/login"
                  className="flex-1 h-14 md:h-16 bg-black text-[#ffdc42] text-base md:text-lg font-black uppercase rounded-xl md:rounded-[1.5rem] flex items-center justify-center hover:scale-[1.03] active:scale-[0.97] transition-all"
                >
                  Sign in
                </Link>
              )}

              <div className="flex-1 flex">
                <JoinMeetingForm />
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Types Showcase - Scaled for vertical fit */}
        <div className="px-4 md:px-12 pb-4 md:pb-8 w-full max-w-7xl mx-auto shrink-0">
          <div className="grid grid-cols-4 md:grid-cols-4 gap-2 md:gap-4">
            {[
              { icon: <Video />, label: "Video", desc: "4K" },
              { icon: <Mic />, label: "Audio", desc: "HD" },
              { icon: <Monitor />, label: "Screen", desc: "Fast" },
              { icon: <Edit2 />, label: "Draw", desc: "Sync" }
            ].map((type, i) => (
              <div key={i} className="flex flex-col items-center justify-center p-1.5 md:p-4 bg-white border-2 border-black rounded-lg md:rounded-[1.5rem] hover:scale-105 transition-all cursor-pointer group shadow-[2px_2px_0px_#000000] md:shadow-[4px_4px_0px_#000000]">
                <div className="p-1 md:p-2 bg-black text-[#ffdc42] rounded-md mb-1 md:mb-2 transition-colors">
                  {Object.assign({}, type.icon, { props: { ...type.icon.props, className: 'w-3 h-3 md:w-5 md:h-5' } })}
                </div>
                <span className="text-[7px] md:text-[10px] font-black uppercase tracking-tighter md:tracking-widest">{type.label}</span>
                <span className="hidden md:inline text-[7px] md:text-[8px] text-black/40 font-bold uppercase">{type.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Full-Width Features Banner */}
        <footer className="w-full bg-black py-1.5 md:py-3 shrink-0 overflow-hidden border-t-2 md:border-t-4 border-white">
          <div className="flex items-center justify-around gap-12 text-white/40 uppercase text-[7px] md:text-[9px] font-black tracking-[0.3em] whitespace-nowrap animate-marquee">
            <span className="flex items-center gap-2"><Zap className="w-2.5 h-2.5 text-[#ffdc42]"/> Ultralight OFZ Protocol</span>
            <span className="flex items-center gap-2"><Shield className="w-2.5 h-2.5 text-[#ffdc42]"/> Zero-Knowledge Security</span>
            <span className="flex items-center gap-2"><Globe className="w-2.5 h-2.5 text-[#ffdc42]"/> Global Edge Synchronization</span>
          </div>
        </footer>
      </section>
    </div>

  );
}
