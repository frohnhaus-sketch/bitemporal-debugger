import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("TRACK BODY", body);
    console.log("SUPABASE_URL", process.env.SUPABASE_URL);

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("events")
      .insert({
        event: body.event,
        data: body.data ?? null,
      })
      .select();

    if (error) {
      console.error("SUPABASE INSERT ERROR", error);
      return Response.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    console.log("SUPABASE INSERT DATA", data);

    return Response.json({ ok: true, data });
  } catch (error) {
    console.error("TRACK ROUTE ERROR", error);
    return Response.json({ ok: false, error: String(error) }, { status: 500 });
  }
}