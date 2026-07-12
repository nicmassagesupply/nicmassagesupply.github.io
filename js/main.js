"use strict";
const state = {
  category: "all",
  search: "",
  sort: "featured",
  stock: false,
  page: 1,
  featuredOnly: true,
  current: null,
  cart: load("jin-cart"),
  wishlist: load("jin-wishlist")
};
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
function load(k) { try { return JSON.parse(localStorage.getItem(k)) || [] } catch { return [] } }
function save() { localStorage.setItem("jin-cart", JSON.stringify(state.cart)); localStorage.setItem("jin-wishlist", JSON.stringify(state.wishlist)) }
function money(n) { return new Intl.NumberFormat("en-US", { style: "currency", currency: STORE.currency }).format(n) }
function product(id) { return PRODUCTS.find(p => p.id === Number(id)) }
function allCats() { return CATEGORY_MENU.flatMap(g => [{ ...g, isGroup: true }, ...g.children.map(c => ({ ...c, group: g.key }))]) }
function label(key) { if (key === "all") return { zh: "所有产品", en: "All Products" }; return allCats().find(c => c.key === key) || { zh: "产品", en: "Products" } }

function renderNav() {
  $("#dynamicNav").innerHTML = `<li><button type="button" class="nav-link" data-category="all"><span>所有产品</span><small>All Products</small></button></li>${CATEGORY_MENU.map(g => `<li class="has-dropdown"><button class="nav-link dropdown-toggle" data-category="${g.key}"><span>${g.zh}</span><small>${g.en}</small><i>⌄</i></button><div class="dropdown"><button data-category="${g.key}"><b>全部${g.zh}</b><small>All ${g.en}</small></button>${g.children.map(c => `<button data-category="${c.key}"><b>${c.zh}</b><small>${c.en}</small></button>`).join("")}</div></li>`).join("")}<li><a class="nav-link" href="#how-to-order"><span>联系我们</span><small>Contact</small></a></li>`;
}

function filtered() {
  const q = state.search.trim().toLowerCase();

  let arr = PRODUCTS.filter(p => {
    const correctCategory =
      state.category === "all" ||
      p.group === state.category ||
      p.category === state.category;

    const correctStock = !state.stock || p.inStock;

    const searchableText = [
      p.nameZh || "",
      p.nameEn || "",
      p.categoryZh || "",
      p.categoryEn || "",
      p.descriptionZh || "",
      p.descriptionEn || "",
      ...(p.featuresZh || []),
      ...(p.featuresEn || [])
    ].join(" ").toLowerCase();

    const correctSearch = !q || searchableText.includes(q);

    return correctCategory && correctStock && correctSearch;
  });

  if (state.featuredOnly) {
    return arr
      .filter(p => p.featured === true)
      .sort((a, b) => a.id - b.id)
      .slice(0, 8);
  }

  if (state.sort === "low") {
    return arr.sort((a, b) => a.price - b.price);
  }

  if (state.sort === "high") {
    return arr.sort((a, b) => b.price - a.price);
  }

  if (state.sort === "name") {
    return arr.sort((a, b) =>
      (a.nameEn || "").localeCompare(b.nameEn || "")
    );
  }

  return arr.sort((a, b) =>
    Number(b.featured) - Number(a.featured) || a.id - b.id
  );
}

function card(p) { const wished = state.wishlist.includes(p.id); return `<article class="product-card" data-id="${p.id}"><div class="product-media"><img src="${p.image}" alt="${p.nameEn}" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><div class="image-fallback" hidden>${p.nameEn}</div>${p.badgeEn ? `<span class="badge">${p.badgeZh} ${p.badgeEn}</span>` : ""}<button class="wish ${wished ? "active" : ""}" data-action="wish">${wished ? "♥" : "♡"}</button><button class="quick" data-action="quick">快速查看 Quick View</button></div><div class="product-info"><small>${p.categoryZh} · ${p.categoryEn}</small><h3>${p.nameZh}<span>${p.nameEn}</span></h3><div class="price">${money(p.price)} ${p.oldPrice ? `<del>${money(p.oldPrice)}</del>` : ""}</div><p class="availability ${p.inStock ? "yes" : "no"}">${p.inStock ? "● 有货 In stock" : "● 暂时缺货 Out of stock"}</p><button class="add" data-action="cart" ${p.inStock ? "" : "disabled"}>${p.inStock ? "+ 加入购物车 Add to Cart" : "暂时缺货 Out of Stock"}</button></div></article>` }

function renderProducts() {
  const list = filtered(), pages = Math.max(1, Math.ceil(list.length / STORE.perPage)); state.page = Math.min(state.page, pages); const visible = list.slice((state.page - 1) * STORE.perPage, state.page * STORE.perPage), l = label(state.category);
  $("#productsTitle").innerHTML = `${l.zh} <span>${l.en}</span>`; $("#resultCount").textContent = `找到 ${list.length} 件产品 · ${list.length} products found`; $("#productGrid").innerHTML = visible.map(card).join(""); $("#emptyState").hidden = !!list.length; $("#productGrid").hidden = !list.length;
  $$(".dropdown-toggle[data-category]").forEach(el => {
    const category = allCats().find(
        item => item.key === state.category
    );

    el.classList.toggle(
        "active",
        el.dataset.category === state.category ||
        el.dataset.category === category?.group
    );
});
  $("#pagination").innerHTML = pages < 2 ? "" : `<button data-page="${state.page - 1}" ${state.page === 1 ? "disabled" : ""}>←</button>${Array.from({ length: pages }, (_, i) => `<button data-page="${i + 1}" class="${state.page === i + 1 ? "active" : ""}">${i + 1}</button>`).join("")}<button data-page="${state.page + 1}" ${state.page === pages ? "disabled" : ""}>→</button>`;
}

function selectCategory(key, scroll = true) {
  state.category = allCats().some(c => c.key === key) ? key : "all";
  state.featuredOnly = false;
  state.page = 1;
  renderProducts();
  closeMobile();
  if (scroll) {
    $("#products").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
function reset() {
  state.category = "all";
  state.search = "";
  state.sort = "featured";
  state.stock = false;
  state.page = 1;
  state.featuredOnly = true;
  $("#searchInput").value = "";
  $("#sortSelect").value = "featured";
  $("#stockOnly").checked = false;
  renderProducts();
}

function galleryImages(p) {
  const images = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
  return [...new Set([p.image, ...images].filter(Boolean))];
}

function changeModalImage(imagePath, productName) {
  const image = $("#modalImage"), fallback = $("#modalFallback");
  image.src = imagePath;
  image.alt = productName || "Product image";
  image.hidden = false;
  fallback.hidden = true;
  image.onerror = () => {
    image.hidden = true;
    fallback.hidden = false;
    fallback.textContent = productName || "Product image";
  };
  $$(".modal-thumbnail").forEach(button => button.classList.toggle("active", button.dataset.image === imagePath));
}

function renderModalGallery(p) {
  const images = galleryImages(p);
  $("#modalThumbnails").innerHTML = images.map((src, index) => `
    <button type="button" class="modal-thumbnail ${index === 0 ? "active" : ""}" data-image="${src}" data-index="${index}" aria-label="View image ${index + 1}">
      <img src="${src}" alt="${p.nameEn} ${index + 1}" loading="lazy" onerror="this.closest('.modal-thumbnail').hidden=true">
    </button>`).join("");
  $("#modalThumbnails").hidden = images.length < 2;
  changeModalImage(images[0] || p.image, p.nameEn);
}

function openModal(p) {
  if (!p) return;
  state.current = p.id;
  $("#modalCategory").textContent = `${p.categoryZh} · ${p.categoryEn}`;
  $("#modalName").innerHTML = `${p.nameZh}<span>${p.nameEn}</span>`;
  $("#modalPrice").innerHTML = `${money(p.price)} ${p.oldPrice ? `<del>${money(p.oldPrice)}</del>` : ""}`;
  $("#modalDescription").innerHTML = `${p.descriptionZh}<br><span>${p.descriptionEn}</span>`;
  $("#modalFeatures").innerHTML = p.featuresZh.map((x, i) => `<li>${x} <span>${p.featuresEn[i] || ""}</span></li>`).join("");
  renderModalGallery(p);
  $("#modalCart").disabled = !p.inStock;
  updateModalWish();
  $("#quickView").classList.add("show");
  $(".overlay").classList.add("show");
  document.body.classList.add("locked");
}

function openLightbox(index) {
  const p = product(state.current);
  if (!p) return;
  const images = galleryImages(p);
  if (!images.length) return;
  const safeIndex = (Number(index) + images.length) % images.length;
  $("#imageLightbox").dataset.index = safeIndex;
  $("#lightboxImage").src = images[safeIndex];
  $("#lightboxImage").alt = `${p.nameEn} ${safeIndex + 1}`;
  $("#lightboxCounter").textContent = `${safeIndex + 1} / ${images.length}`;
  $("#lightboxPrev").hidden = images.length < 2;
  $("#lightboxNext").hidden = images.length < 2;
  $("#imageLightbox").classList.add("show");
  $("#imageLightbox").setAttribute("aria-hidden", "false");
}

function closeLightbox() {
  $("#imageLightbox").classList.remove("show");
  $("#imageLightbox").setAttribute("aria-hidden", "true");
}

function moveLightbox(step) {
  openLightbox(Number($("#imageLightbox").dataset.index || 0) + step);
}

function closeModal() { $("#quickView").classList.remove("show"); if (!$(".drawer.open")) { $(".overlay").classList.remove("show"); document.body.classList.remove("locked") } }
function updateModalWish() { const on = state.wishlist.includes(state.current); $("#modalWish").classList.toggle("active", on); $("#modalWish").textContent = on ? "♥" : "♡" }

function addCart(id) { const p = product(id); if (!p || !p.inStock) return; const old = state.cart.find(x => x.id === p.id); old ? old.qty++ : state.cart.push({ id: p.id, qty: 1 }); save(); renderCart(); toast(`已加入购物车 · Added ${p.nameEn}`) }
function toggleWish(id) { const p = product(id); if (!p) return; state.wishlist = state.wishlist.includes(p.id) ? state.wishlist.filter(x => x !== p.id) : [...state.wishlist, p.id]; save(); renderWish(); renderProducts(); updateModalWish(); toast(`心愿单已更新 · Wishlist updated`) }
function itemRow(p, actions) { return `<article class="drawer-item" data-id="${p.id}"><img src="${p.image}" alt=""><div><h3>${p.nameZh}<span>${p.nameEn}</span></h3><strong>${money(p.price)}</strong>${actions}</div></article>` }
function renderCart() { let total = 0, count = 0; $("#cartList").innerHTML = state.cart.map(x => { const p = product(x.id); if (!p) return ""; total += p.price * x.qty; count += x.qty; return itemRow(p, `<div class="quantity"><button data-cart="minus">−</button><span>${x.qty}</span><button data-cart="plus">+</button><button data-cart="remove">删除</button></div>`) }).join(""); $(".cart-count").textContent = count; $("#subtotal").textContent = money(total); $("#cartEmpty").hidden = !!state.cart.length }
function renderWish() { const list = state.wishlist.map(product).filter(Boolean); $("#wishlistList").innerHTML = list.map(p => itemRow(p, `<div class="quantity"><button data-wish="cart">Add to Cart</button><button data-wish="remove">删除</button></div>`)).join(""); $(".wishlist-count").textContent = list.length; $("#wishlistEmpty").hidden = !!list.length }
function openDrawer(el) { closeModal(); $$('.drawer').forEach(x => x.classList.remove('open')); el.classList.add('open'); $(".overlay").classList.add("show"); document.body.classList.add("locked") }
function closeDrawers() { $$('.drawer').forEach(x => x.classList.remove('open')); $(".overlay").classList.remove("show"); document.body.classList.remove("locked") }
function toast(t) { $(".toast").textContent = t; $(".toast").classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => $(".toast").classList.remove("show"), 2200) }
function closeMobile() { $("#dynamicNav").classList.remove("open"); $$('.has-dropdown').forEach(x => x.classList.remove('open')) }

document.addEventListener("click", e => {
  const toggle = e.target.closest('.dropdown-toggle'); if (toggle && matchMedia('(max-width:900px)').matches) { e.preventDefault(); const li = toggle.closest('.has-dropdown'), was = li.classList.contains('open'); $$('.has-dropdown').forEach(x => x.classList.remove('open')); li.classList.toggle('open', !was); return }
  const cat = e.target.closest('[data-category]'); if (cat) { e.preventDefault(); selectCategory(cat.dataset.category); return }
  if (e.target.closest('.show-all')) {
    state.featuredOnly = false;
    state.category = 'all';
    state.page = 1;
    renderProducts();
    closeMobile();
    $("#products").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (e.target.closest('.reset')) { reset(); return }

  const thumbnail = e.target.closest('.modal-thumbnail');
  if (thumbnail) { changeModalImage(thumbnail.dataset.image, product(state.current)?.nameEn || 'Product'); return }
  if (e.target.closest('#modalMainImage')) {
    const active = $('.modal-thumbnail.active');
    openLightbox(active ? Number(active.dataset.index) : 0);
    return;
  }
  if (e.target.closest('#lightboxClose') || e.target.id === 'imageLightbox') { closeLightbox(); return }
  if (e.target.closest('#lightboxPrev')) { moveLightbox(-1); return }
  if (e.target.closest('#lightboxNext')) { moveLightbox(1); return }

  const c = e.target.closest('.product-card'); if (c) { const a = e.target.closest('[data-action]')?.dataset.action; if (a === 'quick') openModal(product(c.dataset.id)); if (a === 'cart') addCart(c.dataset.id); if (a === 'wish') toggleWish(Number(c.dataset.id)) }
});

document.addEventListener("DOMContentLoaded", () => { renderNav(); const q = new URLSearchParams(location.search).get('category'); if (q) state.category = q; renderProducts(); renderCart(); renderWish(); $("#searchInput").oninput = e => { state.search = e.target.value; state.page = 1; renderProducts() }; $("#sortSelect").onchange = e => { state.sort = e.target.value; renderProducts() }; $("#stockOnly").onchange = e => { state.stock = e.target.checked; renderProducts() }; $("#pagination").onclick = e => { const b = e.target.closest('[data-page]'); if (b && !b.disabled) { state.page = Number(b.dataset.page); renderProducts(); $("#products").scrollIntoView({ behavior: 'smooth' }) } }; $(".mobile-toggle").onclick = () => $("#dynamicNav").classList.toggle('open'); $(".cart-open").onclick = () => openDrawer($("#cartDrawer")); $(".wishlist-open").onclick = () => openDrawer($("#wishlistDrawer")); $$('.drawer-close').forEach(b => b.onclick = closeDrawers); $(".overlay").onclick = () => { closeModal(); closeDrawers() }; $(".modal-close").onclick = closeModal; $("#modalCart").onclick = () => addCart(state.current); $("#modalWish").onclick = () => toggleWish(state.current); $("#cartList").onclick = e => { const row = e.target.closest('.drawer-item'), a = e.target.dataset.cart; if (!row || !a) return; const x = state.cart.find(i => i.id === Number(row.dataset.id)); if (a === 'plus') x.qty++; if (a === 'minus') x.qty--; if (a === 'remove' || x.qty < 1) state.cart = state.cart.filter(i => i.id !== x.id); save(); renderCart() }; $("#wishlistList").onclick = e => { const row = e.target.closest('.drawer-item'), a = e.target.dataset.wish; if (!row || !a) return; a === 'cart' ? addCart(row.dataset.id) : toggleWish(Number(row.dataset.id)) }; document.onkeydown = e => { if (e.key === 'Escape') { closeLightbox(); closeModal(); closeDrawers(); closeMobile() } if ($('#imageLightbox').classList.contains('show') && e.key === 'ArrowLeft') moveLightbox(-1); if ($('#imageLightbox').classList.contains('show') && e.key === 'ArrowRight') moveLightbox(1) } });
