"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  getOrderServerSnapshot,
  getOrderSnapshot,
  parseOrderSnapshot,
  subscribeToOrder,
} from "../cart";
import { formatRupiah, menuItems } from "../menu-data";
import "./success.css";

const shippingFee = 12000;

export default function Page() {
  const orderSnapshot = useSyncExternalStore(
    subscribeToOrder,
    getOrderSnapshot,
    getOrderServerSnapshot
  );
  const orderLoaded = orderSnapshot !== null;
  const order = orderSnapshot === null ? null : parseOrderSnapshot(orderSnapshot);

  const items = order?.items.flatMap((entry) => {
    const menuItem = menuItems.find((item) => item.id === entry.id);
    return menuItem ? [{ ...menuItem, qty: entry.qty }] : [];
  }) ?? [];
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <>
      <header className="site-header">
        <div className="container">
          <Link className="logo" href="/">Kuliner Nusantara</Link>
        </div>
      </header>

      <main className="success-page">
        {!orderLoaded ? (
          <div className="success-card" role="status">Memuat detail pesanan...</div>
        ) : !order || items.length === 0 ? (
          <div className="success-card">
            <h1>Belum ada pesanan</h1>
            <p>Silakan pilih menu dan selesaikan checkout terlebih dahulu.</p>
            <Link className="btn" href="/#menu">Pilih menu</Link>
          </div>
        ) : (
          <div className="success-card">
            <div className="check-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1>Pesanan diterima</h1>
            <p>
              Terima kasih! Detail pesanan akan dikirim ke {order.email}.
              Dapur kami mulai menyiapkan pesananmu.
            </p>

            <div className="receipt">
              <div className="receipt-row">
                <span>Nomor pesanan</span>
                <span>{order.number}</span>
              </div>
              <div className="receipt-row">
                <span>Tanggal</span>
                <span>{order.date}</span>
              </div>
              <div className="receipt-row">
                <span>Metode</span>
                <span>{order.method}</span>
              </div>
              <div className="receipt-row">
                <span>Perkiraan tiba</span>
                <span>{order.eta}</span>
              </div>
              {items.map((item) => (
                <div className="receipt-row" key={item.id}>
                  <span>{item.name} × {item.qty}</span>
                  <span>{formatRupiah(item.price * item.qty)}</span>
                </div>
              ))}
              <div className="receipt-row">
                <span>Subtotal</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              <div className="receipt-row">
                <span>Ongkos kirim</span>
                <span>{formatRupiah(shippingFee)}</span>
              </div>
              <div className="receipt-row total">
                <span>Total dibayar</span>
                <span>{formatRupiah(subtotal + shippingFee)}</span>
              </div>
            </div>

            <div className="success-actions">
              <Link className="btn" href="/">Pesan lagi</Link>
              <Link className="btn btn--ghost" href="/payment">Kembali ke menu</Link>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
