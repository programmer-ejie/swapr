import { FormEvent, useEffect, useRef, useState } from "react";
import { api, errorMessage, money } from "../api";
import { useApi } from "../useApi";
import avatar from "./assets/images/user-default.webp";

type Conversation = {
  id: string;
  name: string;
  product: string;
  preview: string | null;
  buyer_id: string;
  seller_id: string;
  price: string;
};
type Message = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};
type Meetup = {
  id: string;
  location: string;
  scheduled_at: string;
  status: string;
  proposed_by: string;
  agreed_price: string;
};
function ConversationChat({
  conversation,
  userId,
  onBack,
}: {
  conversation: Conversation;
  userId: string;
  onBack: () => void;
}) {
  const result = useApi<{ messages: Message[]; meetups: Meetup[] }>(
    `/conversations/${conversation.id}/messages`,
    { messages: [], meetups: [] },
    3000,
  );
  const [draft, setDraft] = useState("");
  const [meetupForm, setMeetupForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView?.({ block: "nearest" });
  }, [result.data.messages.length]);
  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await action();
      result.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  const send = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    void run(async () => {
      await api(`/conversations/${conversation.id}/messages`, {
        method: "POST",
        body: JSON.stringify({ body: draft }),
      });
      setDraft("");
    });
  };
  const propose = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    void run(async () => {
      await api(`/conversations/${conversation.id}/meetups`, {
        method: "POST",
        body: JSON.stringify({
          location: form.get("location"),
          scheduledAt: new Date(String(form.get("scheduledAt"))).toISOString(),
          agreedPrice: Number(form.get("price")),
        }),
      });
      setMeetupForm(false);
    });
  };
  const activeMeetup = result.data.meetups.find(
    (m) => m.status !== "cancelled",
  );
  return (
    <section
      className="messenger-chat"
      aria-label={`Conversation with ${conversation.name}`}
    >
      <div className="messenger-chat-header">
        <button
          className="messenger-mobile-back"
          type="button"
          aria-label="Back to conversations"
          onClick={onBack}
        >
          <i className="ti ti-arrow-left" />
        </button>
        <div className="messenger-chat-person">
          <img className="avatar rounded-circle" src={avatar} alt="" />
          <div>
            <h2>{conversation.name}</h2>
            <p>{conversation.product}</p>
          </div>
        </div>
        <button
          type="button"
          disabled={!!activeMeetup}
          onClick={() => setMeetupForm(!meetupForm)}
        >
          Set meetup
        </button>
      </div>
      {(error || result.error) && <p role="alert">{error || result.error}</p>}
      {meetupForm && (
        <form className="meetup-form" onSubmit={propose}>
          <label>
            Public meetup location
            <input
              className="form-control"
              name="location"
              required
              maxLength={200}
            />
          </label>
          <label>
            Date and time
            <input
              className="form-control"
              name="scheduledAt"
              type="datetime-local"
              required
            />
          </label>
          <label>
            Agreed price (PHP)
            <input
              className="form-control"
              name="price"
              type="number"
              min="0"
              max="9999999999.99"
              step="0.01"
              defaultValue={conversation.price}
              required
            />
          </label>
          <button className="btn btn-primary" disabled={busy}>
            Propose meetup
          </button>
        </form>
      )}
      {result.data.meetups.map((m) => (
        <div className="meetup-card" key={m.id}>
          <strong>{m.status}</strong> &middot; {m.location} &middot;{" "}
          {new Date(m.scheduled_at).toLocaleString()} &middot; {money(m.agreed_price)}
          <div className="d-flex gap-2 mt-2">
            {m.status === "proposed" && m.proposed_by !== userId && (
              <button
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    await api(`/meetups/${m.id}`, {
                      method: "PATCH",
                      body: JSON.stringify({ status: "confirmed" }),
                    });
                  })
                }
              >
                Confirm meetup
              </button>
            )}
            {m.status === "confirmed" && conversation.seller_id === userId && (
              <button
                disabled={busy}
                onClick={() => {
                  if (
                    window.confirm(
                      "Confirm the item was exchanged and payment received? This records one sale.",
                    )
                  )
                    void run(async () => {
                      await api(`/meetups/${m.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({ status: "completed" }),
                      });
                    });
                }}
              >
                Complete sale
              </button>
            )}
            {["proposed", "confirmed"].includes(m.status) && (
              <button
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    await api(`/meetups/${m.id}`, {
                      method: "PATCH",
                      body: JSON.stringify({ status: "cancelled" }),
                    });
                  })
                }
              >
                Cancel meetup
              </button>
            )}
          </div>
        </div>
      ))}
      <div className="messenger-chat-body">
        {result.loading && <p>Loading messages...</p>}
        {!result.loading && !result.data.messages.length && (
          <p>
            Start the conversation. Agree on a public meetup and inspect the
            item before paying.
          </p>
        )}
        {result.data.messages.map((m) => (
          <div
            className={`message-bubble ${m.sender_id === userId ? "buyer" : "seller"}`}
            key={m.id}
          >
            <p>{m.body}</p>
            <small>{new Date(m.created_at).toLocaleTimeString()}</small>
          </div>
        ))}
        <div ref={end} />
      </div>
      <form className="messenger-reply-box" onSubmit={send}>
        <input
          aria-label="Message"
          maxLength={4000}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a reply..."
          required
        />
        <button
          className="send"
          disabled={busy || !draft.trim()}
          aria-label="Send reply"
        >
          <i className="ti ti-send-2" />
        </button>
      </form>
    </section>
  );
}
export default function Messages({ userId }: { userId: string }) {
  const result = useApi<{ conversations: Conversation[] }>(
    "/conversations",
    { conversations: [] },
    5000,
  );
  const [active, setActive] = useState(
    () => new URLSearchParams(window.location.search).get("conversation") || "",
  );
  const [mobileChat, setMobileChat] = useState(() =>
    Boolean(new URLSearchParams(window.location.search).get("conversation")),
  );
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  useEffect(() => {
    const sync = () =>
      setActive(
        new URLSearchParams(window.location.search).get("conversation") || "",
      );
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  const visible = result.data.conversations.filter(
    (c) =>
      (role === "all" ||
        (role === "seller" ? c.seller_id === userId : c.buyer_id === userId)) &&
      `${c.name} ${c.product}`.toLowerCase().includes(search.toLowerCase()),
  );
  const current = visible.find((c) => c.id === active) || visible[0];
  return (
    <div className="messages-workspace">
      {result.error && <p role="alert">{result.error}</p>}
      <section className={`messenger-shell ${mobileChat ? "chat-open" : ""}`}>
        <aside className="messenger-list" aria-label="Conversations">
          <div className="messenger-list-header">
            <h2>Conversations</h2>
            <select
              aria-label="Conversation role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="all">All conversations</option>
              <option value="seller">I am the seller</option>
              <option value="buyer">I am the buyer</option>
            </select>
          </div>
          <div className="messenger-search">
            <input
              aria-label="Search conversations"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
            />
          </div>
          {result.loading && <p>Loading conversations...</p>}
          {!result.loading && !visible.length && (
            <p className="p-3">
              No conversations yet. Open a listing and choose Chat seller.
            </p>
          )}
          <div className="messenger-thread-list">
            {visible.map((c) => (
              <button
                className={`messenger-thread ${current?.id === c.id ? "active" : ""}`}
                type="button"
                key={c.id}
                onClick={() => {
                  setActive(c.id);
                  setMobileChat(true);
                  window.history.replaceState(
                    {},
                    "",
                    `/user/messages?conversation=${c.id}`,
                  );
                }}
              >
                <span className="messenger-avatar">
                  <img src={avatar} alt="" />
                </span>
                <span className="messenger-thread-copy">
                  <strong>{c.name}</strong>
                  <em>{c.product}</em>
                  <p>{c.preview || "Start a conversation"}</p>
                </span>
              </button>
            ))}
          </div>
        </aside>
        {current && (
          <ConversationChat
            key={current.id}
            conversation={current}
            userId={userId}
            onBack={() => setMobileChat(false)}
          />
        )}
      </section>
    </div>
  );
}
