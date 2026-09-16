(function(){
  const PRODUCTS = [
    { id:'kb',  initial:'K', name:'Keyboard Mekanik', category:'Aksesoris', price:450000, stock:12 },
    { id:'ms',  initial:'M', name:'Mouse Wireless',   category:'Aksesoris', price:185000, stock:30 },
    { id:'hs',  initial:'H', name:'Headset Gaming',   category:'Audio',     price:320000, stock:8  },
    { id:'eb',  initial:'E', name:'Earbuds TWS',      category:'Audio',     price:275000, stock:0  },
    { id:'fd',  initial:'F', name:'Flashdisk 64GB',   category:'Penyimpanan', price:95000, stock:45 },
    { id:'ssd', initial:'S', name:'SSD Eksternal 1TB',category:'Penyimpanan', price:1150000, stock:5 },
    { id:'mon', initial:'D', name:'Monitor 24 inci',  category:'Display', price:1850000, stock:6 },
    { id:'wc',  initial:'W', name:'Webcam Full HD',   category:'Display', price:245000, stock:18 },
    { id:'mp',  initial:'P', name:'Mousepad XL',      category:'Aksesoris', price:75000, stock:40 },
  ];

  const FREE_SHIP_THRESHOLD = 300000;
  const VOUCHERS = {
    'DISKON10': { type:'percent', value:10, label:'Diskon 10%' },
    'HEMAT20K': { type:'flat', value:20000, label:'Potongan Rp20.000' },
  };

  let cart = {};       
  let appliedVoucher = null;
  let lastOrderMsg = '';
  let addedFlash = {};  

  const fmt = (n) => 'Rp' + n.toLocaleString('id-ID');

  const categories = ['Semua', ...new Set(PRODUCTS.map(p => p.category))];
  const catSelect = document.getElementById('categoryFilter');
  categories.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c === 'Semua' ? 'Semua kategori' : c;
    catSelect.appendChild(opt);
  });

  const grid = document.getElementById('productGrid');
  const resultCount = document.getElementById('resultCount');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortFilter');

  function getFiltered(){
    const q = searchInput.value.trim().toLowerCase();
    const cat = catSelect.value;
    const sort = sortSelect.value;
    let list = PRODUCTS.filter(p => {
      const matchQ = !q || p.name.toLowerCase().includes(q);
      const matchCat = cat === 'Semua' || p.category === cat;
      return matchQ && matchCat;
    });
    if (sort === 'price-asc') list = [...list].sort((a,b)=>a.price-b.price);
    if (sort === 'price-desc') list = [...list].sort((a,b)=>b.price-a.price);
    if (sort === 'name-asc') list = [...list].sort((a,b)=>a.name.localeCompare(b.name));
    return list;
  }

  function renderGrid(){
    const list = getFiltered();
    resultCount.textContent = `${list.length} produk ditampilkan dari total ${PRODUCTS.length}`;
    grid.innerHTML = '';
    if (list.length === 0){
      grid.innerHTML = '<div class="no-results">Tidak ada produk yang cocok. Coba kata kunci lain.</div>';
      return;
    }
    list.forEach(p => {
      const card = document.createElement('div');
      card.className = 'card';
      const inCart = cart[p.id] || 0;
      const outOfStock = p.stock === 0;
      const maxReached = inCart >= p.stock;

      let actionHtml;
      if (outOfStock){
        actionHtml = `<button class="btn-add" disabled>Habis</button>`;
      } else if (inCart > 0){
        actionHtml = `
          <div class="qty-row">
            <button data-action="dec" data-id="${p.id}" aria-label="Kurangi">−</button>
            <span>${inCart}</span>
            <button data-action="inc" data-id="${p.id}" ${maxReached ? 'disabled' : ''} aria-label="Tambah">+</button>
          </div>`;
      } else {
        actionHtml = `<button class="btn-add ${addedFlash[p.id] ? 'added' : ''}" data-action="add" data-id="${p.id}">${addedFlash[p.id] ? 'Ditambahkan ✓' : 'Tambah'}</button>`;
      }

      card.innerHTML = `
        <div class="initial">${p.initial}</div>
        <span class="badge">${p.category}</span>
        <p class="prod-name">${p.name}</p>
        <p class="prod-price">${fmt(p.price)}</p>
        <p class="prod-stock ${outOfStock ? 'out' : ''}">${outOfStock ? 'Stok habis' : 'Stok tersedia: ' + p.stock}</p>
        ${actionHtml}
      `;
      grid.appendChild(card);
    });
  }

  function calcTotals(){
    const items = Object.entries(cart).map(([id, qty]) => {
      const p = PRODUCTS.find(x => x.id === id);
      return { p, qty, total: p.price * qty };
    });
    const subtotal = items.reduce((s, it) => s + it.total, 0);
    let discount = 0;
    if (appliedVoucher){
      const v = VOUCHERS[appliedVoucher];
      if (v.type === 'percent') discount = Math.round(subtotal * v.value / 100);
      else discount = Math.min(v.value, subtotal);
    }
    const afterDiscount = subtotal - discount;
    const shipping = subtotal === 0 ? 0 : (subtotal >= FREE_SHIP_THRESHOLD ? 0 : 15000);
    const total = afterDiscount + shipping;
    return { items, subtotal, discount, shipping, total };
  }

  function renderCart(){
    const { items, subtotal, discount, shipping, total } = calcTotals();
    const count = Object.values(cart).reduce((a,b)=>a+b,0);
    document.getElementById('cartCount').textContent = count;

    const body = document.getElementById('cartBody');

    if (items.length === 0){
      body.innerHTML = `
        <div class="cart-empty">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <div>Keranjang masih kosong.</div>
        </div>
        <p class="shipping-note">Belanja ${fmt(FREE_SHIP_THRESHOLD)} untuk gratis ongkir.</p>
        <div class="progress-track"><div class="progress-fill" style="width:0%"></div></div>
        <div class="voucher-row">
          <input type="text" id="voucherInput" placeholder="Kode voucher" disabled>
          <button id="voucherBtn" disabled>Pakai</button>
        </div>
        <div class="summary-row"><span>Subtotal</span><span>${fmt(0)}</span></div>
        <div class="summary-row"><span>Diskon</span><span>-${fmt(0)}</span></div>
        <div class="summary-row"><span>Ongkir</span><span>Gratis</span></div>
        <div class="summary-total"><span class="label">Total</span><span class="amount">${fmt(0)}</span></div>
        <button class="btn-checkout" disabled>Checkout</button>
        ${lastOrderMsg ? `<div class="order-confirm">${lastOrderMsg}</div>` : ''}
      `;
      return;
    }

    const remain = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);
    const pct = Math.min(100, Math.round(subtotal / FREE_SHIP_THRESHOLD * 100));

    const itemsHtml = items.map(({p, qty, total}) => `
      <div class="cart-item">
        <div class="ci-init">${p.initial}</div>
        <div class="ci-body">
          <p class="ci-name">${p.name}</p>
          <div class="ci-price">${fmt(p.price)}</div>
          <div class="ci-controls">
            <button data-action="dec" data-id="${p.id}">−</button>
            <span>${qty}</span>
            <button data-action="inc" data-id="${p.id}" ${qty >= p.stock ? 'disabled' : ''}>+</button>
            <button class="ci-remove" data-action="remove" data-id="${p.id}">Hapus</button>
          </div>
        </div>
        <div class="ci-total">${fmt(total)}</div>
      </div>
    `).join('');

    body.innerHTML = `
      <div class="cart-items">${itemsHtml}</div>
      <p class="shipping-note">${remain > 0 ? `Belanja ${fmt(remain)} lagi untuk gratis ongkir.` : 'Kamu mendapat gratis ongkir! 🎉'}</p>
      <div class="progress-track"><div class="progress-fill ${pct>=100?'full':''}" style="width:${pct}%"></div></div>
      <div class="voucher-row">
        <input type="text" id="voucherInput" placeholder="Kode voucher" value="${appliedVoucher || ''}">
        <button id="voucherBtn">${appliedVoucher ? 'Lepas' : 'Pakai'}</button>
      </div>
      <div id="voucherMsgSlot"></div>
      <div class="summary-row"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
      <div class="summary-row discount"><span>Diskon</span><span>-${fmt(discount)}</span></div>
      <div class="summary-row"><span>Ongkir</span><span>${shipping === 0 ? 'Gratis' : fmt(shipping)}</span></div>
      <div class="summary-total"><span class="label">Total</span><span class="amount">${fmt(total)}</span></div>
      <button class="btn-checkout" id="checkoutBtn">Checkout</button>
      ${lastOrderMsg ? `<div class="order-confirm">${lastOrderMsg}</div>` : ''}
    `;
  }

  function render(){
    renderGrid();
    renderCart();
  }

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    const p = PRODUCTS.find(x => x.id === id);
    const current = cart[id] || 0;

    if (action === 'add'){
      cart[id] = 1;
      lastOrderMsg = '';
      if (addedFlash[id]) clearTimeout(addedFlash[id]);
      addedFlash[id] = setTimeout(()=>{ delete addedFlash[id]; render(); }, 900);
    } else if (action === 'inc' && current < p.stock){
      cart[id] = current + 1;
    } else if (action === 'dec'){
      if (current <= 1) delete cart[id]; else cart[id] = current - 1;
    }
    render();
  });

  document.getElementById('cartBody').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (btn){
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      const p = PRODUCTS.find(x => x.id === id);
      const current = cart[id] || 0;
      if (action === 'inc' && current < p.stock) cart[id] = current + 1;
      if (action === 'dec'){ if (current <= 1) delete cart[id]; else cart[id] = current - 1; }
      if (action === 'remove') delete cart[id];
      render();
      return;
    }
    if (e.target.id === 'voucherBtn'){
      const input = document.getElementById('voucherInput');
      const code = input.value.trim().toUpperCase();
      const slot = document.getElementById('voucherMsgSlot');
      if (appliedVoucher){
        appliedVoucher = null;
        render();
        return;
      }
      if (!code){
        slot.innerHTML = `<p class="voucher-msg err">Masukkan kode voucher dulu.</p>`;
        return;
      }
      if (VOUCHERS[code]){
        appliedVoucher = code;
        render();
        setTimeout(()=>{
          const s = document.getElementById('voucherMsgSlot');
          if (s) s.innerHTML = `<p class="voucher-msg ok">Voucher "${code}" dipakai — ${VOUCHERS[code].label}.</p>`;
        }, 0);
      } else {
        slot.innerHTML = `<p class="voucher-msg err">Kode voucher tidak ditemukan.</p>`;
      }
      return;
    }
    if (e.target.id === 'checkoutBtn'){
      const { items, total } = calcTotals();
      const itemCount = items.reduce((a,it)=>a+it.qty,0);
      lastOrderMsg = `Pesanan ${itemCount} barang senilai ${fmt(total)} berhasil dibuat.`;
      cart = {};
      appliedVoucher = null;
      render();
      if (window.innerWidth <= 920){
        setTimeout(()=>{ closeCart(); }, 1400);
      }
    }
  });

  searchInput.addEventListener('input', renderGrid);
  catSelect.addEventListener('change', renderGrid);
  sortSelect.addEventListener('change', renderGrid);

  const cartPanel = document.getElementById('cartPanel');
  const scrim = document.getElementById('scrim');
  function openCart(){ cartPanel.classList.add('open'); scrim.classList.add('open'); }
  function closeCart(){ cartPanel.classList.remove('open'); scrim.classList.remove('open'); }
  document.getElementById('cartToggle').addEventListener('click', openCart);
  document.getElementById('cartClose').addEventListener('click', closeCart);
  scrim.addEventListener('click', closeCart);

  render();
})();