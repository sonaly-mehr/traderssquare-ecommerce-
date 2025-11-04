import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// Auth Seller
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const isSeller = await authSeller(userId);

    if (!isSeller) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const storeInfo = await prisma.store.findUnique({ where: { userId } });

    return NextResponse.json({ isSeller, storeInfo });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}
