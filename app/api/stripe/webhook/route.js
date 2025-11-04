import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error(`❌ Webhook signature verification failed.`, err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // 2. Handle the specific event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      // a transaction to ensure both operations succeed or fail together
      await prisma.$transaction(async (tx) => {
        // Find the user based on the customerId stored in the Stripe session
        const user = await tx.user.findFirst({
          where: {
            stripeCustomerId: session.customer,
          },
        });

        if (!user) {
          throw new Error(
            `User not found for customer ID: ${session.customer}`
          );
        }

        // Update the user's membership status
        await tx.user.update({
          where: { id: user.id },
          data: {
            isPlusMember: true,
            subscriptionId: session.subscription,
          },
        });

        console.log(`✅ Membership activated for user: ${user.id}`);
      });
    } catch (error) {
      console.error(`❌ Error processing checkout.session.completed:`, error);
      return new NextResponse("Webhook processing failed", { status: 500 });
    }
  }

  return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
