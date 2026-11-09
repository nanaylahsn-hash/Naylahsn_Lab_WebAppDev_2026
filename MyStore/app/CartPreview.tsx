"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  getCartServerSnapshot,
  getCartSnapshot,
  parseCartSnapshot,
  subscribeToCart,
} from "./cart";
import { formatRupiah, menuItems } from "./menu-data";

export default function CartPreview() {
  const snapshot = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getCartServerSnapshot
  );
  const cart = snapshot === null ? [] : parseCartSnapshot(snapshot);
  const items = cart.flatMap((entry) => {
    const menuItem = menuItems.find((item) => item.id === entry.id);
    return menuItem ? [{ ...menuItem, qty: entry.qty }] : [];
  });

  if (items.length === 0) return null;

  const quantity = items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <aside className="cart-preview" aria-live="polite" aria-label="Pesanan saat ini">
      <div className="cart-preview-heading">
        <div>
          <strong>Pesanan kamu</strong>
          <span>{quantity} item dipilih</span>
        </div>
        <span className="cart-preview-total">{formatRupiah(subtotal)}</span>
      </div>
      <ul className="cart-preview-items">
        {items.map((item) => (
          <li key={item.id}>
            <span>{item.name} <strong>× {item.qty}</strong></span>
            <span>{formatRupiah(item.price * item.qty)}</span>
          </li>
        ))}
      </ul>
      <Link className="btn btn--block" href="/payment">
        Lihat pesanan &amp; checkout
      </Link>
    </aside>
  );
}
