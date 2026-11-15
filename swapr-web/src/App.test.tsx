import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

jest.mock('./user/Products', () => ({ onLogout }: { onLogout: () => void }) => (
  <div>
    <nav aria-label="drawer" />
    <h1>Products</h1>
    <button type="button" onClick={onLogout}>
      Log out
    </button>
  </div>
));

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState({}, '', '/');
});

test('redirects login to user products', async () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /ukay treasures\. preloved finds\./i })).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: /open account login/i }));
  const loginPanel = screen.getByRole('tabpanel', { name: /login/i });
  await userEvent.type(within(loginPanel).getByLabelText(/email address/i), 'seller@example.com');
  await userEvent.type(within(loginPanel).getByLabelText(/password/i), 'password');
  await userEvent.click(within(loginPanel).getByRole('button', { name: /^login$/i }));

  expect(await screen.findByRole('navigation', { name: /drawer/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /products/i })).toBeInTheDocument();
  expect(window.location.pathname).toBe('/user/products');
});

test('keeps user products after refresh until logout', async () => {
  window.localStorage.setItem('swapr-user-session', 'active');
  window.history.replaceState({}, '', '/user/');
  const { rerender } = render(<App />);

  expect(await screen.findByRole('heading', { name: /products/i })).toBeInTheDocument();

  rerender(<App />);
  expect(screen.getByRole('heading', { name: /products/i })).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: /log out/i }));
  expect(screen.getByRole('heading', { name: /ukay treasures\. preloved finds\./i })).toBeInTheDocument();
  expect(window.localStorage.getItem('swapr-user-session')).toBeNull();
  expect(window.location.pathname).toBe('/');
});
