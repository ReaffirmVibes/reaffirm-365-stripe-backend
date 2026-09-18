const ALLOWED_ORIGINS = [
  "https://reaffirm365.com",
  "https://www.reaffirm365.com",
  "https://reaffirm-vibes-new.vibepreview.com",
  "https://preview-1786334744485514226.vibepreview.com",
];

module.exports = async (req, res) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { token, honeypot, timingMs } = req.body || {};

    if (honeypot && String(honeypot).trim() !== "") {
      return res.status(400).json({ verified: false, reason: "bot" });
    }

    if (typeof timingMs === "number" && timingMs < 2000) {
      return res.status(400).json({ verified: false, reason: "too_fast" });
    }

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
