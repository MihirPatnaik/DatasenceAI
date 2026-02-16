// src/smartsocial/utils/stripeService.ts

import { loadStripe } from "@stripe/stripe-js";

// ⚠️ Only use the publishable key here
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";

// Create singleton Stripe instance
let stripePromise: Promise<any>;
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

/**
 * Redirect user to Stripe Checkout
 * @param {string} priceId - Stripe Price ID (from your dashboard)
 * @param {string} userId - Firestore user ID
 */
export async function redirectToCheckout(priceId: string, userId: string) {
  const stripe = await getStripe();
  if (!stripe) throw new Error("❌ Stripe failed to initialize");

  try {
    // ✅ Call backend session creator
    const response = await fetch("http://localhost:5001/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId, userId }),
    });

    const session = await response.json();
    if (session.error) {
      console.error("❌ Stripe session error:", session.error);
      return;
    }

    // ✅ Redirect to Stripe-hosted checkout
    const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
    if (error) {
      console.error("❌ Stripe redirect error:", error.message);
    }
  } catch (err) {
    console.error("🔥 redirectToCheckout failed:", err);
  }
}
