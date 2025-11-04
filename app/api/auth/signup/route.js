import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { inngest } from "@/inngest/client";
import { generateExpiry, generateToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = generateToken();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      },
    });

    // Store verification token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires: generateExpiry(24), 
      },
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(email, verificationToken);

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      // Don't fail the signup if email fails, but log it
      // User can request a new verification email later
    }

    // Send welcome email event to Inngest
    await inngest.send({
      name: "app/user.signedup",
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
    });

    return NextResponse.json(
      { 
        message: "User created successfully. Please check your email to verify your account.",
        emailSent: emailResult.success
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "An error occurred while creating the user." },
      { status: 500 }
    );
  }
}