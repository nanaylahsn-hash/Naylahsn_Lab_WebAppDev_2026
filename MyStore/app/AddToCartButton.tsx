"use client";

import { useSyncExternalStore } from "react";
import {
  addToCart,
  getCartServerSnapshot,
  getCartSnapshot,
  parseCartSnapshot,
  subscribeToCart,
} from "./cart";

export default function AddToCartButton({ itemId }: { itemId: number }) {
  const snapshot = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getCartServerSnapshot
  );
  const quantity =
    snapshot === null
      ? 0
      : parseCartSnapshot(snapshot).find((entry) => entry.id === itemId)?.qty ?? 0;

  const handleAdd = () => {
    addToCart(itemId);
  };

  return (
    <div className="add-to-cart-actions">
      {quantity > 0 && (
        <span className="menu-selection" aria-live="polite">
          ✓ Dipilih · {quantity}
        </span>
      )}
      <button
        className="btn btn--block"
        type="button"
        onClick={handleAdd}
      >
        {quantity > 0 ? "Tambah lagi" : "Tambah ke keranjang"}
      </button>
    </div>
  );
}
