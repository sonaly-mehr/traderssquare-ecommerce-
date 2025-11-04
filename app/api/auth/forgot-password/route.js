import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateExpiry, generateToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";


export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        {
          message:
            "If an account with that email exists, you will receive a password reset link.",
        },
        { status: 200 }
      );
    }

    //reset token
    const resetToken = generateToken();
    const resetTokenExpiry = generateExpiry(1); // 1 hour expiry

    // Store reset token in user record
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(email, resetToken);

    if (!emailResult.success) {
      console.error("Failed to send password reset email:", emailResult.error);
      return NextResponse.json(
        { message: "Failed to send reset email. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message:
          "If an account with that email exists, you will receive a password reset link.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
