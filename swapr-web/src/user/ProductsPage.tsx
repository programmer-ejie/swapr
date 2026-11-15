import { useState } from "react";
import { Listing } from "../api";
import { useApi } from "../useApi";
import ListingCards from "./ListingCards";

export default function ProductsPage({
  searchQuery = "",
  userId,
}: {
  searchQuery?: string;
  userId?: string;
}) {
  const [sort, setSort] = useState("featured");
  const [savedOnly, setSavedOnly] = useState(false);
  const result = useApi<{ listings: Listing[] }>(
    `/listings?q=${encodeURIComponent(searchQuery)}`,
    { listings: [] },
  );
  const favorites = useApi<{ favorites: { listing_id: string }[] }>(
    "/favorites",
    { favorites: [] },
    10000,
  );
  const listings = [...result.data.listings].filter(
    (l) =>
      !savedOnly || favorites.data.favorites.some((f) => f.listing_id === l.id),
  );
  if (sort !== "featured")
    listings.sort(
      (a, b) =>
        (Number(a.price) - Number(b.price)) * (sort === "price-low" ? 1 : -1),
    );
  return (
    <>
      <div className="page-hero marketplace-hero">
        <div>
          <span>Community marketplace</span>
          <h1>Marketplace</h1>
          <p>Discover real preloved listings and arrange a public meetup.</p>
        </div>
      </div>
      <div className="product-filter-bar">
        <span>{listings.length} listings</span>
        <label>
          <input
            type="checkbox"
            checked={savedOnly}
            onChange={(e) => {
              setSavedOnly(e.target.checked);
              favorites.reload();
            }}
          />{" "}
          Saved only
        </label>
        <label className="product-sort">
          Sort{" "}
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="featured">Newest</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </label>
      </div>
      {result.loading && <p role="status">Loading listings...</p>}
      {result.error && (
        <p role="alert">
          {result.error} <button onClick={result.reload}>Retry</button>
        </p>
      )}
      {!result.loading && !result.error && (
        <ListingCards
          listings={listings}
          userId={userId}
          onFavoritesChange={favorites.reload}
        />
      )}
    </>
  );
}
