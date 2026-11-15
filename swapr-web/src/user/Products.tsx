import { useEffect, useState } from 'react';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './assets/scss/style.scss';

import avatar2 from './assets/images/avatar/avatar-2.webp';
import avatar4 from './assets/images/avatar/avatar-4.webp';
import newUserInstructionImage from './assets/images/icon1.webp';
import defaultProfilePhoto from './assets/images/user-default.webp';
import Categories from './Categories';
import Messages from './Messages';
import MyShop from './MyShop';
import Notification from './Notification';
import ProductsPage from './ProductsPage';
import Profile from './Profile';
import SalesAnalytics from './SalesAnalytics';

type UserPage = 'products' | 'categories' | 'my-shop' | 'sales-analytics' | 'profile' | 'messages' | 'notification';
const defaultUserPage: UserPage = 'products';
export type AuthUser = {
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

const sidebarItems = [
  { key: 'products', label: 'Marketplace', icon: 'ti-box-seam' },
  { key: 'categories', label: 'Categories', icon: 'ti-category' },
  { key: 'my-shop', label: 'My Shop', icon: 'ti-building-store' },
  { key: 'sales-analytics', label: 'Sales Analytics', icon: 'ti-chart-line' },
  { key: 'profile', label: 'Profile', icon: 'ti-user-circle' },
  { key: 'messages', label: 'Messages', icon: 'ti-message-circle' },
  { key: 'notification', label: 'Notification', icon: 'ti-bell' },
] satisfies { key: UserPage; label: string; icon: string }[];

const userPages = sidebarItems.map((item) => item.key);
const requiredProfileFields: (keyof AuthUser)[] = ['firstname', 'middlename', 'lname', 'email', 'age', 'gender', 'birthdate', 'placeOfBirth'];

const isProfileComplete = (user: AuthUser | null) => {
  if (!user) {
    return false;
  }

  return requiredProfileFields.every((field) => {
    const value = user[field];

    if (typeof value === 'number') {
      return value > 0;
    }

    return typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
  });
};

const pageFromPath = () => {
  const page = window.location.pathname.replace(/^\/user\/?/, '').split('/')[0] || defaultUserPage;
  return userPages.includes(page as UserPage) ? (page as UserPage) : defaultUserPage;
};

const pagePath = (page: UserPage) => `/user/${page}`;

export interface ProductsProps {
  onLogout: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  user: AuthUser | null;
  onUserUpdate: (user: AuthUser) => void;
}

function Products({ onLogout, theme, onToggleTheme, user, onUserUpdate }: ProductsProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activePage, setActivePage] = useState<UserPage>(() => isProfileComplete(user) ? pageFromPath() : 'profile');
  const [productSearch, setProductSearch] = useState('');
  const [categorySlug, setCategorySlug] = useState(() => window.location.pathname.replace(/^\/user\/categories\/?/, ''));
  const [welcomeSaving, setWelcomeSaving] = useState(false);
  const [profileGateModalVisible, setProfileGateModalVisible] = useState(false);
  const profileIncomplete = !isProfileComplete(user);
  const welcomeModalVisible = Boolean(user?.newUser);

  const closeMobile = () => setMobileOpen(false);
  const selectPage = (page: UserPage) => {
    if (profileIncomplete && page !== 'profile') {
      setActivePage('profile');
      window.history.pushState({}, '', pagePath('profile'));
      setMobileOpen(false);
      setProfileGateModalVisible(true);
      return;
    }

    setActivePage(page);
    setCategorySlug('');
    window.history.pushState({}, '', pagePath(page));
    setMobileOpen(false);
  };

  const selectCategory = (slug: string) => {
    if (profileIncomplete) {
      setActivePage('profile');
      setCategorySlug('');
      window.history.pushState({}, '', pagePath('profile'));
      setMobileOpen(false);
      setProfileGateModalVisible(true);
      return;
    }

    setActivePage('categories');
    setCategorySlug(slug);
    window.history.pushState({}, '', `/user/categories/${slug}`);
    setMobileOpen(false);
  };

  const dismissWelcomeModal = async () => {
    if (!user) {
      return;
    }

    setWelcomeSaving(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL ?? 'http://localhost:4000'}/profile/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newUser: false }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? 'Failed to update welcome status');
      }

      onUserUpdate(data.user as AuthUser);
    } catch (error) {
      console.error(error);
    } finally {
      setWelcomeSaving(false);
    }
  };

  useEffect(() => {
    if (profileIncomplete && window.location.pathname !== pagePath('profile')) {
      setActivePage('profile');
      window.history.replaceState({}, '', pagePath('profile'));
      return;
    }

    if (window.location.pathname === '/user/' || window.location.pathname === '/user') {
      window.history.replaceState({}, '', pagePath(profileIncomplete ? 'profile' : defaultUserPage));
    }

    const syncActivePage = () => {
      if (profileIncomplete) {
        setActivePage('profile');
        window.history.replaceState({}, '', pagePath('profile'));
        return;
      }

      setActivePage(pageFromPath());
      setCategorySlug(window.location.pathname.replace(/^\/user\/categories\/?/, ''));
    };

    window.addEventListener('popstate', syncActivePage);

    return () => {
      window.removeEventListener('popstate', syncActivePage);
    };
  }, [profileIncomplete]);

  const renderPage = () => {
    switch (activePage) {
      case 'my-shop':
        return <MyShop searchQuery={productSearch} />;
      case 'categories':
        return (
          <Categories
            searchQuery={productSearch}
            selectedSlug={categorySlug}
            onSelectCategory={selectCategory}
            onBack={() => selectPage('categories')}
          />
        );
      case 'sales-analytics':
        return <SalesAnalytics />;
      case 'profile':
        return <Profile user={user} onUserUpdate={onUserUpdate} />;
      case 'messages':
        return <Messages />;
      case 'notification':
        return <Notification />;
      case 'products':
      default:
        return <ProductsPage searchQuery={productSearch} />;
    }
  };

  return (
    <div className={`user-template ${theme}-theme`} data-bs-theme={theme}>
      <div className={`overlay ${mobileOpen ? 'show' : ''}`} id="overlay" onClick={closeMobile} />

      <nav id="topbar" className={`navbar bg-white border-bottom fixed-top topbar px-3 ${collapsed ? 'full' : ''}`}>
        <button
          id="toggleBtn"
          className="d-none d-lg-inline-flex btn btn-light btn-icon btn-sm"
          type="button"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setCollapsed((current) => !current)}
        >
          <i className="ti ti-menu-2" />
        </button>

        <button
          id="mobileBtn"
          className="btn btn-light btn-icon btn-sm d-lg-none me-2"
          type="button"
          aria-label="Open sidebar"
          onClick={() => setMobileOpen(true)}
        >
          <i className="ti ti-menu-2" />
        </button>

        {(activePage === 'products' || activePage === 'categories' || activePage === 'my-shop') && (
          <form className="topbar-search" role="search" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="user-search">
              Search {activePage === 'categories' ? 'categories' : activePage === 'my-shop' ? 'my products' : 'products'}
            </label>
            <i className="ti ti-search" aria-hidden="true" />
            <input
              id="user-search"
              type="search"
              placeholder={`Search ${
                activePage === 'categories' ? 'categories' : activePage === 'my-shop' ? 'my products' : 'products'
              }...`}
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
            />
          </form>
        )}

        <div className="topbar-actions">
          <ul className="list-unstyled d-flex align-items-center mb-0 gap-1">
            <li>
              <button
                className="btn btn-light btn-icon btn-sm rounded-circle theme-mode-button"
                type="button"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                onClick={onToggleTheme}
              >
                <i className={`ti ${theme === 'dark' ? 'ti-sun' : 'ti-moon'} fs-5`} />
              </button>
            </li>
            <li>
              <a
                className="position-relative btn-icon btn-sm btn-light btn rounded-circle"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                href="#notifications"
                role="button"
              >
                <i className="ti ti-bell fs-5" />
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger mt-2 ms-n2">
                  2<span className="visually-hidden">unread messages</span>
                </span>
              </a>
              <div className="dropdown-menu dropdown-menu-end notification-menu p-0">
                <div className="notification-menu-header">
                  <div>
                    <h3>Notifications</h3>
                    <p>Latest marketplace activity</p>
                  </div>
                  <span>3 new</span>
                </div>
                <ul className="list-unstyled p-0 m-0">
                  {[
                    [defaultProfilePhoto, 'New order received', 'Order #12345 has been placed', '5 minutes ago', 'ti-shopping-bag'],
                    [avatar4, 'New user registered', 'User @john_doe has signed up', '30 minutes ago', 'ti-user-plus'],
                    [avatar2, 'Payment confirmed', 'Payment of $299 has been received', '1 hour ago', 'ti-credit-card'],
                  ].map(([avatar, title, text, time, icon]) => (
                    <li className="notification-item" key={title}>
                      <div className="notification-avatar">
                        <img src={avatar} alt="" className="avatar avatar-sm rounded-circle" />
                        <span>
                          <i className={`ti ${icon}`} />
                        </span>
                      </div>
                      <div className="notification-copy">
                        <h4>{title}</h4>
                        <p>{text}</p>
                        <time>{time}</time>
                      </div>
                    </li>
                  ))}
                  <li className="notification-footer">
                    <a
                      href={pagePath('notification')}
                      onClick={(event) => {
                        event.preventDefault();
                        selectPage('notification');
                      }}
                    >
                      View all notifications
                    </a>
                  </li>
                </ul>
              </div>
            </li>
            <li className="dropdown">
              <a href="#account" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <img src={defaultProfilePhoto} alt="" className="avatar avatar-sm rounded-circle" />
              </a>
              <div className="dropdown-menu dropdown-menu-end account-menu p-0">
                <div className="account-menu-header">
                  <img src={defaultProfilePhoto} alt="" className="avatar avatar-md rounded-circle" />
                  <div>
                    <h4 className="mb-0 small">{[user?.firstname, user?.middlename, user?.lname].filter(Boolean).join(' ') || 'Swapr user'}</h4>
                    <p className="mb-0 small">{user?.email ?? ''}</p>
                  </div>
                </div>
                <div className="account-menu-body">
                  {[
                    ['Home', 'ti-home'],
                    ['Inbox', 'ti-inbox'],
                    ['Chat', 'ti-message-circle'],
                    ['Activity', 'ti-activity'],
                    ['Account Settings', 'ti-settings'],
                  ].map(([item, icon]) => (
                    <a className="account-menu-link" href="#account" key={item}>
                      <i className={`ti ${icon}`} />
                      <span>{item}</span>
                    </a>
                  ))}
                  <button className="dropdown-logout" type="button" onClick={onLogout}>
                    <i className="ti ti-logout" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </nav>

      <aside id="sidebar" className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-show' : ''}`}>
        <div className="logo-area">
          <a
            href={pagePath('products')}
            className="d-inline-flex align-items-center"
            onClick={(event) => {
              event.preventDefault();
              selectPage('products');
            }}
          >
            <img src={collapsed ? '/swapr-genz-icon-192.png' : '/swapr-genz-lockup.png'} alt="Swapr" className="logo-mark genz-lockup" />
          </a>
        </div>
        <ul className="nav sidebar-nav flex-column">
          <li className="nav-section-label px-4 py-2">
            <small className="nav-text">Pages</small>
          </li>
          {sidebarItems.map(({ key, label, icon }) => (
            <li key={key}>
              <a
                className={`nav-link ${activePage === key ? 'active' : ''}`}
                href={pagePath(key)}
                onClick={(event) => {
                  event.preventDefault();
                  selectPage(key);
                }}
              >
                <i className={`ti ${icon}`} />
                <span className="nav-text">{label}</span>
              </a>
            </li>
          ))}
        </ul>

        <ul className="nav sidebar-account flex-column">
          <li className="px-4 pt-4 pb-2">
            <small className="nav-text">Account</small>
          </li>
          <li>
            <button className="nav-link logout-link border-0" type="button" onClick={onLogout}>
              <i className="ti ti-logout" />
              <span className="nav-text">Log out</span>
            </button>
          </li>
        </ul>
      </aside>

      <main id="content" className={`content py-10 ${collapsed ? 'full' : ''} ${activePage === 'messages' ? 'messages-content' : ''}`}>
        <div className="container-fluid">
          {renderPage()}
        </div>
      </main>

      {profileGateModalVisible && (
        <div className="profile-gate-modal-backdrop" role="presentation">
          <section
            className="profile-gate-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-gate-modal-title"
          >
            <button
              className="profile-gate-modal-close"
              type="button"
              aria-label="Close profile requirement message"
              onClick={() => setProfileGateModalVisible(false)}
            >
              <i className="ti ti-x" />
            </button>
            <div className="profile-gate-modal-icon" aria-hidden="true">
              <i className="ti ti-user-check" />
            </div>
            <span>Profile required</span>
            <h2 id="profile-gate-modal-title">Please set up the profile first</h2>
            <p>
              Set up your profile before moving to other pages. This keeps your Swapr account trustworthy for chat-based listings and public meetups.
            </p>
            <button type="button" onClick={() => setProfileGateModalVisible(false)}>
              Back to profile
            </button>
          </section>
        </div>
      )}

      {welcomeModalVisible && (
        <div className="new-user-modal-backdrop" role="presentation">
          <section
            className="new-user-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-user-modal-title"
            aria-describedby="new-user-modal-description"
          >
            <button
              className="new-user-modal-close"
              type="button"
              aria-label="Close welcome message"
              onClick={dismissWelcomeModal}
              disabled={welcomeSaving}
            >
              <i className="ti ti-x" />
            </button>
            <div className="new-user-modal-media">
              <img src={newUserInstructionImage} alt="Swapr system introduction" />
            </div>
            <div className="new-user-modal-copy">
              <span>Welcome to Swapr</span>
              <h2 id="new-user-modal-title">Hello New User!</h2>
              <p id="new-user-modal-description">
                Swapr is your local ukay-ukay and preloved marketplace. Discover affordable fashion, everyday essentials, and unique secondhand finds. Chat with sellers, agree on a public meetup, inspect your find, then pay in PHP.
              </p>
              <p>
                This system and business concept was created by <strong>Ejie C. Florida</strong> to support simple, community-based buying and selling.
              </p>
              <button type="button" onClick={dismissWelcomeModal} disabled={welcomeSaving}>
                {welcomeSaving ? 'Saving...' : 'Got it'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default Products;
