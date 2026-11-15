export const API_BASE_URL = (
  process.env.REACT_APP_API_URL || "/api"
).replace(/\/$/, "");

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    });
  } catch {
    throw new Error('Cannot connect to Swapr. Check your connection and retry.');
  }
  const data = await response.json().catch(() => {
    throw new Error('The API returned an invalid response. Check the web API address and retry.');
  });
  if (!response.ok) {
    if (response.status === 401)
      window.dispatchEvent(new Event("swapr-session-expired"));
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(", ")
        : (data.message ?? "Request failed."),
    );
  }
  return data as T;
}

export type Listing = {
  id: string;
  seller_id: string;
  name: string;
  description: string;
  category: string;
  category_title: string;
  price: string;
  quantity: number;
  condition: string;
  location: string;
  image: string;
  status: "live" | "draft" | "sold" | "archived";
  seller_name: string;
  created_at: string;
};
export type Category = {
  slug: string;
  title: string;
  icon: string;
  tone: string;
  listing_count: number;
};
export type Notice = {
  id: string;
  title: string;
  text: string;
  type: string;
  read_at: string | null;
  created_at: string;
  conversation_id: string | null;
};
export const money = (value: string | number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(
    Number(value),
  );
export const errorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
export function openConversation(id: string) {
  window.history.pushState(
    {},
    "",
    `/user/messages?conversation=${encodeURIComponent(id)}`,
  );
  window.dispatchEvent(new PopStateEvent("popstate"));
}
export async function chatWithSeller(listingId: string) {
  const data = await api<{ conversation: { id: string } }>("/conversations", {
    method: "POST",
    body: JSON.stringify({ listingId }),
  });
  openConversation(data.conversation.id);
}
export function readImage(file: File): Promise<string> {
  if (
    !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
    file.size > 2 * 1024 * 1024
  ) {
    return Promise.reject(
      new Error("Choose a PNG, JPEG or WebP image up to 2 MB."),
    );
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}
