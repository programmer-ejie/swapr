const stats = [
  ['Revenue', 'PHP 25,000', '+5.2%', 'ti-wallet', 'primary'],
  ['Orders closed', '48', '+12.4%', 'ti-shopping-bag-check', 'success'],
  ['Avg. order value', 'PHP 521', '+3.1%', 'ti-receipt', 'info'],
  ['Conversion rate', '18.6%', '+2.8%', 'ti-trending-up', 'warning'],
];

const monthlySales = [
  ['Jan', 42],
  ['Feb', 58],
  ['Mar', 47],
  ['Apr', 76],
  ['May', 64],
  ['Jun', 88],
  ['Jul', 72],
  ['Aug', 94],
  ['Sep', 81],
  ['Oct', 108],
  ['Nov', 96],
  ['Dec', 118],
];

const categories = [
  ['Electronics', 'PHP 9,420', 82],
  ['Fashion', 'PHP 6,180', 58],
  ['Home Goods', 'PHP 4,750', 44],
  ['Accessories', 'PHP 3,260', 31],
];

const funnel = [
  ['Listing views', '2,840', 100],
  ['Buyer messages', '526', 72],
  ['Meetups set', '128', 46],
  ['Sales closed', '48', 28],
];

function SalesAnalytics() {
  return (
    <>
      <div className="analytics-hero">
        <div>
          <span>Sales intelligence</span>
          <h1>Sales Analytics</h1>
          <p>Track revenue, listing demand, and buyer conversion across your marketplace activity.</p>
        </div>
        <button type="button">
          <i className="ti ti-download" />
          Export report
        </button>
      </div>

      <div className="analytics-stats">
        {stats.map(([label, value, growth, icon, tone]) => (
          <article className="analytics-stat-card" key={label}>
            <div className={`analytics-stat-icon bg-${tone}`}>
              <i className={`ti ${icon}`} />
            </div>
            <div>
              <p>{label}</p>
              <h2>{value}</h2>
              <span>{growth} vs last month</span>
            </div>
          </article>
        ))}
      </div>

      <div className="analytics-grid">
        <section className="analytics-panel analytics-sales-panel">
          <div className="analytics-panel-heading">
            <div>
              <h2>Monthly Sales</h2>
              <p>Revenue trend from completed marketplace transactions.</p>
            </div>
            <strong>PHP 25K</strong>
          </div>
          <div className="sales-chart" aria-label="Monthly sales chart">
            {monthlySales.map(([month, value]) => (
              <div className="sales-chart-bar" key={month}>
                <span style={{ height: `${value}%` }} />
                <small>{month}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="analytics-panel">
          <div className="analytics-panel-heading">
            <div>
              <h2>Category Revenue</h2>
              <p>Top performing product groups.</p>
            </div>
          </div>
          <div className="category-revenue-list">
            {categories.map(([label, value, percent]) => (
              <div className="category-revenue" key={label}>
                <div>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
                <div className="analytics-meter">
                  <span style={{ width: `${percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="analytics-grid secondary">
        <section className="analytics-panel">
          <div className="analytics-panel-heading">
            <div>
              <h2>Buyer Funnel</h2>
              <p>How shoppers move from interest to completed sales.</p>
            </div>
          </div>
          <div className="funnel-list">
            {funnel.map(([label, value, percent]) => (
              <div className="funnel-step" key={label}>
                <div>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
                <div className="analytics-meter">
                  <span style={{ width: `${percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="analytics-panel analytics-target-panel">
          <div className="analytics-ring" aria-label="Monthly target progress">
            <span>72%</span>
          </div>
          <div>
            <h2>Monthly Target</h2>
            <p>You reached 72% of this month&apos;s PHP 35,000 revenue goal.</p>
          </div>
        </section>
      </div>
    </>
  );
}

export default SalesAnalytics;
