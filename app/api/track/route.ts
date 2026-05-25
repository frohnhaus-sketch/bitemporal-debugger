import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 🔍 Request Metadata holen
    const userAgent = req.headers.get("user-agent") || "";
    const referer = req.headers.get("referer") || "";
    const forwardedFor =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "";

    // 🔐 IP anonymisieren (hashen)
    const ipHash = forwardedFor
      ? crypto.createHash("sha256").update(forwardedFor).digest("hex")
      : null;

    // 🚫 Eigene Events ignorieren (localhost + dev)
    const isLocal =
      referer.includes("localhost") ||
      referer.includes("127.0.0.1");

    if (isLocal) {
      return Response.json({ ok: true, skipped: "local_event" });
    }

    const { data, error } = await supabase
      .from("events")
      .insert({
        event: body.event,
        data: body.data ?? null,
        referer,
        user_agent: userAgent,
        ip_hash: ipHash,
      })
      .select();

    if (error) {
      console.error("SUPABASE INSERT ERROR", error);
      return Response.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return Response.json({ ok: true, data });
  } catch (error) {
    console.error("TRACK ROUTE ERROR", error);
    return Response.json(
      { ok: false, error: String(error) },
      { status: 500 }
    );
  }
}