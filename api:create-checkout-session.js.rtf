const Stripe = require("stripe");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const origin = process.env.CLIENT_ORIGIN || "https://reaffirm365.com";

    const {
      items,
      customerEmail,
      shippingAddress,
      shippingCost,
      taxAmount,
      discountAmount,
      promoCode,
      metadata,
    } = req.body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items in cart" });
    }

    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : undefined,
        },
        unit_amount: item.price,
      },
      quantity: item.quantity || 1,
    }));

    if (shippingCost && shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Shipping" },
          unit_amount: shippingCost,
        },
        quantity: 1,
      });
    }

    if (taxAmount && taxAmount > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Sales Tax" },
          unit_amount: taxAmount,
        },
        quantity: 1,
      });
    }

    if (promoCode && discountAmount && discountAmount > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: `Discount (${promoCode})` },
          unit_amount: -discountAmount,
        },
        quantity: 1,
      });
    }

    const sessionOptions = {
      mode: "payment",
      line_items: lineItems,
      customer_email: customerEmail || undefined,
      success_url: `${origin}/checkout?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?status=cancelled`,
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      // No payment_method_types restriction — Stripe automatically shows
      // all payment methods enabled in your Dashboard (card, Apple Pay,
      // Google Pay, Afterpay, Klarna, etc.)
      metadata: {
        promoCode: promoCode || "",
        source: "reaffirm-365-website",
        ...metadata,
      },
    };

    if (shippingAddress) {
      sessionOptions.shipping_address = {
        line1: shippingAddress.line1,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postal_code: shippingAddress.postal_code,
        country: shippingAddress.country || "US",
      };
    }

    const session = await stripe.checkout.sessions.create(sessionOptions);

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("Stripe Checkout error:", error);
    return res.status(500).json({
      error: "Failed to create checkout session",
      message: error.message,
    });
  }
};
