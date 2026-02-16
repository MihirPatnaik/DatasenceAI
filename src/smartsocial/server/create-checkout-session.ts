// src/smartsocial/server/create-checkout-session.ts
import express, { Request, Response } from "express";
import Stripe from "stripe";
import cors from "cors";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-01-27",
});

// POST /create-checkout-session
app.post("/create-checkout-session", async (req: Request, res: Response) => {
  try {
    const { priceId, userId } = req.body;

    if (!priceId || !userId) {
      return res.status(400).json({ error: "Missing priceId or userId" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { userId },
      success_url: "http://localhost:5173/home?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:5173/onboarding/step4",
    });

    return res.json({ id: session.id, url: session.url });
  } catch (err: any) {
    console.error("❌ Stripe session error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ✅ Ensure Express app export for Firebase/Node
export default app;
