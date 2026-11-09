import { menuItems } from "./menu-data";

export type CartEntry = {
  id: number;
  qty: number;
};

export type OrderReceipt = {
  number: string;
  date: string;
  method: string;
  email: string;
  eta: string;
  items: CartEntry[];
};

const CART_KEY = "dapur-nusantara-cart";
const ORDER_KEY = "dapur-nusantara-last-order";
const CART_CHANGE_EVENT = "dapur-nusantara-cart-change";
const ORDER_CHANGE_EVENT = "dapur-nusantara-order-change";
const menuIds = new Set(menuItems.map((item) => item.id));

export function subscribeToCart(onChange: () => void) {
  window.addEventListener(CART_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CART_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function getCartSnapshot() {
  return localStorage.getItem(CART_KEY) ?? "[]";
}

export function getCartServerSnapshot(): null {
  return null;
}

export function parseCartSnapshot(snapshot: string): CartEntry[] {
  try {
    const parsed: unknown = JSON.parse(snapshot);
    if (!Array.isArray(parsed) || !parsed.every(isCartEntry)) {
      throw new Error("Data keranjang tidak valid.");
    }

    return parsed;
  } catch (error) {
    console.error("Gagal membaca data keranjang.", error);
    return [];
  }
}

export function subscribeToOrder(onChange: () => void) {
  window.addEventListener(ORDER_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(ORDER_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function getOrderSnapshot() {
  return sessionStorage.getItem(ORDER_KEY) ?? "";
}

export function getOrderServerSnapshot(): null {
  return null;
}

function isCartEntry(value: unknown): value is CartEntry {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === "number" &&
    menuIds.has(entry.id) &&
    typeof entry.qty === "number" &&
    Number.isInteger(entry.qty) &&
    entry.qty > 0
  );
}

export function readCart(): CartEntry[] {
  return parseCartSnapshot(getCartSnapshot());
}

export function writeCart(items: CartEntry[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_CHANGE_EVENT));
}

export function addToCart(id: number) {
  const cart = readCart();
  const existing = cart.find((entry) => entry.id === id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, qty: 1 });
  }

  writeCart(cart);
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event(CART_CHANGE_EVENT));
}

export function saveOrder(order: OrderReceipt) {
  sessionStorage.setItem(ORDER_KEY, JSON.stringify(order));
  window.dispatchEvent(new Event(ORDER_CHANGE_EVENT));
}

export function createOrderNumber() {
  return `DN-${Date.now()}`;
}

export function parseOrderSnapshot(saved: string): OrderReceipt | null {
  if (!saved) return null;
  try {
    const parsed: unknown = JSON.parse(saved);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("number" in parsed) ||
      typeof parsed.number !== "string" ||
      !("date" in parsed) ||
      typeof parsed.date !== "string" ||
      !("method" in parsed) ||
      typeof parsed.method !== "string" ||
      !("email" in parsed) ||
      typeof parsed.email !== "string" ||
      !("eta" in parsed) ||
      typeof parsed.eta !== "string" ||
      !("items" in parsed) ||
      !Array.isArray(parsed.items) ||
      !parsed.items.every(isCartEntry)
    ) {
      throw new Error("Data pesanan tidak valid.");
    }

    return parsed as OrderReceipt;
  } catch (error) {
    console.error("Gagal membaca data pesanan terakhir.", error);
    return null;
  }
}
