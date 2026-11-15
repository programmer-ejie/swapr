import productImages from "../product-images.json";
import { FormEvent, useState } from "react";
import { api, Category, errorMessage, Listing, readImage } from "../api";
import { useApi } from "../useApi";
import ListingCards from "./ListingCards";

type Shop = { name: string; city: string; description: string };
const blank = {
  name: "",
  description: "",
  category: "",
  price: 0,
  quantity: 1,
  condition: "Good",
  location: "",
  image: "",
  status: "live",
};
export default function MyShop({ searchQuery = "" }: { searchQuery?: string }) {
  const result = useApi<{
    shop: Shop | null;
    stats: { listings: number; chats: number; meetups: number };
  }>("/shop", { shop: null, stats: { listings: 0, chats: 0, meetups: 0 } });
  const listings = useApi<{ listings: Listing[] }>("/shop/listings", {
    listings: [],
  });
  const categories = useApi<{ categories: Category[] }>("/categories", {
    categories: [],
  });
  const [tab, setTab] = useState("workspace");
  const [editor, setEditor] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [draft, setDraft] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  const saveShop = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    void run(async () => {
      await api("/shop", {
        method: "PUT",
        body: JSON.stringify({
          name: form.get("name"),
          city: form.get("city"),
          description: form.get("description"),
        }),
      });
      result.reload();
      setMessage("Shop saved.");
    });
  };
  const saveListing = (e: FormEvent) => {
    e.preventDefault();
    void run(async () => {
      await api(editingId ? `/listings/${editingId}` : "/listings", {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify(draft),
      });
      setEditor(false);
      setTab("products");
      listings.reload();
      result.reload();
      setMessage("Listing saved.");
    });
  };
  return (
    <>
      <div className="shop-hero">
        <div>
          <span className="shop-kicker">Seller workspace</span>
          <h1>My Shop</h1>
          <p>Manage your shop and real marketplace listings.</p>
        </div>
        <button
          className="shop-add-button"
          type="button"
          onClick={() => {
            setDraft({ ...blank, location: result.data.shop?.city || "" });
            setEditingId("");
            setEditor(true);
            setError("");
          }}
        >
          Add product
        </button>
      </div>
      <div className="shop-tabs">
        <button
          className={tab === "workspace" ? "active" : ""}
          onClick={() => setTab("workspace")}
        >
          Shop Workspace
        </button>
        <button
          className={tab === "products" ? "active" : ""}
          onClick={() => setTab("products")}
        >
          My Products
        </button>
      </div>
      {(error || result.error || listings.error || categories.error) && (
        <p className="api-error" role="alert">
          {error || result.error || listings.error || categories.error}
        </p>
      )}
      {message && <p role="status">{message}</p>}
      {(result.loading || listings.loading) && <p>Loading shop...</p>}
      {tab === "workspace" ? (
        <>
          <div className="shop-stats">
            {[
              ["Active listings", result.data.stats.listings],
              ["Buyer chats", result.data.stats.chats],
              ["Meetups pending", result.data.stats.meetups],
            ].map(([label, value]) => (
              <div className="shop-stat" key={label}>
                <div>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              </div>
            ))}
          </div>
          {result.data.shop && (
            <form
              className="shop-panel shop-product-form"
              key={JSON.stringify(result.data.shop)}
              onSubmit={saveShop}
            >
              <h2>Shop information</h2>
              <label>
                Shop name
                <input
                  className="form-control"
                  name="name"
                  maxLength={120}
                  defaultValue={result.data.shop.name}
                />
              </label>
              <label>
                Meetup city
                <input
                  className="form-control"
                  name="city"
                  maxLength={160}
                  defaultValue={result.data.shop.city}
                />
              </label>
              <label>
                Description
                <textarea
                  className="form-control"
                  name="description"
                  maxLength={2000}
                  defaultValue={result.data.shop.description}
                />
              </label>
              <button className="shop-submit-button" disabled={busy}>
                Save shop
              </button>
            </form>
          )}
        </>
      ) : (
        <ListingCards
          listings={listings.data.listings.filter((l) =>
            `${l.name} ${l.status} ${l.location}`
              .toLowerCase()
              .includes(searchQuery.toLowerCase()),
          )}
          onEdit={(l) => {
            setEditingId(l.id);
            setDraft({
              name: l.name,
              description: l.description,
              category: l.category,
              price: Number(l.price),
              quantity: Math.max(1, l.quantity),
              condition: l.condition,
              location: l.location,
              image: l.image,
              status: l.status === "draft" ? "draft" : "live",
            });
            setEditor(true);
            setError("");
          }}
        />
      )}
      {editor && (
        <>
          <div
            className="shop-offcanvas-backdrop"
            onClick={() => !busy && setEditor(false)}
          />
          <aside className="shop-offcanvas" aria-label="Listing editor">
            <div className="shop-offcanvas-header">
              <h2>{editingId ? "Manage listing" : "Add product"}</h2>
              <button
                type="button"
                disabled={busy}
                onClick={() => setEditor(false)}
                aria-label="Close listing editor"
              >
                &times;
              </button>
            </div>
            <form className="shop-product-form" onSubmit={saveListing}>
              <label>
                Photo (PNG, JPEG or WebP, up to 2 MB)
                {draft.image && (
                  <img
                    className="listing-preview"
                    src={draft.image}
                    alt="Listing preview"
                  />
                )}
                <input
                  className="form-control"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      void run(async () => {
                        const image = await readImage(file);
                        setDraft((d) => ({ ...d, image }));
                      });
                  }}
                />
              </label>
              <details className="product-image-library">
                <summary>Choose an existing product photo</summary>
                <div className="product-image-options">
                  {Object.entries(productImages)
                    .filter(([path]) => !path.includes("default_product"))
                    .map(([path, url]) => (
                      <button
                        key={path}
                        type="button"
                        disabled={busy}
                        aria-label={`Use ${path.split("/").pop()}`}
                        aria-pressed={draft.image === url}
                        onClick={() => setDraft({ ...draft, image: url })}
                      >
                        <img
                          loading="lazy"
                          src={url}
                          alt={path.split("/").pop()}
                        />
                      </button>
                    ))}
                </div>
              </details>
              <label>
                Product name
                <input
                  className="form-control"
                  required
                  maxLength={160}
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </label>
              <label>
                Category
                <select
                  className="form-select"
                  required
                  value={draft.category}
                  onChange={(e) =>
                    setDraft({ ...draft, category: e.target.value })
                  }
                >
                  <option value="">Select category</option>
                  {categories.data.categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>
              <div className="shop-form-grid">
                <label>
                  Price (PHP)
                  <input
                    className="form-control"
                    required
                    type="number"
                    min="0"
                    max="9999999999.99"
                    step="0.01"
                    value={draft.price}
                    onChange={(e) =>
                      setDraft({ ...draft, price: Number(e.target.value) })
                    }
                  />
                </label>
                <label>
                  Quantity
                  <input
                    className="form-control"
                    required
                    type="number"
                    min="1"
                    max="100000"
                    value={draft.quantity}
                    onChange={(e) =>
                      setDraft({ ...draft, quantity: Number(e.target.value) })
                    }
                  />
                </label>
              </div>
              <label>
                Condition
                <select
                  className="form-select"
                  value={draft.condition}
                  onChange={(e) =>
                    setDraft({ ...draft, condition: e.target.value })
                  }
                >
                  {[
                    "Like new",
                    "Excellent",
                    "Good",
                    "Used",
                    "New open box",
                  ].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                Meetup location
                <input
                  className="form-control"
                  required
                  maxLength={160}
                  value={draft.location}
                  onChange={(e) =>
                    setDraft({ ...draft, location: e.target.value })
                  }
                />
              </label>
              <label>
                Description
                <textarea
                  className="form-control"
                  maxLength={4000}
                  value={draft.description}
                  onChange={(e) =>
                    setDraft({ ...draft, description: e.target.value })
                  }
                />
              </label>
              <label>
                Status
                <select
                  className="form-select"
                  value={draft.status}
                  onChange={(e) =>
                    setDraft({ ...draft, status: e.target.value })
                  }
                >
                  <option value="live">Live</option>
                  <option value="draft">Draft</option>
                </select>
              </label>
              {error && <p role="alert">{error}</p>}
              <button className="shop-submit-button" disabled={busy}>
                {busy ? "Saving..." : "Save listing"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  disabled={busy}
                  onClick={() => {
                    if (
                      window.confirm(
                        "Archive this listing? It will be hidden from the marketplace.",
                      )
                    )
                      void run(async () => {
                        await api(`/listings/${editingId}`, {
                          method: "DELETE",
                        });
                        setEditor(false);
                        listings.reload();
                        result.reload();
                      });
                  }}
                >
                  Archive listing
                </button>
              )}
            </form>
          </aside>
        </>
      )}
    </>
  );
}
