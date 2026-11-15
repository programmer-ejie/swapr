import { useState } from 'react';
import product1 from './assets/images/product-1.webp';
import product2 from './assets/images/product-2.webp';
import product4 from './assets/images/product-4.webp';

const myProducts = [
  {
    name: 'Gaming Joy Stick',
    price: 'PHP 520.87',
    oldPrice: 'PHP 690.00',
    tag: 'Live',
    quantity: 3,
    condition: 'Good',
    location: 'Manila',
    image: product1,
  },
  {
    name: 'Wireless Earphones',
    price: 'PHP 430.75',
    tag: 'Draft',
    quantity: 8,
    condition: 'Like new',
    location: 'Makati',
    image: product2,
  },
  {
    name: 'USB-C Fast Charger',
    price: 'PHP 349.50',
    quantity: 12,
    condition: 'New open box',
    location: 'Pasig',
    image: product4,
  },
];

interface MyShopProps {
  searchQuery?: string;
}

function MyShop({ searchQuery = '' }: MyShopProps) {
  const [activeShopTab, setActiveShopTab] = useState<'workspace' | 'products'>('workspace');
  const [productOffcanvasOpen, setProductOffcanvasOpen] = useState(false);
  const [productOffcanvasClosing, setProductOffcanvasClosing] = useState(false);
  const [productImagePreview, setProductImagePreview] = useState('');
  const productOffcanvasVisible = productOffcanvasOpen || productOffcanvasClosing;
  const visibleMyProducts = myProducts.filter((product) =>
    `${product.name} ${product.condition} ${product.location} ${product.tag ?? ''}`
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase())
  );

  const openProductOffcanvas = () => {
    setProductOffcanvasClosing(false);
    setProductOffcanvasOpen(true);
  };

  const closeProductOffcanvas = () => {
    setProductOffcanvasClosing(true);
    setProductOffcanvasOpen(false);
    window.setTimeout(() => {
      setProductOffcanvasClosing(false);
      setProductImagePreview('');
    }, 260);
  };

  return (
    <>
      <div className="shop-hero">
        <div>
          <span className="shop-kicker">Seller workspace</span>
          <h1>My Shop</h1>
          <p>Manage your public profile, meetup preferences, and active listings.</p>
        </div>
        <button className="shop-add-button" type="button" onClick={openProductOffcanvas}>
          <i className="ti ti-plus" />
          Add product
        </button>
      </div>

      <div className="shop-tabs" role="tablist" aria-label="Shop sections">
        <button
          className={activeShopTab === 'workspace' ? 'active' : ''}
          type="button"
          role="tab"
          aria-selected={activeShopTab === 'workspace'}
          onClick={() => setActiveShopTab('workspace')}
        >
          <i className="ti ti-layout-dashboard" />
          Shop Workspace
        </button>
        <button
          className={activeShopTab === 'products' ? 'active' : ''}
          type="button"
          role="tab"
          aria-selected={activeShopTab === 'products'}
          onClick={() => setActiveShopTab('products')}
        >
          <i className="ti ti-box-seam" />
          My Products
        </button>
      </div>

      {activeShopTab === 'workspace' ? (
        <>
          <div className="shop-stats">
            {[
              ['Active listings', '32', 'ti-box-seam'],
              ['Buyer chats', '94', 'ti-message-circle'],
              ['Meetups pending', '18', 'ti-calendar-time'],
            ].map(([label, value, icon]) => (
              <div className="shop-stat" key={label}>
                <i className={`ti ${icon}`} />
                <div>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="shop-layout">
            <section className="shop-panel">
              <div className="shop-panel-heading">
                <div>
                  <h2>Shop Information</h2>
                  <p>These details appear on your public seller profile.</p>
                </div>
                <span>Public</span>
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Shop name</label>
                  <input className="form-control" defaultValue="Swapr Finds" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Meetup city</label>
                  <input className="form-control" defaultValue="Manila" />
                </div>
                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={4} defaultValue="Ukay treasures and preloved favorites. Honest condition notes, fair prices, and local meetups." />
                </div>
              </div>
            </section>

            <aside className="shop-status-card">
              <div className="shop-status-icon">
                <i className="ti ti-building-store" />
              </div>
              <h2>Shop Status</h2>
              <p>Active seller profile</p>
              <div className="shop-status-meter">
                <span style={{ width: '82%' }} />
              </div>
              <small>Profile strength: 82%</small>
            </aside>
          </div>
        </>
      ) : (
        <section className="shop-products-section">
          <div className="shop-panel-heading">
            <div>
              <h2>My Products</h2>
              <p>Listings you created and manage in your shop.</p>
            </div>
          </div>

          <div className="user-product-grid">
            {visibleMyProducts.map((product) => (
              <article className="user-product-card" key={product.name}>
                {product.tag && <span className="user-product-tag">{product.tag}</span>}
                <button className="user-favorite-button" type="button" aria-label={`Save ${product.name}`}>
                  <i className="ti ti-heart" />
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
                  Manage listing
                </button>
              </article>
            ))}
          </div>
          {visibleMyProducts.length === 0 && (
            <div className="empty-products">
              <div className="empty-products-icon">
                <i className="ti ti-box-off" />
              </div>
              <h2>No matching products</h2>
              <p>Try searching by product name, condition, location, or listing status.</p>
            </div>
          )}
        </section>
      )}

      {productOffcanvasVisible && (
        <>
          <div
            className={`shop-offcanvas-backdrop ${productOffcanvasClosing ? 'closing' : ''}`}
            onClick={closeProductOffcanvas}
          />
          <aside className={`shop-offcanvas ${productOffcanvasClosing ? 'closing' : ''}`} aria-label="Add product form">
            <div className="shop-offcanvas-header">
              <div>
                <h2>Add product</h2>
                <p>Create a marketplace listing for meetup buyers.</p>
              </div>
              <button type="button" aria-label="Close add product form" onClick={closeProductOffcanvas}>
                <i className="ti ti-x" />
              </button>
            </div>
            <form className="shop-product-form">
              <div className="shop-product-tip">
                <i className="ti ti-bulb" />
                <div>
                  <strong>Listing tip</strong>
                  <span>Use a clear real photo, honest condition notes, and a public meetup location.</span>
                </div>
              </div>
              <label className="shop-photo-field">
                Product photo
                <span className="shop-photo-preview">
                  {productImagePreview ? (
                    <img src={productImagePreview} alt="Selected product preview" />
                  ) : (
                    <i className="ti ti-photo-plus" />
                  )}
                  <span className="shop-photo-action">
                    <i className="ti ti-camera-plus" />
                    Upload photo
                  </span>
                </span>
                <input
                  className="form-control"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    setProductImagePreview(file ? URL.createObjectURL(file) : '');
                  }}
                />
              </label>
              <label>
                Product name
                <input className="form-control" placeholder="Preloved denim jacket" />
              </label>
              <label>
                Category
                <select className="form-select" defaultValue="">
                  <option value="" disabled>
                    Select category
                  </option>
                  <option>Electronics</option>
                  <option>Fashion</option>
                  <option>Home Goods</option>
                  <option>Accessories</option>
                </select>
              </label>
              <div className="shop-form-grid">
                <label>
                  Price
                  <input className="form-control" placeholder="PHP 520.00" />
                </label>
                <label>
                  Quantity
                  <input className="form-control" type="number" min="1" placeholder="1" />
                </label>
              </div>
              <label>
                Condition
                <select className="form-select" defaultValue="Good">
                  <option>Like new</option>
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Used</option>
                </select>
              </label>
              <label>
                Description
                <textarea className="form-control" rows={4} placeholder="Describe condition, inclusions, and meetup notes." />
              </label>
              <button className="shop-submit-button" type="button" onClick={closeProductOffcanvas}>
                Publish listing
              </button>
            </form>
          </aside>
        </>
      )}
    </>
  );
}

export default MyShop;
