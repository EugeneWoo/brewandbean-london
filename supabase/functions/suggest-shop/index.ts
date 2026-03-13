import { corsHeaders } from "../_shared/cors.ts";

function sanitize(str: string): string {
  return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requesterName, requesterEmail, shopName, mapsUrl, reason } = await req.json();

    if (!requesterName || !requesterEmail || !shopName || !mapsUrl) {
      return new Response(JSON.stringify({ error: "requesterName, requesterEmail, shopName and mapsUrl are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isValidMapsUrl =
      mapsUrl.includes("maps.google.com") ||
      mapsUrl.includes("maps.app.goo.gl") ||
      mapsUrl.includes("goo.gl/maps") ||
      mapsUrl.includes("share.google");

    if (!isValidMapsUrl) {
      return new Response(JSON.stringify({ error: "mapsUrl must be a Google Maps URL" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const safeRequesterName = sanitize(requesterName);
    const safeRequesterEmail = sanitize(requesterEmail);
    const safeShopName = sanitize(shopName);
    const safeMapsUrl = sanitize(mapsUrl);
    const safeReason = reason ? sanitize(reason) : null;

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Brew & Bean <onboarding@resend.dev>",
        to: ["eugene.hw.woo@gmail.com"],
        subject: `Coffee Shop Suggestion: ${safeShopName}`,
        html: `
          <h2>New Coffee Shop Suggestion</h2>
          <p><strong>From:</strong> ${safeRequesterName} (${safeRequesterEmail})</p>
          <p><strong>Shop Name:</strong> ${safeShopName}</p>
          <p><strong>Google Maps URL:</strong> <a href="${safeMapsUrl}">${safeMapsUrl}</a></p>
          <p><strong>Reason:</strong> ${safeReason ?? "No reason provided"}</p>
        `,
      }),
    });

    if (!emailRes.ok) {
      const body = await emailRes.text();
      throw new Error(`Resend error: ${body}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to send suggestion" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
