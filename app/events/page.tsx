import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return (
      <main style={{ padding: 32 }}>
        <h1>Event Dashboard</h1>
        <p>Missing Supabase environment variables.</p>
      </main>
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return <pre>{error.message}</pre>;
  }

  const counts =
    events?.reduce<Record<string, number>>((acc, e) => {
      acc[e.event] = (acc[e.event] ?? 0) + 1;
      return acc;
    }, {}) ?? {};

  return (
    <main style={{ padding: 32, fontFamily: "Arial" }}>
      <h1>Event Dashboard</h1>

      <h2>Counts</h2>
      <ul>
        {Object.entries(counts).map(([event, count]) => (
          <li key={event}>
            {event}: {count}
          </li>
        ))}
      </ul>

      <h2>Latest Events</h2>
      <table cellPadding={8} style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Time</th>
            <th>Event</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {events?.map((e) => (
            <tr key={e.id}>
              <td>{new Date(e.created_at).toLocaleString()}</td>
              <td>{e.event}</td>
              <td>
                <pre>{JSON.stringify(e.data, null, 2)}</pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}