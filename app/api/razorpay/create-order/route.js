import Razorpay from "razorpay";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { amount } = await req.json();

    if (!amount) {
      return NextResponse.json(
        { error: "Amount is required" },
        { status: 400 }
      );
    }

    const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_dummy_key";
    const key_secret = process.env.RAZORPAY_KEY_SECRET || "dummy_secret_key";

    // SIMULATION MODE: If the user hasn't added Real keys, return a mocked order
    if (key_id === "rzp_test_dummy_key") {
      return NextResponse.json(
        {
          id: "order_dummy_" + Date.now(),
          amount: Math.round(amount * 100),
          currency: "INR",
        },
        { status: 200 }
      );
    }

    // Initialize Razorpay instance with Test API Keys
    const razorpay = new Razorpay({ key_id, key_secret });

    // Razorpay accepts amount in paise (smallest currency unit), so multiply by 100
    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      payment_capture: 1, // Automatically capture payment
    };

    // Create the order
    const order = await razorpay.orders.create(options);

    // Return the generated order ID and details
    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("Razorpay Submitting Error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

