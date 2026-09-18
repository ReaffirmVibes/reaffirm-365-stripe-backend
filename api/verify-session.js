const Stripe = require("stripe");

const ALLOWED_ORIGINS = [
  "https://reaffirm365.com",
  "https://www.reaffirm365.com",
  "https://reaffirm-vibes-new.vibepreview.com",
  "https://preview-1786334744485514226.vibepreview.com",
];

const setCors = (req, res) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
};

module.exports = async (req, res) => {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const sessionId =
      (req.method === "GET" ? req.query.session_id : req.body?.session_id) ||
      req.query.session_id;

    if (!sessionId) {
      return res.status(400).json({ error: "Missing session_id" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "shipping_details", "customer_details"],
    });

    const shipping = session.shipping_details || {};
    const shippingAddress = shipping.address || {};
    const customerDetails = session.customer_details || {};

    return res.status(200).json({
      status: session.payment_status,
      sessionId: session.id,
      customerEmail: session.customer_email || customerDetails.email,
      customerName:
        shipping.name || customerDetails.name || session.metadata?.customerName,
      phone:
        customerDetails.phone || session.metadata?.phone || shipping.phone,
      amountTotal: session.amount_total,
      currency: session.currency,
      metadata: session.metadata || {},
      lineItems: (session.line_items?.data || []).map((li) => ({
        name: li.description,
        quantity: li.quantity,
        amountTotal: li.amount_total,
      })),
      shippingAddress: {
        line1: shippingAddress.line1,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postal_code: shippingAddress.postal_code,
        country: shippingAddress.country,
      },
    });
  } catch (error) {
    console.error("Session verify error:", error);
    return res.status(500).json({
      error: "Failed to verify session",
      message: error.message,
    });
  }
};
