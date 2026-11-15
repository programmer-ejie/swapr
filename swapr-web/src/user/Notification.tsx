import { useState } from "react";
import { api, errorMessage, Notice, openConversation } from "../api";
import { useApi } from "../useApi";
export default function Notification() {
  const result = useApi<{ notifications: Notice[] }>(
    "/notifications",
    { notifications: [] },
    10000,
  );
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const unread = result.data.notifications.filter((n) => !n.read_at).length;
  const read = async () => {
    setBusy(true);
    try {
      await api("/notifications/read", { method: "PATCH" });
      result.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <div className="page-hero notification-hero">
        <div>
          <span>Activity center</span>
          <h1>Notifications</h1>
          <p>{unread} unread updates</p>
        </div>
      </div>
      {(error || result.error) && <p role="alert">{error || result.error}</p>}
      <div className="notification-tabs">
        {["All", "Message", "Meetup", "Listing", "Account"].map((t) => (
          <button
            className={filter === t ? "active" : ""}
            key={t}
            onClick={() => setFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="notification-feed">
        <div className="notification-feed-heading">
          <h2>Latest activity</h2>
          <button disabled={busy || !unread} onClick={() => void read()}>
            Mark all as read
          </button>
        </div>
        {result.loading && <p>Loading notifications...</p>}
        {result.data.notifications
          .filter((n) => filter === "All" || n.type === filter)
          .map((n) => (
            <article
              className={`notification-feed-item ${n.read_at ? "" : "unread"}`}
              key={n.id}
            >
              <div className="notification-feed-copy">
                <span>
                  {n.type} &middot; {new Date(n.created_at).toLocaleString()}
                </span>
                <h3>{n.title}</h3>
                <p>{n.text}</p>
                {n.conversation_id && (
                  <button onClick={() => openConversation(n.conversation_id!)}>
                    Open conversation
                  </button>
                )}
              </div>
            </article>
          ))}
        {!result.loading &&
          !result.error &&
          !result.data.notifications.length && <p>No notifications yet.</p>}
      </div>
    </>
  );
}
