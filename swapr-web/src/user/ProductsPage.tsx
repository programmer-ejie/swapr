import { useMemo, useState } from 'react';
import product1 from './assets/images/product-1.webp';
import product2 from './assets/images/product-2.webp';
import product3 from './assets/images/product-3.webp';
import product4 from './assets/images/product-4.webp';
import product5 from './assets/images/product-5.webp';

type ProductCategory = 'gaming' | 'audio' | 'wearables' | 'chargers';
type SortOption = 'featured' | 'price-low' | 'price-high';

const products = [
  {
    name: 'Gaming Joy Stick',
    category: 'gaming',
    price: 'PHP 520.87',
    oldPrice: 'PHP 690.00',
    tag: 'Save',
    quantity: 3,
    condition: 'Good',
    location: 'Manila',
    image: product1,
  },
  {
    name: 'Wireless Earphones',
    category: 'audio',
    price: 'PHP 430.75',
    oldPrice: 'PHP 520.00',
    tag: 'Deal',
    quantity: 8,
    condition: 'Like new',
    location: 'Makati',
    image: product2,
  },
  {
    name: 'Smart Watch Pro',
    category: 'wearables',
    price: 'PHP 1,250.00',
    oldPrice: 'PHP 1,499.00',
    tag: 'Save',
    quantity: 2,
    condition: 'Excellent',
    location: 'Quezon City',
    image: product3,
  },
  {
    name: 'USB-C Fast Charger',
    category: 'chargers',
    price: 'PHP 349.50',
    quantity: 12,
    condition: 'New open box',
    location: 'Pasig',
    image: product4,
  },
  {
    name: 'Bluetooth Speaker',
    category: 'audio',
    price: 'PHP 620.30',
    quantity: 5,
    condition: 'Good',
    location: 'Taguig',
    image: product5,
  },
] satisfies {
  name: string;
  category: ProductCategory;
  price: string;
  oldPrice?: string;
  tag?: string;
  quantity: number;
  condition: string;
  location: string;
  image: string;
}[];

const priceValue = (price: string) => Number(price.replace(/[^\d.]/g, ''));

interface ProductsPageProps {
  searchQuery?: string;
}

function ProductsPage({ searchQuery = '' }: ProductsPageProps) {
  const [sortOption, setSortOption] = useState<SortOption>('featured');
  const [savedProducts, setSavedProducts] = useState<string[]>([]);
  const discountedProducts = products.filter((product) => product.oldPrice).length;
  const lowStockProducts = products.filter((product) => product.quantity <= 3).length;
  const insightItems = [
    ['Listings', products.length.toString(), 'ti-box-seam'],
    ['Discounted', discountedProducts.toString(), 'ti-ticket'],
    ['Low stock', lowStockProducts.toString(), 'ti-alert-triangle'],
    ['Meetup-ready', products.length.toString(), 'ti-map-pin'],
  ];

  const visibleProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products
      .filter((product) => {
        if (!query) {
          return true;
        }

        return `${product.name} ${product.category} ${product.tag ?? ''}`.toLowerCase().includes(query);
      })
      .sort((first, second) => {
        if (sortOption === 'price-low') {
          return priceValue(first.price) - priceValue(second.price);
        }

        if (sortOption === 'price-high') {
          return priceValue(second.price) - priceValue(first.price);
        }

        return 0;
      });
  }, [searchQuery, sortOption]);

  const toggleSavedProduct = (productName: string) => {
    setSavedProducts((currentProducts) =>
      currentProducts.includes(productName)
        ? currentProducts.filter((name) => name !== productName)
        : [...currentProducts, productName]
    );
  };

  return (
    <>
      <div className="page-hero marketplace-hero">
        <div>
          <span>Community marketplace</span>
          <h1>Marketplace</h1>
          <p>Shop ukay treasures, affordable fashion, and everyday preloved finds from sellers near you.</p>
        </div>
        <div className="page-hero-badge">
          <i className="ti ti-map-pin" />
          Nearby listings
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="product-filter-bar">
            <div className="product-insight-strip" aria-label="Listing overview">
              {insightItems.map(([label, value, icon]) => (
                <div className="product-insight" key={label}>
                  <i className={`ti ${icon}`} />
                  <span>{value}</span>
                  <small>{label}</small>
                </div>
              ))}
            </div>
            <label className="product-sort">
              <span>Sort</span>
              <select value={sortOption} onChange={(event) => setSortOption(event.target.value as SortOption)}>
                <option value="featured">Featured</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </select>
            </label>
          </div>

          <div className="user-product-grid">
            {visibleProducts.map((product) => (
              <article className="user-product-card" key={product.name}>
                {product.tag && <span className="user-product-tag">{product.tag}</span>}
                <button
                  className={`user-favorite-button ${savedProducts.includes(product.name) ? 'active' : ''}`}
                  type="button"
                  aria-label={`${savedProducts.includes(product.name) ? 'Unsave' : 'Save'} ${product.name}`}
                  aria-pressed={savedProducts.includes(product.name)}
                  onClick={() => toggleSavedProduct(product.name)}
                >
                  <i className={`ti ${savedProducts.includes(product.name) ? 'ti-heart-filled' : 'ti-heart'}`} />
                </button>
                <div className="user-product-image">
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="user-product-info">
                  <h2>{product.name}</h2>
                  <p>
                    {product.price}
                    {product.oldPrice && <span>{product.oldPrice}</span>}
                  </p>
                  <div className="user-product-meta" aria-label={`${product.name} details`}>
                    <span title="Quantity available">
                      <i className="ti ti-package" />
                      {product.quantity}
                    </span>
                    <span title="Condition">
                      <i className="ti ti-sparkles" />
                      {product.condition}
                    </span>
                    <span title="Meetup location">
                      <i className="ti ti-map-pin" />
                      {product.location}
                    </span>
                  </div>
                </div>
                <button className="user-chat-button" type="button">
                  Chat seller
                </button>
              </article>
            ))}
          </div>
          {visibleProducts.length === 0 && (
            <div className="empty-products">
              <div className="empty-products-icon">
                <i className="ti ti-search-off" />
              </div>
              <h2>No matching finds</h2>
              <p>Try a different keyword or browse one of the popular searches below.</p>
              <div className="empty-product-suggestions" aria-label="Suggested searches">
                {['audio', 'charger', 'watch', 'gaming'].map((suggestion) => (
                  <span key={suggestion}>{suggestion}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ProductsPage;
