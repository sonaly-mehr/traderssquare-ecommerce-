import { openai } from "@/config/openai";
import { authOptions } from "@/lib/auth";
import authSeller from "@/middlewares/authSeller";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

async function main(base64Image, mimeType) {
  const messages = [
    {
      role: "system",
      content: `
                        You are a product listing assistant for an e-commerce store.
                        Your job is to analyze an image of a product and generate structured data.

                        Respond ONLY with raw JSON (no code block, no markdown, no explanation).
                        The JSON must strictly follow this schema:

                        {
                        "name": string,               // Short to medium product name
                        "description": string,         // Marketing-friendly description of the product
                        }
                   `,
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "Analyze this image and return name + description.",
        },
        {
          type: "image_url",
          image_url: { url: `data:${mimeType};base64,${base64Image}` },
        },
      ],
    },
  ];

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL,
    messages,
  });

  const raw = response.choices[0].message.content;
  console.log(raw);

  // remove ```json or ``` wrappers if present
  const cleaned = raw.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("AI did not return valid JSON");
  }

  return parsed;
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const isAdmin = await authSeller(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }
    const { base64Image, mimeType } = await request.json();
    const result = await main(base64Image, mimeType);
    return NextResponse.json({ ...result });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}
