import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { message: "Invalid verification link." },
        { status: 400 }
      );
    }

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        expires: {
          gt: new Date(),
        },
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { message: "Invalid or expired verification token." },
        { status: 400 }
      );
    }

    // Update user's email verification status
    await prisma.user.update({
      where: {
        email: verificationToken.identifier,
      },
      data: {
        emailVerified: new Date(),
      },
    });

    // Delete the used verification token
    await prisma.verificationToken.delete({
      where: {
        token,
      },
    });

    return NextResponse.json(
      { message: "Email verified successfully! You can now sign in." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { message: "An error occurred during email verification." },
      { status: 500 }
    );
  }
}