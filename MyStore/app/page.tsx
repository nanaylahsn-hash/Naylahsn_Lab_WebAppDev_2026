import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import CartPreview from "./CartPreview";
import { formatRupiah, menuItems } from "./menu-data";
import "./home.css";

const heroImage = "/logo.jpeg";

export default function Page() {
  return (
    <>
      <header className="site-header">
        <div className="container">
          <Link className="logo" href="/">Kuliner Nusantara</Link>
          <nav className="nav">
            <a href="#menu">Menu</a>
            <a href="#tentang">Tentang</a>
            <Link className="btn" href="/payment">Keranjang</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container">
            <div>
              <h1>Masakan rumahan, diantar selagi hangat</h1>
              <p>
                Dimasak setiap hari dengan bumbu pilihan. Pilih menu favoritmu,
                bayar dengan cara yang kamu suka, dan kami antar sampai depan pintu.
              </p>
              <div className="hero-actions">
                <Link className="btn" href="/payment">Pesan sekarang</Link>
                <a className="btn btn--ghost" href="#menu">Lihat menu</a>
              </div>
            </div>
            <div className="hero-visual">
              {heroImage ? (
                <Image
                  src={heroImage}
                  alt="Hidangan Dapur Nusantara"
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 50vw"
                />
              ) : (
                <div className="img-placeholder">Foto hero</div>
              )}
            </div>
          </div>
        </section>

        <CartPreview />

        <section className="products" id="menu">
          <div className="container">
            <div className="section-head">
              <h2>Menu hari ini</h2>
              <a href="#menu">Lihat semua</a>
            </div>

            <div className="product-grid">
              {menuItems.map((m) => (
                <article className="product-card" key={m.id}>
                  <div className="product-media">
                    {m.image ? (
                      <Image
                        src={m.image}
                        alt={m.name}
                        fill
                        sizes="(max-width: 560px) 100vw, 25vw"
                      />
                    ) : (
                      <div className="img-placeholder">Foto menu</div>
                    )}
                  </div>
                  <div className="product-body">
                    {m.badge && <span className="badge">{m.badge}</span>}
                    <h3>{m.name}</h3>
                    <p>{m.desc}</p>
                    <div className="price">{formatRupiah(m.price)}</div>
                    <AddToCartButton itemId={m.id} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer" id="tentang">
        <div className="container">
          Dapur Nusantara · Buka setiap hari 08.00 – 21.00 · © 2026
        </div>
      </footer>
    </>
  );
}
