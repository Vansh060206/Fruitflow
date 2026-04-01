import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { cartItems, userData, totalAmount, orderId, wholesalerId } = await req.json();

    // Detect origin from headers for correct redirection on mobile/ngrok
    const host = req.headers.get("host");
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const origin = `${protocol}://${host}`;

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: cartItems.map((item) => ({
        price_data: {
          currency: "inr",
          product_data: {
            name: item.name,
            description: `Fresh Fruits from ${item.wholesalerId}`,
          },
          unit_amount: Math.round((item.proposedPrice || item.price) * 110),
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      customer_email: userData.email,
      success_url: `${origin}/retailer/checkout/success?session_id={CHECKOUT_SESSION_ID}${orderId ? "&order_id=" + orderId : ""}${wholesalerId ? "&wholesaler_id=" + wholesalerId : ""}`,
      cancel_url: `${origin}/retailer/${orderId ? "orders" : "cart"}`,
      metadata: {
        userId: userData.uid,
        userName: userData.name,
        // Stringify full cart items if needed, but Stripe metadata has a 500 character limit per key
        // So we just store basic IDs and identifiers
      },
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
