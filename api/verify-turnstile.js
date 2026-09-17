// Server-side anti-bot verification for form submissions.
// Re-checks honeypot + timing and validates the Cloudflare Turnstile token.
//
// Env vars (set in Vercel):
//   TURNSTILE_SECRET_KEY  — Cloudflare Turnstile secret key (optional;
//                           when absent, only honeypot + timing apply)

module.exports = async (req, res) => {
  // CORS — allow the storefront origin
  const allowedOrigin = process.env.CLIENT_ORIGIN || "https://reaffirm365.com";
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { token, honeypot, timingMs } = req.body || {};

    // 1. Server-side honeypot — bots fill the hidden field
    if (honeypot && String(honeypot).trim() !== "") {
      return res.status(400).json({ verified: false, reason: "bot" });
    }

    // 2. Server-side time gate — bots submit too fast
    if (typeof timingMs === "number" && timingMs < 2000) {
      return res.status(400).json({ verified: false, reason: "too_fast" });
    }

    // 3. Cloudflare Turnstile token verification (when configured)
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (token && secret) {
      const verifyRes = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ response: token, secret }),
        },
      );
      const result = await verifyRes.json();
      if (!result.success) {
        return res
          .status(400)
          .json({ verified: false, reason: "turnstile_failed" });
      }
    }

    return res.status(200).json({ verified: true });
  } catch (error) {
    console.error("Turnstile verify error:", error);
    return res.status(500).json({
      verified: false,
      error: "Verification failed",
      message: error.message,
    });
  }
};
