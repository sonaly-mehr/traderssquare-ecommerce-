import { authOptions } from "@/lib/auth";
import authAdmin from "@/middlewares/authAdmin";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// Auth Admin
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}
