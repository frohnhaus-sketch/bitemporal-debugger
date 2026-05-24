import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function EventsPage() {
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
    <main style={{ padding: 32 }}>
      <h1>Event Dashboard</h1>

      <ul>
        {Object.entries(counts).map(([event, count]) => (
          <li key={event}>
            {event}: {count}
          </li>
        ))}
      </ul>

      <table>
        <tbody>
          {events?.map((e) => (
            <tr key={e.id}>
              <td>{new Date(e.created_at).toLocaleString()}</td>
              <td>{e.event}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}