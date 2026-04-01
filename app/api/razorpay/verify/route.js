import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const key_secret = process.env.RAZORPAY_KEY_SECRET || "dummy_secret_key";
    
    // SIMULATION MODE
    if (key_secret === "dummy_secret_key") {
      return NextResponse.json(
        { success: true, message: "Simulated verification successful" },
        { status: 200 }
      );
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required properties" }, { status: 400 });
    }

    // Creating the digest to verify the signature
    const generated_signature = crypto
      .createHmac("sha256", key_secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    // Check if the generated signature matches the razorpay_signature
    const isAuthentic = generated_signature === razorpay_signature;

    if (isAuthentic) {
      // Signature is genuine. The frontend can now safely save payment details to the real-time database.
      return NextResponse.json({ success: true, message: "Payment has been verified successfully" }, { status: 200 });
    } else {
      // Payment verification failed
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }
  } catch (error) {
    console.error("Razorpay Verification Error:", error);
    return NextResponse.json({ error: "Payment verification failed internal error" }, { status: 500 });
  }
}

