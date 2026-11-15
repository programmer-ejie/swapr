import {
  ComponentType,
  FormEvent,
  Suspense,
  lazy,
  useEffect,
  useState,
} from "react";
import heroImage from "./user/assets/images/asdasdsd.webp";
import howItWorksImage from "./user/assets/images/icon2.webp";
import "./App.css";
import { api, errorMessage, Listing, money } from "./api";
import { useApi } from "./useApi";
import productImages from "./product-images.json";
const defaultProduct =
  productImages["src/user/assets/images/default_product_image.webp"];

const USER_SESSION_KEY = "swapr-user-session";
const USER_PATH = "/user/";
const USER_PRODUCTS_PATH = "/user/products";

const asset = (path: string) =>
  path.startsWith("/") || path.startsWith("data:") || path.startsWith("https://")
    ? path
    : `/home_template/${path}`;

const categories = [
  { title: "Ukay Fashion", image: "/category-preloved-fits-photo.jpg" },
  { title: "Everyday Preloved", image: "/category-daily-finds-photo.jpg" },
  { title: "Preloved Home", image: "/category-room-goods-photo.jpg" },
];

const benefits = [
  {
    icon: "fa-comments-o",
    title: "Seller chat",
    text: "Message sellers before meeting",
  },
  {
    icon: "fa-map-marker",
    title: "Meetup first",
    text: "Agree on a safe nearby location",
  },
  {
    icon: "fa-check-circle-o",
    title: "Inspect items",
    text: "Check condition before paying",
  },
  {
    icon: "fa-money",
    title: "PHP listings",
    text: "Prices shown in Philippine pesos",
  },
];

const stories = [
  {
    title: "How to check preloved items before meetup",
    image: "/guide-check-items.png",
    meta: "Buyer guide",
  },
  {
    title: "Simple ways to write a trustworthy listing",
    image: "/guide-trust-listing.png",
    meta: "Seller tips",
  },
  {
    title: "Choosing public meetup spots that feel safe",
    image: "/guide-safe-meetup.png",
    meta: "Meetup guide",
  },
];

type Filter = "all" | "fashion" | "home-goods" | "electronics" | "accessories";
type Product = Listing & { oldPrice?: string; tag?: string; tagTone?: string };
type AuthTab = "login" | "register";
type NavItem = "home" | "shop" | "deal" | "stories" | "contact" | "auth";
type AuthModal = {
  type: "success" | "error";
  title: string;
  message: string;
} | null;
type AuthUser = {
  id: string;
  email: string;
  description?: string;
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
  theme: "dark" | "light";
  onToggleTheme: () => void;
  user: AuthUser | null;
  onUserUpdate: (user: AuthUser) => void;
};

const Products = lazy(
  () => import("./user/Products"),
) as ComponentType<ProductsProps>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const systemSteps = [
  {
    icon: "fa-pencil-square-o",
    title: "Post a listing",
    text: "List ukay finds and preloved favorites with a price, clear photos, sizing, and honest condition notes.",
  },
  {
    icon: "fa-comments-o",
    title: "Chat in realtime",
    text: "Buyers message sellers first to ask questions and confirm availability.",
  },
  {
    icon: "fa-map-marker",
    title: "Set meetup place",
    text: "Both sides agree on a public location because delivery is not available yet.",
  },
  {
    icon: "fa-check-circle-o",
    title: "Inspect then pay",
    text: "Buyer checks the item during meetup before completing the PHP payment.",
  },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<NavItem>("home");
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [authVisible, setAuthVisible] = useState(false);
  const [activeAuthTab, setActiveAuthTab] = useState<AuthTab>("login");
  const [authModal, setAuthModal] = useState<AuthModal>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const listings = useApi<{ listings: Listing[] }>("/listings", {
    listings: [],
  });
  const products: Product[] = listings.data.listings.map((l) => ({
    ...l,
    price: money(l.price),
    image: l.image || defaultProduct,
  }));
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [pendingListingId, setPendingListingId] = useState("");
  const [userProductsVisible, setUserProductsVisible] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const savedTheme = window.localStorage.getItem("swapr-theme");
    return savedTheme === "dark" ? "dark" : "light";
  });
  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  const filteredProducts =
    activeFilter === "all"
      ? products
      : products.filter((product) => product.category === activeFilter);

  const submitNewsletter = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const data = await api<{ message: string }>("/newsletter", {
        method: "POST",
        body: JSON.stringify({ email: form.get("email") }),
      });
      setNewsletterMessage(data.message);
    } catch (error) {
      setNewsletterMessage(errorMessage(error));
    }
  };

  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthModal(null);
    setAuthSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const endpoint =
      activeAuthTab === "login" ? "/auth/login" : "/auth/register";
    const payload = { email, password };

    if (!emailPattern.test(email)) {
      setAuthModal({
        type: "error",
        title: "Invalid email address",
        message:
          "Error in creating the account. The email address is not valid. Please enter a working email address and try again.",
      });
      setAuthSubmitting(false);
      return;
    }

    try {
      const data = await api<{ user: AuthUser; message: string }>(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (activeAuthTab === "register") {
        setAuthModal({
          type: "success",
          title: "Account created",
          message:
            data.message ??
            "Your Swapr account was created successfully. Log in with your chosen password.",
        });
        setActiveAuthTab("login");
        return;
      }

      const user = data.user as AuthUser;
      window.localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
      setCurrentUser(user);
      let nextPath = user.newUser ? "/user/profile" : USER_PRODUCTS_PATH;
      if (pendingListingId && !user.newUser) {
        const chat = await api<{ conversation: { id: string } }>(
          "/conversations",
          {
            method: "POST",
            body: JSON.stringify({ listingId: pendingListingId }),
          },
        );
        nextPath = `/user/messages?conversation=${chat.conversation.id}`;
        setPendingListingId("");
      }
      window.history.pushState({}, "", nextPath);
      setUserProductsVisible(true);
      setAuthVisible(false);
    } catch (error) {
      setAuthModal({
        type: "error",
        title:
          activeAuthTab === "register" ? "Registration failed" : "Login failed",
        message:
          error instanceof Error ? error.message : "Authentication failed",
      });
    } finally {
      setAuthSubmitting(false);
    }
  };

  const logoutUser = async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch (error) {
      setAuthModal({
        type: "error",
        title: "Logout failed",
        message: errorMessage(error),
      });
      return;
    }

    window.localStorage.removeItem(USER_SESSION_KEY);
    setCurrentUser(null);
    window.history.pushState({}, "", "/");
    setUserProductsVisible(false);
    setAuthVisible(false);
    setActiveNav("home");
    window.setTimeout(() => {
      document
        .getElementById("home")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const openAuth = () => {
    if (currentUser) {
      window.history.pushState({}, "", USER_PRODUCTS_PATH);
      setUserProductsVisible(true);
      return;
    }
    setAuthVisible(true);
    setActiveNav("auth");
    window.setTimeout(() => {
      document
        .getElementById("auth")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const selectNav = (navItem: NavItem) => {
    setActiveNav(navItem);
    setMenuOpen(false);
  };

  const openChat = async (listing: Product) => {
    if (!currentUser) {
      setPendingListingId(listing.id);
      openAuth();
      return;
    }
    try {
      const data = await api<{ conversation: { id: string } }>(
        "/conversations",
        { method: "POST", body: JSON.stringify({ listingId: listing.id }) },
      );
      window.history.pushState(
        {},
        "",
        `/user/messages?conversation=${data.conversation.id}`,
      );
      setUserProductsVisible(true);
    } catch (error) {
      setAuthModal({
        type: "error",
        title: "Could not open chat",
        message: errorMessage(error),
      });
    }
  };

  useEffect(() => {
    let active = true;
    const expire = () => {
      setCurrentUser(null);
      setUserProductsVisible(false);
      window.localStorage.removeItem(USER_SESSION_KEY);
      if (window.location.pathname.startsWith(USER_PATH))
        window.history.replaceState({}, "", "/");
    };
    window.addEventListener("swapr-session-expired", expire);
    void api<{ user: AuthUser }>("/auth/me")
      .then((data) => {
        if (active) {
          setCurrentUser(data.user);
          setUserProductsVisible(
            window.location.pathname.startsWith(USER_PATH),
          );
        }
      })
      .catch(() => {
        if (active) expire();
      })
      .finally(() => {
        if (active) setCheckingSession(false);
      });
    return () => {
      active = false;
      window.removeEventListener("swapr-session-expired", expire);
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem("swapr-theme", theme);
  }, [theme]);

  useEffect(() => {
    const syncUserRoute = () => {
      if (checkingSession) return;
      const storedUser = currentUser;
      const isUserPath = window.location.pathname.startsWith(USER_PATH);

      if (isUserPath && storedUser) {
        setCurrentUser(storedUser);
        setUserProductsVisible(true);
        return;
      }

      if (isUserPath && !storedUser) {
        window.history.replaceState({}, "", "/");
      }

      setUserProductsVisible(false);
    };

    syncUserRoute();
    window.addEventListener("popstate", syncUserRoute);

    return () => {
      window.removeEventListener("popstate", syncUserRoute);
    };
  }, [currentUser, checkingSession]);

  const logoSrc = "/swapr-genz-lockup.png";

  if (checkingSession)
    return (
      <div className="session-loading" role="status">
        Loading Swapr...
      </div>
    );

  if (userProductsVisible) {
    return (
      <Suspense fallback={<p role="status">Loading your workspace...</p>}>
        {authModal && <p role="alert">{authModal.message}</p>}
        <Products
          onLogout={logoutUser}
          theme={theme}
          onToggleTheme={toggleTheme}
          user={currentUser}
          onUserUpdate={(user) => {
            window.localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
            setCurrentUser(user);
            if (
              pendingListingId &&
              user.firstname &&
              user.lname &&
              user.placeOfBirth
            ) {
              void api<{ conversation: { id: string } }>("/conversations", {
                method: "POST",
                body: JSON.stringify({ listingId: pendingListingId }),
              })
                .then((data) => {
                  setPendingListingId("");
                  window.history.pushState(
                    {},
                    "",
                    `/user/messages?conversation=${data.conversation.id}`,
                  );
                  window.dispatchEvent(new PopStateEvent("popstate"));
                })
                .catch((error) =>
                  setAuthModal({
                    type: "error",
                    title: "Could not open chat",
                    message: errorMessage(error),
                  }),
                );
            }
          }}
        />
      </Suspense>
    );
  }

  return (
    <div className={`storefront ${theme}-theme`}>
      <header className="site-header">
        <nav className="main-nav" aria-label="Primary navigation">
          <a className="brand" href="#home" onClick={() => selectNav("home")}>
            <img src={logoSrc} alt="Swapr" />
          </a>
          <div className="desktop-links">
            <a
              className={activeNav === "home" ? "active" : ""}
              href="#home"
              onClick={() => selectNav("home")}
            >
              home
            </a>
            <a
              className={activeNav === "shop" ? "active" : ""}
              href="#shop"
              onClick={() => selectNav("shop")}
            >
              listings
            </a>
            <a
              className={activeNav === "deal" ? "active" : ""}
              href="#deal"
              onClick={() => selectNav("deal")}
            >
              meetups
            </a>
            <a
              className={activeNav === "stories" ? "active" : ""}
              href="#stories"
              onClick={() => selectNav("stories")}
            >
              guides
            </a>
            <a
              className={activeNav === "contact" ? "active" : ""}
              href="#contact"
              onClick={() => selectNav("contact")}
            >
              contact
            </a>
          </div>
          <div className="nav-actions">
            <button
              className={`account-button ${activeNav === "auth" ? "active" : ""}`}
              type="button"
              aria-label="Open account login"
              onClick={openAuth}
            >
              <i className="fa fa-user" aria-hidden="true" />
            </button>
            <button
              className="theme-button"
              type="button"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              onClick={toggleTheme}
            >
              <i
                className={`fa ${theme === "dark" ? "fa-lightbulb-o" : "fa-moon-o"}`}
                aria-hidden="true"
              />
            </button>
            <button
              className="menu-button"
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((current) => !current)}
            >
              <i
                className={`fa ${menuOpen ? "fa-times" : "fa-bars"}`}
                aria-hidden="true"
              />
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div className="mobile-panel">
            <a
              className={activeNav === "home" ? "active" : ""}
              href="#home"
              onClick={() => selectNav("home")}
            >
              home
            </a>
            <a
              className={activeNav === "shop" ? "active" : ""}
              href="#shop"
              onClick={() => selectNav("shop")}
            >
              listings
            </a>
            <a
              className={activeNav === "deal" ? "active" : ""}
              href="#deal"
              onClick={() => selectNav("deal")}
            >
              meetups
            </a>
            <a
              className={activeNav === "stories" ? "active" : ""}
              href="#stories"
              onClick={() => selectNav("stories")}
            >
              guides
            </a>
            <a
              className={activeNav === "contact" ? "active" : ""}
              href="#contact"
              onClick={() => selectNav("contact")}
            >
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
          <section
            className="auth-section"
            id="auth"
            aria-labelledby="auth-title"
          >
            <div className="auth-copy">
              <p>Swapr account</p>
              <h2 id="auth-title">Buy and sell with your local profile</h2>
              <span>
                Use one account to message sellers, save listings, and post
                preloved items for meetup.
              </span>
            </div>
            <div className="auth-panel">
              <div
                className="auth-tabs"
                role="tablist"
                aria-label="Authentication tabs"
              >
                <button
                  className={activeAuthTab === "login" ? "active" : ""}
                  type="button"
                  role="tab"
                  aria-selected={activeAuthTab === "login"}
                  aria-controls="login-panel"
                  id="login-tab"
                  onClick={() => setActiveAuthTab("login")}
                >
                  login
                </button>
                <button
                  className={activeAuthTab === "register" ? "active" : ""}
                  type="button"
                  role="tab"
                  aria-selected={activeAuthTab === "register"}
                  aria-controls="register-panel"
                  id="register-tab"
                  onClick={() => setActiveAuthTab("register")}
                >
                  register
                </button>
              </div>

              {activeAuthTab === "login" ? (
                <form
                  className="auth-form"
                  id="login-panel"
                  role="tabpanel"
                  aria-labelledby="login-tab"
                  onSubmit={submitAuth}
                >
                  <label htmlFor="login-email">Email address</label>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="example@gmail.com"
                    required
                  />
                  <label htmlFor="login-password">Password</label>
                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="Password"
                    required
                  />
                  <button type="submit" disabled={authSubmitting}>
                    {authSubmitting ? "please wait" : "login"}
                  </button>
                </form>
              ) : (
                <form
                  className="auth-form"
                  id="register-panel"
                  role="tabpanel"
                  aria-labelledby="register-tab"
                  onSubmit={submitAuth}
                >
                  <label htmlFor="register-email">Email address</label>
                  <input
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder="example@gmail.com"
                    required
                  />
                  <label htmlFor="register-password">Password</label>
                  <input
                    id="register-password"
                    name="password"
                    type="password"
                    minLength={8}
                    maxLength={128}
                    autoComplete="new-password"
                    required
                  />
                  <p className="auth-note">
                    Choose a password with at least 8 characters.
                  </p>
                  <button type="submit" disabled={authSubmitting}>
                    {authSubmitting ? "please wait" : "create account"}
                  </button>
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
                <i
                  className={`fa ${authModal.type === "success" ? "fa-check" : "fa-exclamation"}`}
                />
              </div>
              <p>
                {authModal.type === "success"
                  ? "Swapr account"
                  : "Action needed"}
              </p>
              <h2 id="auth-modal-title">{authModal.title}</h2>
              <span>{authModal.message}</span>
              <button
                className="auth-modal-action"
                type="button"
                onClick={() => setAuthModal(null)}
              >
                {authModal.type === "success"
                  ? "Continue to login"
                  : "Try again"}
              </button>
            </section>
          </div>
        )}

        <section className="products-section" id="shop">
          <div className="section-heading">
            <h2>Fresh Listings</h2>
          </div>
          <div className="filter-bar" aria-label="Product filters">
            {(
              [
                "all",
                "fashion",
                "home-goods",
                "electronics",
                "accessories",
              ] as Filter[]
            ).map((filter) => (
              <button
                className={activeFilter === filter ? "active" : ""}
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
              >
                {filter === "all"
                  ? "All"
                  : filter === "home-goods"
                    ? "Home goods"
                    : filter}
              </button>
            ))}
          </div>
          {listings.loading && <p role="status">Loading listings...</p>}
          {listings.error && (
            <p role="alert">
              {listings.error} <button onClick={listings.reload}>Retry</button>
            </p>
          )}
          {!listings.loading && !listings.error && !filteredProducts.length && (
            <section className="listing-empty" aria-labelledby="listing-empty-title">
              <div className="listing-empty-art" aria-hidden="true">
                <svg viewBox="0 0 160 132" fill="none">
                  <circle cx="80" cy="68" r="59" className="empty-art-halo" />
                  <rect x="30" y="34" width="69" height="79" rx="10" transform="rotate(-12 30 34)" className="empty-art-back" />
                  <rect x="52" y="25" width="77" height="91" rx="11" className="empty-art-card" />
                  <path d="M74 62V49a16 16 0 0 1 32 0v13M68 58h44l4 40H64l4-40Z" className="empty-art-bag" />
                  <path d="m83 80 5 5 10-11" className="empty-art-check" />
                  <path d="M133 32v12m-6-6h12M27 88v8m-4-4h8" className="empty-art-spark" />
                  <circle cx="38" cy="24" r="3" className="empty-art-dot" />
                </svg>
              </div>
              <span className="listing-empty-eyebrow">Room for something good</span>
              <h3 id="listing-empty-title">{activeFilter === 'all' ? 'No listings yet' : 'No finds in this category yet'}</h3>
              <p>{activeFilter === 'all'
                ? 'Great finds deserve a second home. Be the first to share a preloved piece with the Swapr community.'
                : 'New pieces will appear here as the community grows. Explore other categories or add a find of your own.'}</p>
              <div className="listing-empty-actions">
                <button className="listing-empty-primary" type="button" onClick={() => {
                  if (currentUser) {
                    window.history.pushState({}, '', '/user/my-shop');
                    setUserProductsVisible(true);
                  } else {
                    setActiveAuthTab('register');
                    openAuth();
                  }
                }}>
                  <span aria-hidden="true">+</span> {activeFilter === 'all' ? 'Create the first listing' : 'Create a listing'}
                </button>
                {activeFilter !== 'all' && <button className="listing-empty-secondary" type="button" onClick={() => setActiveFilter('all')}>Explore all listings <span aria-hidden="true">→</span></button>}
              </div>
              <div className="listing-empty-note"><i className="fa fa-map-marker" aria-hidden="true" /> Preloved pieces. New possibilities. Local meetups.</div>
            </section>
          )}
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <button
                  className="favorite-button"
                  type="button"
                  aria-label={`Save ${product.name}`}
                  onClick={openAuth}
                >
                  <i className="fa fa-heart-o" aria-hidden="true" />
                </button>
                {product.tag && (
                  <span className={`product-tag ${product.tagTone}`}>
                    {product.tag}
                  </span>
                )}
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
                <button
                  className="add-button"
                  type="button"
                  onClick={() => openChat(product)}
                >
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
            <p>
              Discover affordable ukay-ukay, one-of-a-kind pieces, and everyday
              preloved finds near you.
            </p>
          </div>
          <form onSubmit={submitNewsletter}>
            <label htmlFor="newsletter-email">Email address</label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              placeholder="Your email"
              required
            />
            <button type="submit">subscribe</button>
            {newsletterMessage && <p role="status">{newsletterMessage}</p>}
          </form>
        </section>
      </main>

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
