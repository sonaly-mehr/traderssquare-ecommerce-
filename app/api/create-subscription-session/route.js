import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { priceId } = await request.json();
    const userId = session.user.id;

    // Get user from database to check if they already have a Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, stripeCustomerId: true },
    });

    let customerId = user.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: userId,
          appId: "traderssquare",
        },
      });
      customerId = customer.id;

      // Save Stripe customer ID to user
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create subscription checkout session
    const subscriptionSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${request.headers.get(
        "origin"
      )}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get("origin")}/pricing`,
      metadata: {
        userId: userId,
        appId: "traderssquare",
      },
      subscription_data: {
        metadata: {
          userId: userId,
          appId: "traderssquare",
        },
      },
    });

    return NextResponse.json({ url: subscriptionSession.url });
  } catch (error) {
    console.error("Subscription session error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
