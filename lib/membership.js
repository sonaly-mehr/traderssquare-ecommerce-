import prisma from "./prisma";

export async function checkUserMembership(userId) {
  if (!userId) return false;
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPlusMember: true }
  });
  
  return user?.isPlusMember || false;
}