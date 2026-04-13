"use server";

import { prisma } from "@/lib/prisma";

/**
 * Checks if an email is already registered in the system.
 * Used for strict authentication error reporting.
 */
export async function checkUserRegistration(email: string) {
  if (!email) return false;
  
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true }
  });

  return !!user;
}
