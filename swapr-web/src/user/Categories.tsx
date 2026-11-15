import product1 from './assets/images/product-1.webp';
import product2 from './assets/images/product-2.webp';
import product3 from './assets/images/product-3.webp';
import product4 from './assets/images/product-4.webp';
import product5 from './assets/images/product-5.webp';

const categories = [
  { title: 'Electronics', count: '18 listings', icon: 'ti-device-gamepad-2', tone: 'primary', slug: 'electronics' },
  { title: 'Phones & Tablets', count: '21 listings', icon: 'ti-device-mobile', tone: 'info', slug: 'phones-tablets' },
  { title: 'Computers', count: '14 listings', icon: 'ti-device-laptop', tone: 'primary', slug: 'computers' },
  { title: 'Fashion', count: '24 listings', icon: 'ti-shirt', tone: 'danger', slug: 'fashion' },
  { title: 'Shoes', count: '11 listings', icon: 'ti-shoe', tone: 'secondary', slug: 'shoes' },
  { title: 'Accessories', count: '16 listings', icon: 'ti-headphones', tone: 'warning', slug: 'accessories' },
  { title: 'Beauty & Care', count: '9 listings', icon: 'ti-sparkles', tone: 'danger', slug: 'beauty-care' },
  { title: 'Home Goods', count: '12 listings', icon: 'ti-home', tone: 'success', slug: 'home-goods' },
  { title: 'Furniture', count: '8 listings', icon: 'ti-armchair', tone: 'success', slug: 'furniture' },
  { title: 'Books & Media', count: '19 listings', icon: 'ti-book', tone: 'info', slug: 'books-media' },
  { title: 'School Supplies', count: '7 listings', icon: 'ti-school', tone: 'primary', slug: 'school-supplies' },
  { title: 'Sports & Fitness', count: '15 listings', icon: 'ti-ball-football', tone: 'success', slug: 'sports-fitness' },
  { title: 'Baby & Kids', count: '6 listings', icon: 'ti-baby-carriage', tone: 'warning', slug: 'baby-kids' },
  { title: 'Vehicles', count: '5 listings', icon: 'ti-car', tone: 'secondary', slug: 'vehicles' },
  { title: 'Bikes', count: '10 listings', icon: 'ti-bike', tone: 'success', slug: 'bikes' },
  { title: 'Tools & Hardware', count: '13 listings', icon: 'ti-tools', tone: 'warning', slug: 'tools-hardware' },
  { title: 'Garden & Plants', count: '8 listings', icon: 'ti-plant', tone: 'success', slug: 'garden-plants' },
  { title: 'Cameras', count: '4 listings', icon: 'ti-camera', tone: 'info', slug: 'cameras' },
  { title: 'Gifts & Collectibles', count: '17 listings', icon: 'ti-gift', tone: 'danger', slug: 'gifts-collectibles' },
  { title: 'Art & Crafts', count: '6 listings', icon: 'ti-palette', tone: 'primary', slug: 'art-crafts' },
  { title: 'Services', count: '3 listings', icon: 'ti-briefcase', tone: 'secondary', slug: 'services' },
  { title: 'Health & Wellness', count: '5 listings', icon: 'ti-heartbeat', tone: 'danger', slug: 'health-wellness' },
];

const categoryProducts = [
  { name: 'Gaming Joy Stick', category: 'Electronics', price: 'PHP 520.87', oldPrice: 'PHP 690.00', tag: 'Save', image: product1 },
  { name: 'Wireless Earphones', category: 'Accessories', price: 'PHP 430.75', oldPrice: 'PHP 520.00', tag: 'Deal', image: product2 },
  { name: 'Smart Watch Pro', category: 'Electronics', price: 'PHP 1,250.00', oldPrice: 'PHP 1,499.00', tag: 'Save', image: product3 },
  { name: 'USB-C Fast Charger', category: 'Electronics', price: 'PHP 349.50', image: product4 },
  { name: 'Bluetooth Speaker', category: 'Accessories', price: 'PHP 620.30', image: product5 },
];

interface CategoriesProps {
  searchQuery?: string;
  selectedSlug?: string;
  onSelectCategory: (slug: string) => void;
  onBack: () => void;
}

function Categories({ searchQuery = '', selectedSlug = '', onSelectCategory, onBack }: CategoriesProps) {
  const selectedCategory = categories.find((category) => category.slug === selectedSlug);
  const visibleCategories = categories.filter((category) =>
    `${category.title} ${category.count}`.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );
  const products =
    selectedCategory?.title === 'Accessories'
      ? categoryProducts.filter((product) => product.category === 'Accessories')
      : selectedCategory
      ? categoryProducts.filter((product) => product.category === 'Electronics')
      : [];

  if (selectedCategory) {
    return (
      <>
        <div className="category-detail-hero">
          <button type="button" onClick={onBack}>
            <i className="ti ti-arrow-left" />
            Categories
          </button>
          <div className={`category-detail-icon bg-${selectedCategory.tone}`}>
            <i className={`ti ${selectedCategory.icon}`} />
          </div>
          <div>
            <h1>{selectedCategory.title}</h1>
            <p>{selectedCategory.count} from Swapr users near you</p>
          </div>
        </div>

        <div className="user-product-grid">
          {products.map((product) => (
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
                <div className="user-product-meta">
                  <span>
                    <i className="ti ti-package" /> 3
                  </span>
                  <span>
                    <i className="ti ti-sparkles" /> Verified
                  </span>
                  <span>
                    <i className="ti ti-map-pin" /> Nearby
                  </span>
                </div>
              </div>
              <button className="user-chat-button" type="button">
                Chat seller
              </button>
            </article>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-hero categories-hero">
        <div>
          <span>Browse by group</span>
          <h1>Categories</h1>
          <p>Explore marketplace listings by product type, lifestyle, and local demand.</p>
        </div>
        <div className="page-hero-badge">
          <i className="ti ti-category" />
          {visibleCategories.length} groups
        </div>
      </div>
      <div className="category-grid">
        {visibleCategories.map((category) => (
          <button
            className={`category-card category-card-${category.tone}`}
            key={category.title}
            type="button"
            onClick={() => onSelectCategory(category.slug)}
          >
            <span className={`category-card-icon bg-${category.tone}`}>
              <i className={`ti ${category.icon}`} />
            </span>
            <span className="category-card-copy">
              <strong>{category.title}</strong>
              <small>{category.count}</small>
            </span>
            <i className="ti ti-arrow-up-right category-card-arrow" />
          </button>
        ))}
      </div>
      {visibleCategories.length === 0 && (
        <div className="empty-products">
          <div className="empty-products-icon">
            <i className="ti ti-category" />
          </div>
          <h2>No matching categories</h2>
          <p>Try searching for electronics, fashion, home, sports, or accessories.</p>
        </div>
      )}
    </>
  );
}

export default Categories;
