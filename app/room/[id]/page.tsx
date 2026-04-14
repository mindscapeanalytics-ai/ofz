import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MeetingRoom } from "@/components/meeting/meeting-room";

export const dynamic = "force-dynamic";

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const h = await headers();
  const session = await auth.api.getSession({
    headers: h,
  });

  if (!session) {
    redirect(`/login?callbackUrl=/room/${id}`);
  }

  // Verify room exists
  const room = await prisma.meeting.findUnique({
    where: { roomName: id },
  });

  if (!room) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background p-6">
        <div className="max-w-md text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <h1 className="text-2xl font-bold">Room Not Found</h1>
          <p className="text-muted-foreground">The meeting you are trying to join doesn't exist or has ended.</p>
          <a href="/" className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold">
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-black">
      <MeetingRoom roomName={id} />
    </div>
  );
}
