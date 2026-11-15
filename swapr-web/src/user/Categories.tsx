import { Category, Listing } from "../api";
import { useApi } from "../useApi";
import ListingCards from "./ListingCards";

export default function Categories({
  searchQuery = "",
  selectedSlug = "",
  onSelectCategory,
  onBack,
  userId,
}: {
  searchQuery?: string;
  selectedSlug?: string;
  onSelectCategory: (slug: string) => void;
  onBack: () => void;
  userId?: string;
}) {
  const result = useApi<{ categories: Category[] }>("/categories", {
    categories: [],
  });
  const listings = useApi<{ listings: Listing[] }>(
    `/listings?category=${encodeURIComponent(selectedSlug)}&q=${encodeURIComponent(searchQuery)}`,
    { listings: [] },
  );
  const selected = result.data.categories.find((c) => c.slug === selectedSlug);
  return (
    <>
      <div className="page-hero">
        <div>
          <h1>{selected?.title || "Categories"}</h1>
          <p>Browse preloved finds by category.</p>
        </div>
        {selected && (
          <button type="button" onClick={onBack}>
            Back to categories
          </button>
        )}
      </div>
      {result.error && <p role="alert">{result.error}</p>}
      {result.loading && <p role="status">Loading categories...</p>}
      {selected ? (
        <>
          {listings.error && <p role="alert">{listings.error}</p>}
          {listings.loading ? (
            <p>Loading listings...</p>
          ) : (
            !listings.error && (
              <ListingCards listings={listings.data.listings} userId={userId} />
            )
          )}
        </>
      ) : (
        <div className="row g-4">
          {result.data.categories
            .filter((c) =>
              c.title.toLowerCase().includes(searchQuery.toLowerCase()),
            )
            .map((c) => (
              <div className="col-md-4" key={c.slug}>
                <button
                  className="shop-panel w-100 text-start"
                  type="button"
                  onClick={() => onSelectCategory(c.slug)}
                >
                  <i className={`ti ${c.icon}`} />
                  <h2>{c.title}</h2>
                  <p>{c.listing_count} listings</p>
                </button>
              </div>
            ))}
        </div>
      )}
    </>
  );
}
