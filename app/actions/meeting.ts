"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { nanoid } from "nanoid";

export async function createMeeting() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const roomName = nanoid(10); // Generate a unique room ID

  const meeting = await prisma.meeting.create({
    data: {
      roomName,
      hostId: session.user.id,
    },
  });

  redirect(`/room/${meeting.roomName}`);
}
