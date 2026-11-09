"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  clearCart,
  createOrderNumber,
  getCartServerSnapshot,
  getCartSnapshot,
  parseCartSnapshot,
  saveOrder,
  subscribeToCart,
  writeCart,
  type CartEntry,
} from "../cart";
import { formatRupiah, menuItems } from "../menu-data";
import "./payment.css";

const methods = [
  { id: "transfer", label: "Transfer bank", note: "BCA, Mandiri, BNI, BRI" },
  { id: "ewallet", label: "E-wallet", note: "GoPay, OVO, DANA, ShopeePay" },
  { id: "qris", label: "QRIS", note: "Scan dari aplikasi apa saja" },
  { id: "cod", label: "Bayar di tempat", note: "Tunai saat pesanan tiba" },
];

const shippingFee = 10000;

export default function Page() {
  const router = useRouter();
  const cartSnapshot = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getCartServerSnapshot
  );
  const cartLoaded = cartSnapshot !== null;
  const cart = cartSnapshot === null ? [] : parseCartSnapshot(cartSnapshot);
  const [method, setMethod] = useState("transfer");
  const [form, setForm] = useState({
    nama: "",
    email: "",
    telepon: "",
    alamat: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const items = cart.flatMap((entry) => {
    const menuItem = menuItems.find((item) => item.id === entry.id);
    return menuItem ? [{ ...menuItem, qty: entry.qty }] : [];
  });
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = subtotal + shippingFee;

  const updateCart = (nextCart: CartEntry[]) => {
    writeCart(nextCart);
  };

  const updateQuantity = (id: number, change: number) => {
    const nextCart = cart
      .map((entry) =>
        entry.id === id ? { ...entry, qty: entry.qty + change } : entry
      )
      .filter((entry) => entry.qty > 0);
    updateCart(nextCart);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.nama.trim()) nextErrors.nama = "Nama wajib diisi.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = "Format email belum benar.";
    }
    if (!/^[0-9+\-\s]{9,15}$/.test(form.telepon)) {
      nextErrors.telepon = "Nomor telepon belum benar.";
    }
    if (!form.alamat.trim()) nextErrors.alamat = "Alamat antar wajib diisi.";
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || items.length === 0) return;

    const selectedMethod = methods.find((option) => option.id === method);
    if (!selectedMethod) {
      throw new Error("Metode pembayaran yang dipilih tidak tersedia.");
    }

    saveOrder({
      number: createOrderNumber(),
      date: new Intl.DateTimeFormat("id-ID", {
        dateStyle: "long",
      }).format(new Date()),
      method: selectedMethod.label,
      email: form.email.trim(),
      eta: "30 – 45 menit",
      items: cart,
    });
    clearCart();
    router.push("/success");
  };

  return (
    <>
      <header className="site-header">
        <div className="container">
          <Link className="logo" href="/">Kuliner Nusantara</Link>
          <nav className="nav">
            <Link href="/">Kembali ke menu</Link>
          </nav>
        </div>
      </header>

      <main className="container">
        <ol className="steps">
          <li><Link href="/#menu">Pilih menu</Link></li>
          <li className="is-current">Pembayaran</li>
          <li>Selesai</li>
        </ol>

        {!cartLoaded ? (
          <p className="cart-message" role="status">Memuat keranjang...</p>
        ) : items.length === 0 ? (
          <section className="cart-message">
            <h1>Keranjang masih kosong</h1>
            <p>Pilih menu yang kamu inginkan sebelum melanjutkan pembayaran.</p>
            <Link className="btn" href="/#menu">Pilih menu</Link>
          </section>
        ) : (
          <div className="checkout">
            <form id="checkout-form" className="checkout-form" onSubmit={handleSubmit} noValidate>
              <fieldset className="card">
                <legend>Data pemesan</legend>

                <div className={`field ${errors.nama ? "has-error" : ""}`}>
                  <label htmlFor="nama">Nama lengkap</label>
                  <input id="nama" name="nama" value={form.nama} onChange={handleChange} autoComplete="name" />
                  {errors.nama && <span className="error">{errors.nama}</span>}
                </div>

                <div className="field-row">
                  <div className={`field ${errors.email ? "has-error" : ""}`}>
                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" />
                    {errors.email && <span className="error">{errors.email}</span>}
                  </div>
                  <div className={`field ${errors.telepon ? "has-error" : ""}`}>
                    <label htmlFor="telepon">Nomor telepon</label>
                    <input id="telepon" name="telepon" type="tel" value={form.telepon} onChange={handleChange} autoComplete="tel" />
                    {errors.telepon && <span className="error">{errors.telepon}</span>}
                  </div>
                </div>

                <div className={`field ${errors.alamat ? "has-error" : ""}`}>
                  <label htmlFor="alamat">Alamat antar</label>
                  <textarea id="alamat" name="alamat" rows={3} value={form.alamat} onChange={handleChange} autoComplete="street-address" />
                  {errors.alamat && <span className="error">{errors.alamat}</span>}
                </div>
              </fieldset>

              <fieldset className="card">
                <legend>Metode pembayaran</legend>
                <div className="pay-options">
                  {methods.map((option) => (
                    <label className="pay-option" key={option.id}>
                      <input
                        type="radio"
                        name="method"
                        value={option.id}
                        checked={method === option.id}
                        onChange={() => setMethod(option.id)}
                      />
                      <span>
                        <strong>{option.label}</strong>
                        <small>{option.note}</small>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </form>

            <aside className="order-summary">
              <h2>Ringkasan pesanan</h2>
              {items.map((item) => (
                <div className="summary-item" key={item.id}>
                  <div className="summary-thumb">
                    <Image src={item.image} alt={item.name} fill sizes="56px" />
                  </div>
                  <div className="name">
                    {item.name}
                    <span className="qty">Jumlah: {item.qty}</span>
                    <div className="quantity-controls" aria-label={`Jumlah ${item.name}`}>
                      <button type="button" onClick={() => updateQuantity(item.id, -1)} aria-label={`Kurangi ${item.name}`}>−</button>
                      <span>{item.qty}</span>
                      <button type="button" onClick={() => updateQuantity(item.id, 1)} aria-label={`Tambah ${item.name}`}>+</button>
                      <button className="remove-item" type="button" onClick={() => updateCart(cart.filter((entry) => entry.id !== item.id))}>
                        Hapus
                      </button>
                    </div>
                  </div>
                  <div>{formatRupiah(item.price * item.qty)}</div>
                </div>
              ))}

              <div className="summary-line">
                <span>Subtotal</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              <div className="summary-line">
                <span>Ongkos kirim</span>
                <span>{formatRupiah(shippingFee)}</span>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <span>{formatRupiah(total)}</span>
              </div>

              <button className="btn btn--block" type="submit" form="checkout-form">
                Bayar {formatRupiah(total)}
              </button>
              <p className="secure-note">Pembayaranmu diproses lewat koneksi aman.</p>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}
