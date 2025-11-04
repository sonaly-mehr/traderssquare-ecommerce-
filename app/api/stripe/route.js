import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Handle one-time payments
    const handlePaymentIntent = async (paymentIntentId, isPaid) => {
      const session = await stripe.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { orderIds, userId, appId } = session.data[0].metadata;

      if (appId !== "traderssquare") {
        return NextResponse.json({ received: true, message: "Invalid app id" });
      }

      const orderIdsArray = orderIds.split(",");

      if (isPaid) {
        await Promise.all(
          orderIdsArray.map(async (orderId) => {
            await prisma.order.update({
              where: { id: orderId },
              data: { isPaid: true },
            });
          })
        );
        await prisma.user.update({
          where: { id: userId },
          data: { cart: {} },
        });
      } else {
        await Promise.all(
          orderIdsArray.map(async (orderId) => {
            await prisma.order.delete({
              where: { id: orderId },
            });
          })
        );
      }
    };

    // Handle subscription events
    const handleSubscription = async (session) => {
      try {
        await prisma.$transaction(async (tx) => {
          const user = await tx.user.findFirst({
            where: {
              stripeCustomerId: session.customer,
            },
          });

          if (!user) {
            throw new Error(`User not found for customer ID: ${session.customer}`);
          }

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
        console.error(`❌ Error processing subscription:`, error);
        throw error;
      }
    };

    // Handle all event types
    switch (event.type) {
      // One-time payments
      case "payment_intent.succeeded":
        await handlePaymentIntent(event.data.object.id, true);
        break;

      case "payment_intent.canceled":
        await handlePaymentIntent(event.data.object.id, false);
        break;

      // Subscription events
      case "checkout.session.completed":
        const session = event.data.object;
        if (session.mode === 'subscription') {
          await handleSubscription(session);
        }
        break;

      // Add more subscription events as needed
      case "customer.subscription.deleted":
        // Handle subscription cancellation
        const subscription = event.data.object;
        await prisma.user.updateMany({
          where: { 
            stripeCustomerId: subscription.customer,
            subscriptionId: subscription.id 
          },
          data: { 
            isPlusMember: false,
            subscriptionId: null
          },
        });
        break;

      default:
        console.log("Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const config = {
  api: { bodyParser: false },
};