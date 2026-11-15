import { useState } from "react";
import { api, chatWithSeller, errorMessage, Listing, money } from "../api";
import { useApi } from "../useApi";
import productImages from "../product-images.json";
const placeholder =
  productImages["src/user/assets/images/default_product_image.webp"];

export default function ListingCards({
  listings,
  userId,
  onEdit,
  onFavoritesChange,
}: {
  listings: Listing[];
  userId?: string;
  onEdit?: (listing: Listing) => void;
  onFavoritesChange?: () => void;
}) {
  const favorites = useApi<{ favorites: { listing_id: string }[] }>(
    "/favorites",
    { favorites: [] },
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const action = async (id: string, run: () => Promise<unknown>) => {
    setBusy(id);
    setError("");
    try {
      await run();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy("");
    }
  };
  return (
    <>
      {(error || favorites.error) && (
        <p role="alert" className="api-error">
          {error || favorites.error}
        </p>
      )}
      <div className="user-product-grid">
        {listings.map((product) => {
          const saved = favorites.data.favorites.some(
            (f) => f.listing_id === product.id,
          );
          return (
            <article className="user-product-card" key={product.id}>
              <span className="user-product-tag">{product.status}</span>
              <button
                className={`user-favorite-button ${saved ? "active" : ""}`}
                type="button"
                disabled={busy === product.id}
                aria-label={`${saved ? "Unsave" : "Save"} ${product.name}`}
                aria-pressed={saved}
                onClick={() =>
                  void action(product.id, async () => {
                    await api(`/favorites/${product.id}`, {
                      method: saved ? "DELETE" : "PUT",
                    });
                    favorites.reload();
                    onFavoritesChange?.();
                  })
                }
              >
                <i className={`ti ${saved ? "ti-heart-filled" : "ti-heart"}`} />
              </button>
              <div className="user-product-image">
                <img src={product.image || placeholder} alt={product.name} />
              </div>
              <div className="user-product-info">
                <h2>{product.name}</h2>
                <p>{money(product.price)}</p>
                <p>{product.description}</p>
                <div className="user-product-meta">
                  <span>
                    <i className="ti ti-package" />
                    {product.quantity}
                  </span>
                  <span>
                    <i className="ti ti-sparkles" />
                    {product.condition}
                  </span>
                  <span>
                    <i className="ti ti-map-pin" />
                    {product.location}
                  </span>
                </div>
              </div>
              {onEdit ? (
                <button
                  className="user-chat-button"
                  type="button"
                  onClick={() => onEdit(product)}
                >
                  Manage listing
                </button>
              ) : (
                <button
                  className="user-chat-button"
                  type="button"
                  disabled={busy === product.id || product.seller_id === userId}
                  onClick={() =>
                    void action(product.id, () => chatWithSeller(product.id))
                  }
                >
                  {product.seller_id === userId
                    ? "Your listing"
                    : "Chat seller"}
                </button>
              )}
            </article>
          );
        })}
      </div>
      {!listings.length && (
        <div className="empty-products">
          <h2>No listings yet</h2>
          <p>Publish a listing in My Shop, or try another search.</p>
        </div>
      )}
    </>
  );
}
