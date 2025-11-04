import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json(
      { message: "Sign out successful" },
      { status: 200 }
    );

    // Clear the auth cookies
    response.cookies.set("next-auth.session-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
      path: "/",
    });

    response.cookies.set("next-auth.csrf-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    // Clear any other NextAuth cookies
    const cookieNames = [
      "next-auth.callback-url",
      "next-auth.session-token",
      "__Secure-next-auth.session-token",
    ];

    cookieNames.forEach((cookieName) => {
      response.cookies.set(cookieName, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
      });
    });

    return response;
  } catch (error) {
    console.error("Sign out error:", error);
    return NextResponse.json(
      { message: "Sign out failed" },
      { status: 500 }
    );
  }
}