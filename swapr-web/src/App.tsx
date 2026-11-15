import { ComponentType, FormEvent, Suspense, lazy, useEffect, useState } from 'react';
import heroImage from './user/assets/images/asdasdsd.webp';
import howItWorksImage from './user/assets/images/icon2.webp';
import './App.css';

const USER_SESSION_KEY = 'swapr-user-session';
const USER_PATH = '/user/';
const USER_PRODUCTS_PATH = '/user/products';

const asset = (path: string) => (path.startsWith('/') ? path : `/home_template/${path}`);

const categories = [
  { title: 'Ukay Fashion', image: '/category-preloved-fits-photo.jpg' },
  { title: 'Everyday Preloved', image: '/category-daily-finds-photo.jpg' },
  { title: 'Preloved Home', image: '/category-room-goods-photo.jpg' },
];

const products = [
  {
    id: 1,
    name: 'Preloved Denim Jacket, Light Wash',
    price: 'PHP 520.87',
    oldPrice: 'PHP 690.00',
    tag: 'save',
    tagTone: 'sale',
    category: 'men',
    image: '/product_1.webp',
  },
  {
    id: 2,
    name: 'Secondhand Desk Lamp, Warm White',
    price: 'PHP 349.50',
    tag: 'new',
    tagTone: 'new',
    category: 'women',
    image: '/product_2.webp',
  },
  {
    id: 3,
    name: 'Vintage Tote Bag With Zipper',
    price: 'PHP 180.25',
    category: 'women',
    image: '/product_3.webp',
  },
  {
    id: 4,
    name: 'Used Study Chair, Good Condition',
    price: 'PHP 899.99',
    tag: 'sale',
    tagTone: 'sale',
    category: 'accessories',
    image: '/product_4.webp',
  },
  {
    id: 5,
    name: 'Preloved Wireless Headphones',
    price: 'PHP 430.75',
    category: 'men',
    image: '/product_5.webp',
  },
  {
    id: 6,
    name: 'Compact Camera, Tested Before Meetup',
    price: 'PHP 1,250.00',
    oldPrice: 'PHP 1,499.00',
    tag: 'deal',
    tagTone: 'sale',
    category: 'accessories',
    image: '/product_6.webp',
  },
  {
    id: 7,
    name: 'Minimal Shelf Decor Set',
    price: 'PHP 275.40',
    category: 'women',
    image: '/product_7.webp',
  },
  {
    id: 8,
    name: 'USB Microphone, Seller Meetup Only',
    price: 'PHP 620.30',
    category: 'accessories',
    image: '/product_8.webp',
  },
];

const benefits = [
  { icon: 'fa-comments-o', title: 'Realtime chat', text: 'Message sellers before meeting' },
  { icon: 'fa-map-marker', title: 'Meetup first', text: 'Agree on a safe nearby location' },
  { icon: 'fa-check-circle-o', title: 'Inspect items', text: 'Check condition before paying' },
  { icon: 'fa-money', title: 'PHP listings', text: 'Prices shown in Philippine pesos' },
];

const stories = [
  {
    title: 'How to check preloved items before meetup',
    image: '/guide-check-items.png',
    meta: 'Buyer guide',
  },
  {
    title: 'Simple ways to write a trustworthy listing',
    image: '/guide-trust-listing.png',
    meta: 'Seller tips',
  },
  {
    title: 'Choosing public meetup spots that feel safe',
    image: '/guide-safe-meetup.png',
    meta: 'Meetup guide',
  },
];

type Filter = 'all' | 'women' | 'accessories' | 'men';
type Product = (typeof products)[number];
type AuthTab = 'login' | 'register';
type NavItem = 'home' | 'shop' | 'deal' | 'stories' | 'contact' | 'auth';
type AuthModal = {
  type: 'success' | 'error';
  title: string;
  message: string;
} | null;
type AuthUser = {
  id: number;
  email: string;
  firstname?: string | null;
  middlename?: string | null;
  lname?: string | null;
  age?: number | null;
  gender?: string | null;
  birthdate?: string | null;
  placeOfBirth?: string | null;
  newUser?: boolean;
  profilePicUrl?: string | null;
  created_at?: string;
  updated_at?: string | null;
};

type ProductsProps = {
  onLogout: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  user: AuthUser | null;
  onUserUpdate: (user: AuthUser) => void;
};

const Products = lazy(() => import('./user/Products')) as ComponentType<ProductsProps>;

const API_BASE_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:4000';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const readStoredUser = (): AuthUser | null => {
  const session = window.localStorage.getItem(USER_SESSION_KEY);

  if (!session || session === 'active') {
    return null;
  }

  try {
    return JSON.parse(session) as AuthUser;
  } catch {
    window.localStorage.removeItem(USER_SESSION_KEY);
    return null;
  }
};

const systemSteps = [
  { icon: 'fa-pencil-square-o', title: 'Post a listing', text: 'List ukay finds and preloved favorites with a price, clear photos, sizing, and honest condition notes.' },
  { icon: 'fa-comments-o', title: 'Chat in realtime', text: 'Buyers message sellers first to ask questions and confirm availability.' },
  { icon: 'fa-map-marker', title: 'Set meetup place', text: 'Both sides agree on a public location because delivery is not available yet.' },
  { icon: 'fa-check-circle-o', title: 'Inspect then pay', text: 'Buyer checks the item during meetup before completing the PHP payment.' },
];

const starterMessages = [
  { from: 'seller', text: 'Hi! This item is still available. We can meet at a public spot nearby.' },
  { from: 'buyer', text: 'Great. Can we meet somewhere easy to find?' },
  { from: 'seller', text: 'Sure, let us set the meetup location in chat before confirming.' },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<NavItem>('home');
  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const [authVisible, setAuthVisible] = useState(false);
  const [activeAuthTab, setActiveAuthTab] = useState<AuthTab>('login');
  const [authModal, setAuthModal] = useState<AuthModal>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => readStoredUser());
  const [userProductsVisible, setUserProductsVisible] = useState(() => {
    return Boolean(readStoredUser()) && window.location.pathname.startsWith(USER_PATH);
  });
  const [selectedListing, setSelectedListing] = useState<Product | null>(null);
  const [chatDraft, setChatDraft] = useState('Is this still available? Where can we meet?');
  const [chatMessages, setChatMessages] = useState(starterMessages);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const savedTheme = window.localStorage.getItem('swapr-theme');
    return savedTheme === 'dark' ? 'dark' : 'light';
  });
  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  const filteredProducts =
    activeFilter === 'all'
      ? products
      : products.filter((product) => product.category === activeFilter);

  const submitNewsletter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthModal(null);
    setAuthSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const endpoint = activeAuthTab === 'login' ? '/auth/login' : '/auth/register';
    const payload = activeAuthTab === 'login' ? { email, password } : { email };

    if (!emailPattern.test(email)) {
      setAuthModal({
        type: 'error',
        title: 'Invalid email address',
        message: 'Error in creating the account. The email address is not valid. Please enter a working email address and try again.',
      });
      setAuthSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? 'Authentication failed');
      }

      if (activeAuthTab === 'register') {
        setAuthModal({
          type: 'success',
          title: 'Account created',
          message: data.message ?? 'Your Swapr account was created successfully. Please check your email for your password.',
        });
        setActiveAuthTab('login');
        return;
      }

      const user = data.user as AuthUser;
      window.localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
      setCurrentUser(user);
      window.history.pushState({}, '', user.newUser ? '/user/profile' : USER_PRODUCTS_PATH);
      setUserProductsVisible(true);
      setAuthVisible(false);
    } catch (error) {
      setAuthModal({
        type: 'error',
        title: activeAuthTab === 'register' ? 'Registration failed' : 'Login failed',
        message: error instanceof Error ? error.message : 'Authentication failed',
      });
    } finally {
      setAuthSubmitting(false);
    }
  };

  const logoutUser = () => {
    window.localStorage.removeItem(USER_SESSION_KEY);
    setCurrentUser(null);
    window.history.pushState({}, '', '/');
    setUserProductsVisible(false);
    setAuthVisible(false);
    setActiveNav('home');
    window.setTimeout(() => {
      document.getElementById('home')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const openAuth = () => {
    setAuthVisible(true);
    setActiveNav('auth');
    window.setTimeout(() => {
      document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const selectNav = (navItem: NavItem) => {
    setActiveNav(navItem);
    setMenuOpen(false);
  };

  const openChat = (listing: Product) => {
    setSelectedListing(listing);
    setChatMessages(starterMessages);
    setChatDraft('Is this still available? Where can we meet?');
  };

  const sendChatMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedMessage = chatDraft.trim();

    if (!trimmedMessage) {
      return;
    }

    setChatMessages((messages) => [
      ...messages,
      { from: 'buyer', text: trimmedMessage },
      { from: 'seller', text: 'Thanks! I can suggest a public meetup location after checking my schedule.' },
    ]);
    setChatDraft('');
  };

  useEffect(() => {
    window.localStorage.setItem('swapr-theme', theme);
  }, [theme]);

  useEffect(() => {
    const syncUserRoute = () => {
      const storedUser = readStoredUser();
      const isUserPath = window.location.pathname.startsWith(USER_PATH);

      if (isUserPath && storedUser) {
        setCurrentUser(storedUser);
        setUserProductsVisible(true);
        return;
      }

      if (isUserPath && !storedUser) {
        window.history.replaceState({}, '', '/');
      }

      setUserProductsVisible(false);
    };

    syncUserRoute();
    window.addEventListener('popstate', syncUserRoute);

    return () => {
      window.removeEventListener('popstate', syncUserRoute);
    };
  }, []);

  const logoSrc = '/swapr-genz-lockup.png';

  if (userProductsVisible) {
    return (
      <Suspense fallback={null}>
        <Products
          onLogout={logoutUser}
          theme={theme}
          onToggleTheme={toggleTheme}
          user={currentUser}
          onUserUpdate={(user) => {
            window.localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
            setCurrentUser(user);
          }}
        />
      </Suspense>
    );
  }

  return (
    <div className={`storefront ${theme}-theme`}>
      <header className="site-header">
        <nav className="main-nav" aria-label="Primary navigation">
          <a className="brand" href="#home" onClick={() => selectNav('home')}>
            <img src={logoSrc} alt="Swapr" />
          </a>
          <div className="desktop-links">
            <a className={activeNav === 'home' ? 'active' : ''} href="#home" onClick={() => selectNav('home')}>
              home
            </a>
            <a className={activeNav === 'shop' ? 'active' : ''} href="#shop" onClick={() => selectNav('shop')}>
              listings
            </a>
            <a className={activeNav === 'deal' ? 'active' : ''} href="#deal" onClick={() => selectNav('deal')}>
              meetups
            </a>
            <a className={activeNav === 'stories' ? 'active' : ''} href="#stories" onClick={() => selectNav('stories')}>
              guides
            </a>
            <a className={activeNav === 'contact' ? 'active' : ''} href="#contact" onClick={() => selectNav('contact')}>
              contact
            </a>
          </div>
          <div className="nav-actions">
            <button
              className={`account-button ${activeNav === 'auth' ? 'active' : ''}`}
              type="button"
              aria-label="Open account login"
              onClick={openAuth}
            >
              <i className="fa fa-user" aria-hidden="true" />
            </button>
            <button
              className="theme-button"
              type="button"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              onClick={toggleTheme}
            >
              <i className={`fa ${theme === 'dark' ? 'fa-lightbulb-o' : 'fa-moon-o'}`} aria-hidden="true" />
            </button>
            <button
              className="menu-button"
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((current) => !current)}
            >
              <i className={`fa ${menuOpen ? 'fa-times' : 'fa-bars'}`} aria-hidden="true" />
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div className="mobile-panel">
            <a className={activeNav === 'home' ? 'active' : ''} href="#home" onClick={() => selectNav('home')}>
              home
            </a>
            <a className={activeNav === 'shop' ? 'active' : ''} href="#shop" onClick={() => selectNav('shop')}>
              listings
            </a>
            <a className={activeNav === 'deal' ? 'active' : ''} href="#deal" onClick={() => selectNav('deal')}>
              meetups
            </a>
            <a className={activeNav === 'stories' ? 'active' : ''} href="#stories" onClick={() => selectNav('stories')}>
              guides
            </a>
            <a className={activeNav === 'contact' ? 'active' : ''} href="#contact" onClick={() => selectNav('contact')}>
              contact
            </a>
          </div>
        )}
      </header>

      <main id="home">
        <section
          className="hero"
          style={{ backgroundImage: `var(--hero-overlay), url(${heroImage})` }}
        >
          <div className="hero-content">
            <p>Your local ukay & preloved marketplace</p>
            <h1>Ukay treasures. Preloved finds.</h1>
            <a className="primary-button" href="#shop">
              shop preloved finds
            </a>
          </div>
        </section>

        <section className="category-band" aria-label="Featured categories">
          {categories.map((category) => (
            <a
              className="category-tile"
              href="#shop"
              key={category.title}
              style={{ backgroundImage: `url(${asset(category.image)})` }}
            >
              <span>{category.title}</span>
            </a>
          ))}
        </section>

        {authVisible && (
          <section className="auth-section" id="auth" aria-labelledby="auth-title">
            <div className="auth-copy">
              <p>Swapr account</p>
              <h2 id="auth-title">Buy and sell with your local profile</h2>
              <span>Use one account to message sellers, save listings, and post preloved items for meetup.</span>
            </div>
            <div className="auth-panel">
              <div className="auth-tabs" role="tablist" aria-label="Authentication tabs">
                <button
                  className={activeAuthTab === 'login' ? 'active' : ''}
                  type="button"
                  role="tab"
                  aria-selected={activeAuthTab === 'login'}
                  aria-controls="login-panel"
                  id="login-tab"
                  onClick={() => setActiveAuthTab('login')}
                >
                  login
                </button>
                <button
                  className={activeAuthTab === 'register' ? 'active' : ''}
                  type="button"
                  role="tab"
                  aria-selected={activeAuthTab === 'register'}
                  aria-controls="register-panel"
                  id="register-tab"
                  onClick={() => setActiveAuthTab('register')}
                >
                  register
                </button>
              </div>

              {activeAuthTab === 'login' ? (
                <form className="auth-form" id="login-panel" role="tabpanel" aria-labelledby="login-tab" onSubmit={submitAuth}>
                  <label htmlFor="login-email">Email address</label>
                  <input id="login-email" name="email" type="email" placeholder="example@gmail.com" required />
                  <label htmlFor="login-password">Password</label>
                  <input id="login-password" name="password" type="password" placeholder="Password" required />
                  <button type="submit" disabled={authSubmitting}>{authSubmitting ? 'please wait' : 'login'}</button>
                </form>
              ) : (
                <form className="auth-form" id="register-panel" role="tabpanel" aria-labelledby="register-tab" onSubmit={submitAuth}>
                  <label htmlFor="register-email">Email address</label>
                  <input id="register-email" name="email" type="email" placeholder="example@gmail.com" required />
                  <p className="auth-note">Enter your email, then check your email inbox for your password.</p>
                  <button type="submit" disabled={authSubmitting}>{authSubmitting ? 'please wait' : 'create account'}</button>
                </form>
              )}
            </div>
          </section>
        )}

        {authModal && (
          <div className="auth-modal-backdrop" role="presentation">
            <section
              className={`auth-modal auth-modal-${authModal.type}`}
              role="dialog"
              aria-modal="true"
              aria-labelledby="auth-modal-title"
            >
              <button
                className="auth-modal-close"
                type="button"
                aria-label="Close message"
                onClick={() => setAuthModal(null)}
              >
                <i className="fa fa-times" aria-hidden="true" />
              </button>
              <div className="auth-modal-icon" aria-hidden="true">
                <i className={`fa ${authModal.type === 'success' ? 'fa-check' : 'fa-exclamation'}`} />
              </div>
              <p>{authModal.type === 'success' ? 'Swapr account' : 'Action needed'}</p>
              <h2 id="auth-modal-title">{authModal.title}</h2>
              <span>{authModal.message}</span>
              <button className="auth-modal-action" type="button" onClick={() => setAuthModal(null)}>
                {authModal.type === 'success' ? 'Continue to login' : 'Try again'}
              </button>
            </section>
          </div>
        )}

        <section className="products-section" id="shop">
          <div className="section-heading">
            <h2>Fresh Listings</h2>
          </div>
          <div className="filter-bar" aria-label="Product filters">
            {(['all', 'women', 'accessories', 'men'] as Filter[]).map((filter) => (
              <button
                className={activeFilter === filter ? 'active' : ''}
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
              >
                {filter === 'all'
                  ? 'all'
                  : filter === 'women'
                  ? 'home'
                  : filter === 'men'
                  ? 'clothing'
                  : 'tech'}
              </button>
            ))}
          </div>
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <button className="favorite-button" type="button" aria-label={`Save ${product.name}`}>
                  <i className="fa fa-heart-o" aria-hidden="true" />
                </button>
                {product.tag && <span className={`product-tag ${product.tagTone}`}>{product.tag}</span>}
                <a className="product-image" href="#shop">
                  <img src={asset(product.image)} alt={product.name} />
                </a>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p>
                    {product.price}
                    {product.oldPrice && <span>{product.oldPrice}</span>}
                  </p>
                </div>
                <button className="add-button" type="button" onClick={() => openChat(product)}>
                  chat seller
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="deal-section" id="deal">
          <div className="deal-image">
            <img src={howItWorksImage} alt="Preloved fashion seller model" />
          </div>
          <div className="deal-copy">
            <div className="section-heading">
              <h2>Find it. Chat. Meet. Make it yours.</h2>
            </div>
            <div className="system-grid" aria-label="Swapr system flow">
              {systemSteps.map((step) => (
                <article className="system-card" key={step.title}>
                  <i className={`fa ${step.icon}`} aria-hidden="true" />
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </article>
              ))}
            </div>
            <a className="primary-button" href="#shop">
              shop preloved finds
            </a>
          </div>
        </section>

        <section className="products-section compact">
          <div className="section-heading">
            <h2>Most Chatted</h2>
          </div>
          <div className="seller-row">
            {products.slice(0, 5).map((product) => (
              <article className="seller-card" key={`seller-${product.id}`}>
                <img src={asset(product.image)} alt={product.name} />
                <h3>{product.name}</h3>
                <p>{product.price}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="benefits" aria-label="Shopping benefits">
          {benefits.map((benefit) => (
            <div className="benefit-item" key={benefit.title}>
              <i className={`fa ${benefit.icon}`} aria-hidden="true" />
              <div>
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="stories-section" id="stories">
          <div className="section-heading">
            <h2>Swapr Guides</h2>
          </div>
          <div className="story-grid">
            {stories.map((story) => (
              <article className="story-card" key={story.title}>
                <img src={asset(story.image)} alt="" />
                <div>
                  <p>{story.meta}</p>
                  <h3>{story.title}</h3>
                  <a href="#stories">Read more</a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="newsletter" id="contact">
          <div>
            <h2>Listing alerts</h2>
            <p>Discover affordable ukay-ukay, one-of-a-kind pieces, and everyday preloved finds near you.</p>
          </div>
          <form onSubmit={submitNewsletter}>
            <label htmlFor="newsletter-email">Email address</label>
            <input id="newsletter-email" type="email" placeholder="Your email" required />
            <button type="submit">subscribe</button>
          </form>
        </section>
      </main>

      {selectedListing && (
        <aside className="chat-drawer" aria-label={`Chat seller about ${selectedListing.name}`}>
          <div className="chat-header">
            <div>
              <p>Realtime seller chat</p>
              <h2>{selectedListing.name}</h2>
            </div>
            <button type="button" aria-label="Close chat" onClick={() => setSelectedListing(null)}>
              <i className="fa fa-times" aria-hidden="true" />
            </button>
          </div>
          <div className="meetup-note">
            <i className="fa fa-map-marker" aria-hidden="true" />
            <span>For now, Swapr is meetup-only. Agree on a safe public location before paying.</span>
          </div>
          <div className="chat-messages">
            {chatMessages.map((message, index) => (
              <p className={message.from === 'buyer' ? 'buyer-message' : 'seller-message'} key={`${message.from}-${index}`}>
                {message.text}
              </p>
            ))}
          </div>
          <form className="chat-form" onSubmit={sendChatMessage}>
            <label htmlFor="chat-message">Message seller</label>
            <input
              id="chat-message"
              type="text"
              value={chatDraft}
              onChange={(event) => setChatDraft(event.target.value)}
              placeholder="Ask about condition or meetup location"
            />
            <button type="submit" aria-label="Send message">
              <i className="fa fa-paper-plane" aria-hidden="true" />
            </button>
          </form>
        </aside>
      )}

      <footer className="footer">
        <a className="brand" href="#home">
          <img src={logoSrc} alt="Swapr" />
        </a>
        <div>
          <a href="#stories">Guides</a>
          <a href="#contact">FAQs</a>
          <a href="#contact">Contact us</a>
        </div>
        <p>
          <a href="mailto:programmerejie@gmail.com">programmerejie@gmail.com</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
