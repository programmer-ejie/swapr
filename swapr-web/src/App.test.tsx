import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

jest.mock("./user/Products", () => ({ onLogout }: { onLogout: () => void }) => (
  <div>
    <nav aria-label="drawer" />
    <h1>Products</h1>
    <button onClick={onLogout}>Log out</button>
  </div>
));
const user = {
  id: "12345678-1234-4234-8234-123456789012",
  email: "seller@example.com",
  newUser: false,
};
let restored = false;
let fetchMock: jest.Mock;
beforeAll(() => {
  HTMLElement.prototype.scrollIntoView = jest.fn();
});
beforeEach(() => {
  restored = false;
  window.localStorage.clear();
  window.history.replaceState({}, "", "/");
  fetchMock = jest.fn(async (url: string, options?: RequestInit) => {
    let status = 200;
    let data: unknown = {};
    if (url.endsWith("/auth/me")) {
      status = restored ? 200 : 401;
      data = restored ? { user } : { message: "Please log in." };
    } else if (url.endsWith("/listings")) data = { listings: [] };
    else if (url.endsWith("/auth/login")) {
      data = { user };
    } else if (url.endsWith("/auth/register"))
      data = { message: "Account created. Log in with your chosen password." };
    else if (url.endsWith("/auth/logout")) data = { message: "Logged out." };
    else throw new Error(`Unexpected request ${url}`);
    return { ok: status < 400, status, json: async () => data } as Response;
  });
  global.fetch = fetchMock;
});

test("logs in through the API using cookie credentials", async () => {
  render(<App />);
  expect(
    await screen.findByRole("heading", {
      name: /ukay treasures\. preloved finds\./i,
    }),
  ).toBeInTheDocument();
  await userEvent.click(
    screen.getByRole("button", { name: /open account login/i }),
  );
  const panel = screen.getByRole("tabpanel", { name: /login/i });
  await userEvent.type(
    within(panel).getByLabelText(/email address/i),
    "seller@example.com",
  );
  await userEvent.type(
    within(panel).getByLabelText(/password/i),
    "password123",
  );
  await userEvent.click(
    within(panel).getByRole("button", { name: /^login$/i }),
  );
  expect(
    await screen.findByRole("navigation", { name: "drawer" }, {timeout:5000}),
  ).toBeInTheDocument();
  expect(window.location.pathname).toBe("/user/products");
  expect(fetchMock).toHaveBeenCalledWith(
    "/api/auth/login",
    expect.objectContaining({
      credentials: "include",
      method: "POST",
      body: JSON.stringify({
        email: "seller@example.com",
        password: "password123",
      }),
    }),
  );
});

test("restores a server session after refresh and revokes it on logout", async () => {
  restored = true;
  window.history.replaceState({}, "", "/user/products");
  render(<App />);
  expect(
    await screen.findByRole("heading", { name: "Products" }),
  ).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: /log out/i }));
  expect(
    await screen.findByRole("heading", {
      name: /ukay treasures\. preloved finds\./i,
    }),
  ).toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledWith(
    "/api/auth/logout",
    expect.objectContaining({ method: "POST", credentials: "include" }),
  );
  expect(window.location.pathname).toBe("/");
});

test("rejects a forged local-storage session when the server has no session", async () => {
  window.localStorage.setItem("swapr-user-session", JSON.stringify(user));
  window.history.replaceState({}, "", "/user/products");
  render(<App />);
  expect(
    await screen.findByRole("heading", {
      name: /ukay treasures\. preloved finds\./i,
    }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("navigation", { name: "drawer" }),
  ).not.toBeInTheDocument();
  expect(window.location.pathname).toBe("/");
});

test("registers with a chosen password and shows the server result", async () => {
  render(<App />);
  await screen.findByRole("heading", {
    name: /ukay treasures\. preloved finds\./i,
  });
  await userEvent.click(
    screen.getByRole("button", { name: /open account login/i }),
  );
  await userEvent.click(screen.getByRole("tab", { name: /register/i }));
  const panel = screen.getByRole("tabpanel", { name: /register/i });
  await userEvent.type(
    within(panel).getByLabelText(/email address/i),
    "seller@example.com",
  );
  await userEvent.type(
    within(panel).getByLabelText(/^password$/i),
    "password123",
  );
  await userEvent.click(
    within(panel).getByRole("button", { name: /create account/i }),
  );
  await waitFor(() =>
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/register",
      expect.objectContaining({
        body: JSON.stringify({
          email: "seller@example.com",
          password: "password123",
        }),
      }),
    ),
  );
  expect(
    await screen.findByText(
      "Account created. Log in with your chosen password.",
    ),
  ).toBeInTheDocument();
});
