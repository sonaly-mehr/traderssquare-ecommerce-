import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  let event;

  try {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    if (!sig) {
      return NextResponse.json(
        { error: "Missing stripe signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    console.log(`🪝 Processing webhook event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      // ==================== SUBSCRIPTION EVENTS ====================
      case "checkout.session.completed":
        const session = event.data.object;
        if (session.mode === "subscription") {
          await handleSubscriptionCheckoutCompleted(session);
        } else if (session.mode === "payment") {
          await handleOneTimePaymentCheckoutCompleted(session);
        }
        break;

      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;

      case "invoice.payment_succeeded":
        const invoice = event.data.object;
        if (invoice.subscription) {
          await handleSubscriptionInvoicePaid(invoice);
        }
        break;

      // ==================== ONE-TIME PAYMENT EVENTS ====================
      case "payment_intent.succeeded":
        await handleOneTimePaymentSucceeded(event.data.object);
        break;

      case "payment_intent.payment_failed":
        await handleOneTimePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ==================== SUBSCRIPTION HANDLERS ====================

async function handleSubscriptionCheckoutCompleted(session) {
  try {
    console.log("🔔 Handling subscription checkout completed:", session.id);
    
    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    
    // Find user by metadata (most reliable)
    const userId = session.metadata?.userId;
    if (!userId) {
      console.error("No user ID in session metadata");
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      console.error("User not found for ID:", userId);
      return;
    }

    // Update user with subscription details
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isPlusMember: true,
        subscriptionId: session.subscription,
        subscriptionStatus: subscription.status,
        stripeCustomerId: session.customer // Ensure this is set
      }
    });

    console.log(`✅ Subscription activated for user: ${user.email}`);
    console.log(`   Subscription ID: ${session.subscription}`);
    console.log(`   Status: ${subscription.status}`);
    
  } catch (error) {
    console.error("Error handling subscription checkout:", error);
  }
}

async function handleSubscriptionCreated(subscription) {
  try {
    console.log("🔔 Handling subscription created:", subscription.id);
    
    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { stripeCustomerId: subscription.customer },
          { subscriptionId: subscription.id }
        ]
      }
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isPlusMember: subscription.status === 'active',
          subscriptionId: subscription.id,
          subscriptionStatus: subscription.status
        }
      });
      console.log(`✅ Subscription created for user: ${user.email}`);
    }
  } catch (error) {
    console.error("Error handling subscription creation:", error);
  }
}

async function handleSubscriptionUpdated(subscription) {
  try {
    console.log("🔔 Handling subscription updated:", subscription.id);
    
    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { stripeCustomerId: subscription.customer },
          { subscriptionId: subscription.id }
        ]
      }
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isPlusMember: subscription.status === 'active',
          subscriptionStatus: subscription.status
        }
      });
      console.log(`📝 Subscription updated for user: ${user.email}, status: ${subscription.status}`);
    }
  } catch (error) {
    console.error("Error handling subscription update:", error);
  }
}

async function handleSubscriptionDeleted(subscription) {
  try {
    console.log("🔔 Handling subscription deleted:", subscription.id);
    
    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { stripeCustomerId: subscription.customer },
          { subscriptionId: subscription.id }
        ]
      }
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isPlusMember: false,
          subscriptionStatus: 'canceled',
          subscriptionId: null
        }
      });
      console.log(`❌ Subscription canceled for user: ${user.email}`);
    }
  } catch (error) {
    console.error("Error handling subscription deletion:", error);
  }
}

async function handleSubscriptionInvoicePaid(invoice) {
  try {
    console.log("🔔 Handling subscription invoice paid:", invoice.id);
    
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: invoice.customer }
    });

    if (user) {
      console.log(`💰 Subscription invoice paid for user: ${user.email}`);
      // You can add additional logic here for successful subscription renewals
    }
  } catch (error) {
    console.error("Error handling subscription invoice:", error);
  }
}

// ==================== ONE-TIME PAYMENT HANDLERS ====================

async function handleOneTimePaymentCheckoutCompleted(session) {
  try {
    console.log("💳 Handling one-time payment checkout completed:", session.id);
    
    const { orderIds, userId, appId } = session.metadata || {};

    if (appId !== "traderssquare") {
      console.log("Invalid app ID for session:", session.id);
      return;
    }

    if (orderIds && userId) {
      const orderIdsArray = orderIds.split(",");

      await Promise.all(
        orderIdsArray.map(async (orderId) => {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              isPaid: true,
              paymentStatus: "paid",
            },
          });
        })
      );

      // Clear user's cart
      await prisma.user.update({
        where: { id: userId },
        data: { cart: {} },
      });

      console.log(`✅ One-time payment processed for ${orderIdsArray.length} orders for user: ${userId}`);
    }
  } catch (error) {
    console.error("Error handling one-time payment checkout:", error);
  }
}

async function handleOneTimePaymentSucceeded(paymentIntent) {
  try {
    console.log("💳 Handling one-time payment succeeded:", paymentIntent.id);
    // Add your one-time payment success logic here
  } catch (error) {
    console.error("Error handling one-time payment success:", error);
  }
}

async function handleOneTimePaymentFailed(paymentIntent) {
  try {
    console.log("💳 Handling one-time payment failed:", paymentIntent.id);
    // Add your one-time payment failure logic here
  } catch (error) {
    console.error("Error handling one-time payment failure:", error);
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};