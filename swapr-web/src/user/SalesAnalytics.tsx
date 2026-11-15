import { money } from "../api";
import { useApi } from "../useApi";
type Analytics = {
  summary: { orders: number; revenue: string; average: string };
  monthly: { month: string; revenue: string }[];
  categories: { title: string; revenue: string }[];
};
export default function SalesAnalytics() {
  const result = useApi<Analytics>("/analytics", {
    summary: { orders: 0, revenue: "0", average: "0" },
    monthly: [],
    categories: [],
  });
  const { summary, monthly, categories } = result.data;
  const maximum = Math.max(1, ...monthly.map((m) => Number(m.revenue)));
  const download = () => {
    const rows = [
      ["Metric", "Value"],
      ["Revenue", summary.revenue],
      ["Orders", String(summary.orders)],
      ["Average order value", summary.average],
    ];
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "swapr-sales.csv";
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <>
      <div className="analytics-hero">
        <div>
          <span>Sales intelligence</span>
          <h1>Sales Analytics</h1>
          <p>Actual completed meetup sales. Amounts are recorded in PHP.</p>
        </div>
        <button disabled={result.loading || !!result.error} onClick={download}>
          Export report
        </button>
      </div>
      {result.error && <p role="alert">{result.error}</p>}
      {result.loading && <p>Loading analytics...</p>}
      <div className="analytics-stats">
        {[
          ["Revenue", money(summary.revenue)],
          ["Orders closed", summary.orders],
          ["Average order value", money(summary.average)],
        ].map(([label, value]) => (
          <article className="analytics-stat-card" key={label}>
            <div>
              <p>{label}</p>
              <h2>{value}</h2>
              <span>All completed sales</span>
            </div>
          </article>
        ))}
      </div>
      <div className="analytics-grid">
        <section className="analytics-panel">
          <h2>Monthly sales</h2>
          <div className="sales-chart">
            {monthly.map((m) => (
              <div
                className="sales-chart-bar"
                key={m.month}
                title={money(m.revenue)}
              >
                <span
                  style={{ height: `${(Number(m.revenue) / maximum) * 100}%` }}
                />
                <small>{m.month}</small>
              </div>
            ))}
          </div>
          {!monthly.length && (
            <p>
              No completed sales yet. Complete a confirmed meetup to record a
              sale.
            </p>
          )}
        </section>
        <section className="analytics-panel">
          <h2>Category revenue</h2>
          {categories.map((c) => (
            <div className="category-revenue" key={c.title}>
              <strong>{c.title}</strong>
              <span>{money(c.revenue)}</span>
            </div>
          ))}
          {!categories.length && <p>No category revenue yet.</p>}
        </section>
      </div>
    </>
  );
}
