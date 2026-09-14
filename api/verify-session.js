const Stripe = require("stripe");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const sessionId = req.query.session_id;

    if (!sessionId) {
      return res.status(400).json({ error: "Missing session_id" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return res.status(200).json({
      status: session.payment_status,
      customerEmail: session.customer_email || session.customer_details?.email,
      amountTotal: session.amount_total,
    });
  } catch (error) {
    console.error("Session verify error:", error);
    return res.status(500).json({
      error: "Failed to verify session",
      message: error.message,
    });
  }
};
