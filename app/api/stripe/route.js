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

    // Handle subscription events
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;

        // Handle subscription checkout completion
        if (session.mode === "subscription") {
          await handleSubscriptionSession(session);
        }
        // Handle one-time payment checkout completion
        else if (session.mode === "payment") {
          await handlePaymentSession(session);
        }
        break;

      case "customer.subscription.updated":
        const updatedSubscription = event.data.object;
        await handleSubscriptionUpdate(updatedSubscription);
        break;

      case "customer.subscription.deleted":
        const canceledSubscription = event.data.object;
        await handleSubscriptionCancellation(canceledSubscription);
        break;

      case "invoice.payment_succeeded":
        const invoice = event.data.object;
        if (invoice.subscription) {
          await handleSuccessfulInvoice(invoice);
        }
        break;

      case "invoice.payment_failed":
        const failedInvoice = event.data.object;
        if (failedInvoice.subscription) {
          await handleFailedInvoice(failedInvoice);
        }
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

// Handle subscription checkout completion
// Handle subscription checkout completion
async function handleSubscriptionSession(session) {
  try {
    console.log("Processing subscription session:", session.id);
    console.log("Session customer:", session.customer);
    console.log("Session metadata:", session.metadata);

    // Get the subscription details to check its status
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription
    );

    let user = null;

    // Try to find user by metadata userId first (most reliable)
    if (session.metadata && session.metadata.userId) {
      user = await prisma.user.findUnique({
        where: { id: session.metadata.userId },
      });
      console.log("Found user by metadata userId:", user?.id);
    }

    // If not found, try by Stripe customer ID
    if (!user && session.customer) {
      user = await prisma.user.findFirst({
        where: { stripeCustomerId: session.customer },
      });
      console.log("Found user by stripeCustomerId:", user?.id);
    }

    // If still not found, try by email from customer details
    if (!user && session.customer_details && session.customer_details.email) {
      user = await prisma.user.findFirst({
        where: { email: session.customer_details.email },
      });
      console.log("Found user by email:", user?.id);
    }

    if (!user) {
      console.error("User not found for session:", session.id);
      console.error("Available data:", {
        metadataUserId: session.metadata?.userId,
        customerId: session.customer,
        email: session.customer_details?.email
      });
      throw new Error(`User not found for session: ${session.id}`);
    }

    // Update user with Stripe customer ID if not set
    if (session.customer && !user.stripeCustomerId) {
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: session.customer },
      });
      console.log("Updated user with stripeCustomerId:", session.customer);
    }

    // Activate Plus membership
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isPlusMember: true,
        subscriptionId: session.subscription,
        subscriptionStatus: subscription.status,
      },
    });

    console.log(`✅ Plus membership activated for user: ${user.email}`);
    console.log(`Subscription ID: ${session.subscription}`);
    console.log(`Subscription Status: ${subscription.status}`);
    
  } catch (error) {
    console.error("Error handling subscription session:", error);
    throw error;
  }
}

// Handle one-time payment sessions
async function handlePaymentSession(session) {
  try {
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

      console.log(
        `✅ Payment processed for ${orderIdsArray.length} orders for user: ${userId}`
      );
    }
  } catch (error) {
    console.error("Error handling payment session:", error);
    throw error;
  }
}

// Handle subscription updates
async function handleSubscriptionUpdate(subscription) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { stripeCustomerId: subscription.customer },
          { subscriptionId: subscription.id },
        ],
      },
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: subscription.status,
          isPlusMember:
            subscription.status === "active" ||
            subscription.status === "trialing",
        },
      });
      console.log(
        `📝 Subscription updated for user: ${user.email}, status: ${subscription.status}`
      );
    }
  } catch (error) {
    console.error("Error updating subscription:", error);
  }
}

// Handle subscription cancellation
async function handleSubscriptionCancellation(subscription) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { stripeCustomerId: subscription.customer },
          { subscriptionId: subscription.id },
        ],
      },
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isPlusMember: false,
          subscriptionStatus: "canceled",
          subscriptionId: null,
        },
      });
      console.log(`❌ Plus membership canceled for user: ${user.email}`);
    }
  } catch (error) {
    console.error("Error canceling subscription:", error);
  }
}

// Handle successful invoice payments
async function handleSuccessfulInvoice(invoice) {
  try {
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: invoice.customer },
    });

    if (user) {
      console.log(`💰 Invoice paid for user: ${user.email}`);
      // You can add additional logic here for successful payments
    }
  } catch (error) {
    console.error("Error handling successful invoice:", error);
  }
}

// Handle failed invoice payments
async function handleFailedInvoice(invoice) {
  try {
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: invoice.customer },
    });

    if (user) {
      console.log(`❌ Invoice payment failed for user: ${user.email}`);
      // You might want to send an email notification here
    }
  } catch (error) {
    console.error("Error handling failed invoice:", error);
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
