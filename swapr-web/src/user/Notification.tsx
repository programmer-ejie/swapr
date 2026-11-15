const notifications = [
  {
    title: 'Buyer asked about your listing',
    text: 'Mika Reyes asked if Gaming Joy Stick is still available.',
    time: '5 minutes ago',
    icon: 'ti-message-circle',
    type: 'Order',
    unread: true,
  },
  {
    title: 'Meetup reminder',
    text: 'Confirm your meetup schedule for USB-C Fast Charger today.',
    time: '28 minutes ago',
    icon: 'ti-calendar-time',
    type: 'Meetup',
    unread: true,
  },
  {
    title: 'Listing performance update',
    text: 'Smart Watch Pro received 18 views and 3 saves this week.',
    time: '1 hour ago',
    icon: 'ti-chart-bar',
    type: 'Listing',
    unread: false,
  },
  {
    title: 'Profile is now public',
    text: 'Your seller profile is visible to buyers in your area.',
    time: 'Yesterday',
    icon: 'ti-shield-check',
    type: 'Account',
    unread: false,
  },
];

const summaryItems = [
  ['Unread', '2', 'ti-bell-ringing'],
  ['Buyer actions', '8', 'ti-users'],
  ['Tasks today', '3', 'ti-checkup-list'],
];

function Notification() {
  return (
    <>
      <div className="page-hero notification-hero">
        <div>
          <span>Activity center</span>
          <h1>Notifications</h1>
          <p>Track buyer messages, meetup tasks, listing updates, and account alerts.</p>
        </div>
        <div className="page-hero-badge">
          <i className="ti ti-bell-ringing" />
          2 new
        </div>
      </div>

      <section className="notification-dashboard">
        <div className="notification-summary">
          {summaryItems.map(([label, value, icon]) => (
            <article className="notification-summary-card" key={label}>
              <i className={`ti ${icon}`} />
              <div>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="notification-tabs" aria-label="Notification filters">
          {['All', 'Orders', 'Meetups', 'Listings', 'Account'].map((tab, index) => (
            <button className={index === 0 ? 'active' : ''} type="button" key={tab}>
              {tab}
            </button>
          ))}
        </div>

        <div className="notification-feed">
          <div className="notification-feed-heading">
            <div>
              <h2>Today</h2>
              <p>Newest marketplace activity first</p>
            </div>
            <button type="button">Mark all as read</button>
          </div>

          {notifications.map((notification) => (
            <article className={`notification-feed-item ${notification.unread ? 'unread' : ''}`} key={notification.title}>
              <div className="notification-feed-icon">
                <i className={`ti ${notification.icon}`} />
              </div>
              <div className="notification-feed-copy">
                <div>
                  <span>{notification.type}</span>
                  <time>{notification.time}</time>
                </div>
                <h3>{notification.title}</h3>
                <p>{notification.text}</p>
              </div>
              <button type="button" aria-label={`Open ${notification.title}`}>
                <i className="ti ti-chevron-right" />
              </button>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default Notification;
