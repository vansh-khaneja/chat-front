import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { markUserAsPremium } from "@/utils/updateUser";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response("Webhook Error", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const userId = session?.metadata?.userId;

    if (!userId) {
      console.error("❌ userId not found in session metadata.");
      return new Response("Missing userId", { status: 400 });
    }

    try {
      await markUserAsPremium({ userId });
      console.log("✅ User marked as premium.");
    } catch (err) {
      console.error("❌ Failed to update user:", err);
    }
  }

  return new Response("Success", { status: 200 });
}
