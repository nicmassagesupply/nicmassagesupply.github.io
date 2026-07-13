"use strict";

/* ================================================================
   SƠ ĐỒ FILE
   1. Cấu hình và trạng thái
   2. Hàm dùng chung cho dữ liệu, giá và số lượng tối thiểu
   3. Menu, bộ lọc và danh sách sản phẩm
   4. Popup chi tiết sản phẩm
   5. Giỏ hàng / bảng giá
   6. WeChat, sao chép và giao diện chung
   7. Các sự kiện click, nhập liệu
   ================================================================ */

/* 1. CẤU HÌNH VÀ TRẠNG THÁI ------------------------------------ */
const isProductsPage = document.body.dataset.page === "products";
const WECHAT_ID = "nic1234";
const BRAND_NAME = "Nic Massage Supply";

const state = {
  category: "all",
  search: "",
  sort: "featured",
  page: 1,
  featuredOnly: !isProductsPage,
  current: null,
  currentOptionIndex: 0,
  selection: loadSelection(),
  contactText: ""
};

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

function loadJson(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
}

function loadSelection() {
  const current = loadJson("nic-price-list");
  if (current.length) return current;

  /* Chuyển dữ liệu từ phiên bản Jin cũ sang Nic một lần. */
  const oldPriceList = loadJson("jin-price-list");
  if (oldPriceList.length) return oldPriceList;

  return loadJson("jin-cart").map(item => ({
    key: item.key || `${item.id}::${item.size || "base"}`,
    id: Number(item.id),
    qty: Number(item.qty || 1),
    optionZh: item.size || "",
    optionEn: item.size || "",
    price: Number(item.price || 0)
  }));
}

function saveSelection() {
  localStorage.setItem("nic-price-list", JSON.stringify(state.selection));
}

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: STORE.currency
  }).format(Number(value || 0));
}

function priceText(value) {
  return Number(value) > 0 ? money(value) : "询价 · Contact for price";
}

/* 2. HÀM DÙNG CHUNG CHO DỮ LIỆU SẢN PHẨM ----------------------- */
function productUnit(p) {
  return String(p?.unit || "件").trim() || "件";
}

function minimumOrderQty(p) {
  const quantity = Math.floor(Number(p?.minOrderQty || 1));
  return quantity > 0 ? quantity : 1;
}

function priceMeta(p, value) {
  const unit = productUnit(p);
  const minimum = minimumOrderQty(p);
  const unitText = Number(value) > 0 ? `<small class="price-unit">/ ${unit}</small>` : "";
  const minimumText = minimum > 1
    ? `<small class="minimum-order">(${minimum}${unit}起订)</small>`
    : "";

  return `${unitText}${minimumText}`;
}

function product(id) {
  return PRODUCTS.find(item => item.id === Number(id));
}

function allCats() {
  return CATEGORY_MENU.flatMap(group => [
    { ...group, isGroup: true },
    ...group.children.map(child => ({ ...child, group: group.key }))
  ]);
}

function categoryLabel(key) {
  if (key === "all") return { zh: "所有产品", en: "All Products" };
  return allCats().find(item => item.key === key) || { zh: "产品", en: "Products" };
}

function optionConfig(p) {
  const config = p?.optionConfig;

  if (
    config &&
    Array.isArray(config.items) &&
    config.items.length
  ) {
    return config;
  }

  // Không có optionConfig thì trả về null để giao diện không hiện mục lựa chọn.
  return null;
}

function productOptions(p) {
  const config = optionConfig(p);

  // Vẫn tạo một lựa chọn nội bộ để lấy đúng giá sản phẩm,
  // nhưng lựa chọn này không được hiển thị trên giao diện.
  return config
    ? config.items
    : [{
        labelZh: "",
        labelEn: "",
        price: Number(p?.price || 0),
        default: true
      }];
}

function selectedOption(p, index = 0) {
  const options = productOptions(p);
  return options[Number(index)] || options[0];
}

function cleanOptionLabel(value) {
  const text = String(value ?? "").trim();

  // Không hiển thị hai tên mặc định này ở bất kỳ đâu.
  if (/^standard$/i.test(text) || text === "标准款") return "";

  return text;
}

function optionDisplay(option) {
  const zh = cleanOptionLabel(option?.labelZh);
  const en = cleanOptionLabel(option?.labelEn);

  if (zh && en) return zh === en ? zh : `${zh} · ${en}`;
  return zh || en || "";
}

function minimumPrice(p) {
  const known = productOptions(p).map(item => Number(item.price || 0)).filter(value => value > 0);
  return known.length ? Math.min(...known) : 0;
}

function productShareUrl(productId) {
  const url = new URL("products.html", window.location.href);

  url.searchParams.set("product", productId);

  return url.href;
}

async function shareCurrentProduct() {
  const currentProduct = product(state.current);

  if (!currentProduct) return;

  const shareUrl = productShareUrl(currentProduct.id);

  const shareData = {
    title: `${currentProduct.nameZh} · ${currentProduct.nameEn}`,
    text: `${currentProduct.nameZh} · ${currentProduct.nameEn}`,
    url: shareUrl
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard.writeText(shareUrl);

    toast("产品链接已复制 · Product link copied");
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error("Unable to share product:", error);
      toast("无法分享产品 · Unable to share product");
    }
  }
}

/* 3. MENU, BỘ LỌC VÀ DANH SÁCH SẢN PHẨM ----------------------- */
function renderNav() {
  const nav = $("#dynamicNav");
  if (!nav) return;

  nav.innerHTML = `
    <li><a class="nav-link" href="products.html"><span>所有产品</span><small>All Products</small></a></li>
    ${CATEGORY_MENU.map(group => `
      <li class="has-dropdown">
        <a class="nav-link dropdown-toggle" href="products.html?category=${group.key}"><span>${group.zh}</span><small>${group.en}</small><i>⌄</i></a>
        <div class="dropdown">
          <a href="products.html?category=${group.key}"><b>全部${group.zh}</b><small>All ${group.en}</small></a>
          ${group.children.map(child => `<a href="products.html?category=${child.key}"><b>${child.zh}</b><small>${child.en}</small></a>`).join("")}
        </div>
      </li>`).join("")}
    <li><a class="nav-link nav-contact" href="${isProductsPage ? "index.html#how-to-order" : "#how-to-order"}"><span>联系我们</span><small>Contact</small></a></li>`;
}

function renderCategoryTabs() {
  const tabs = $("#categoryTabs");
  if (!tabs) return;

  const items = [
    { key: "all", zh: "所有产品", en: "All Products" },
    ...CATEGORY_MENU.map(group => ({ key: group.key, zh: group.zh, en: group.en }))
  ];

  tabs.innerHTML = items.map(item => `
    <button type="button" data-filter-category="${item.key}" class="${state.category === item.key ? "active" : ""}">
      ${item.zh} <small>${item.en}</small>
    </button>`).join("");
}

function filteredProducts() {
  const query = state.search.trim().toLowerCase();
  let list = PRODUCTS.filter(p => {
    const matchesCategory = state.category === "all" || p.group === state.category || p.category === state.category;
    const searchable = [
      String(p.id), `product-${p.id}`,
      p.nameZh, p.nameEn, p.categoryZh, p.categoryEn,
      p.descriptionZh, p.descriptionEn,
      ...(p.featuresZh || []), ...(p.featuresEn || []),
      ...productOptions(p).flatMap(item => [item.labelZh, item.labelEn])
    ].filter(Boolean).join(" ").toLowerCase();
    return matchesCategory && (!query || searchable.includes(query));
  });

  if (state.featuredOnly) {
    return list.filter(p => p.featured === true).sort((a, b) => a.id - b.id).slice(0, 4);
  }
  if (state.sort === "low") return list.sort((a, b) => minimumPrice(a) - minimumPrice(b));
  if (state.sort === "high") return list.sort((a, b) => minimumPrice(b) - minimumPrice(a));
  if (state.sort === "name") return list.sort((a, b) => (a.nameEn || "").localeCompare(b.nameEn || ""));
  return list.sort((a, b) => Number(b.featured) - Number(a.featured) || a.id - b.id);
}

function productCard(p) {
  const options = productOptions(p);
  const minPrice = minimumPrice(p);
  const price = minPrice > 0
    ? money(minPrice)
    : priceText(0);

  return `<article class="product-card" data-id="${p.id}">
    <div class="product-media">
      <img src="${p.image}" alt="${p.nameEn || p.nameZh}" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false;this.closest('.product-card').classList.add('has-image-error')">
      <div class="image-fallback" hidden><span>${p.nameEn || p.nameZh}</span><small>Missing image · ID: ${p.id}</small></div>
      ${p.badgeZh || p.badgeEn ? `<span class="badge">${[p.badgeZh, p.badgeEn].filter(Boolean).join(" · ")}</span>` : ""}
    </div>
    <div class="product-info">
      <div class="product-meta">
        <small class="product-category">${p.categoryZh} · ${p.categoryEn}</small>
        <small class="product-id" title="Folder: product-${p.id}">ID: ${p.id}</small>
      </div>
      <h3>${p.nameZh}${p.nameEn ? `<span>${p.nameEn}</span>` : ""}</h3>
      <div class="price">
        ${options.length > 1 ? '<small class="price-from">From</small>' : ""}
        <div class="price-row"><span class="price-value">${price}</span>${priceMeta(p, minPrice)}${p.oldPrice ? `<del>${money(p.oldPrice)}</del>` : ""}</div>
      </div>
      <div class="product-card-actions">
        <button class="add contact-product" data-action="contact" type="button"> <span>微信咨询购买</span><span>Contact WeChat</span></button>
        <button class="selection-card-add" data-action="selection" type="button" title="加入价格清单 Add to Price List" aria-label="Add to price list">🛒</button>
      </div>
    </div>
  </article>`;
}

/* SẢN PHẨM NỔI BẬT THEO NHÓM LỚN TRÊN TRANG CHỦ -------------- */
const FEATURED_PRODUCTS_PER_GROUP = 4;

const FEATURED_GROUP_COPY = {
  massage: {
    zh: "按摩床、床品、枕垫与理疗用品",
    en: "Tables, linens, pillows and treatment essentials"
  },
  decorations: {
    zh: "隔断、墙饰、流水摆件与空间装饰",
    en: "Partitions, wall décor, water features and finishing touches"
  },
  customized: {
    zh: "家具、隔间、印刷品与门店定制",
    en: "Custom furniture, partitions, print and store branding"
  },
  gift: {
    zh: "适合门店零售与客户赠礼的精选产品",
    en: "Thoughtful retail and client gift ideas"
  },
  gifts: {
    zh: "适合门店零售与客户赠礼的精选产品",
    en: "Thoughtful retail and client gift ideas"
  },
  other: {
    zh: "补充门店日常运营所需的实用产品",
    en: "Useful extras for everyday spa operations"
  }
};

function groupCopy(groupKey, groupInfo) {
  return FEATURED_GROUP_COPY[groupKey] || {
    zh: `精选${groupInfo?.zh || "产品"}，快速了解系列内容`,
    en: `Representative products from ${groupInfo?.en || "this collection"}`
  };
}

function selectRepresentativeProducts(groupKey, limit = FEATURED_PRODUCTS_PER_GROUP) {
  const groupProducts = PRODUCTS
    .filter(item => item.group === groupKey)
    .sort((a, b) =>
      Number(b.featured === true) - Number(a.featured === true) ||
      a.id - b.id
    );

  const featured = groupProducts.filter(item => item.featured === true);
  const chosen = [];
  const chosenIds = new Set();
  const chosenCategories = new Set();

  const add = item => {
    if (!item || chosenIds.has(item.id) || chosen.length >= limit) return;
    chosen.push(item);
    chosenIds.add(item.id);
    chosenCategories.add(item.category || `product-${item.id}`);
  };

  // Ưu tiên một sản phẩm featured cho mỗi phân loại nhỏ khác nhau.
  featured.forEach(item => {
    const categoryKey = item.category || `product-${item.id}`;
    if (!chosenCategories.has(categoryKey)) add(item);
  });

  // Nếu chưa đủ 4, lấy thêm phân loại nhỏ chưa xuất hiện dù chưa đánh dấu featured.
  groupProducts.forEach(item => {
    const categoryKey = item.category || `product-${item.id}`;
    if (!chosenCategories.has(categoryKey)) add(item);
  });

  // Cuối cùng mới bổ sung sản phẩm còn lại để luôn đủ số lượng khi có thể.
  featured.forEach(add);
  groupProducts.forEach(add);

  return chosen.slice(0, limit);
}

function featuredProductCard(p) {
  const options = productOptions(p);
  const minPrice = minimumPrice(p);
  const price = minPrice > 0 ? money(minPrice) : priceText(0);
  const minimum = minimumOrderQty(p);
  const unit = productUnit(p);

  return `<article class="product-card featured-product-card" data-id="${p.id}" tabindex="0">
    <div class="product-media featured-product-media">
      <img src="${p.image}" alt="${p.nameEn || p.nameZh}" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false;this.closest('.product-card').classList.add('has-image-error')">
      <div class="image-fallback" hidden><span>${p.nameEn || p.nameZh}</span><small>Missing image · ID: ${p.id}</small></div>

      ${p.badgeZh || p.badgeEn
        ? `<span class="badge">${[p.badgeZh, p.badgeEn].filter(Boolean).join(" · ")}</span>`
        : ""}

      ${minimum > 1
        ? `<span class="featured-moq">${minimum}${unit}起订</span>`
        : ""}

      <span class="featured-image-cta">查看详情 · View Details</span>
    </div>

    <div class="featured-card-info">
      <span class="featured-category-tag">${p.categoryZh || ""}${p.categoryEn ? `<small>${p.categoryEn}</small>` : ""}</span>

      <h4>
        ${p.nameZh}
        ${p.nameEn ? `<span>${p.nameEn}</span>` : ""}
      </h4>

      <div class="featured-card-footer">
        <div class="featured-price">
          ${options.length > 1 ? '<small class="price-from">From</small>' : ""}
          <div><span>${price}</span>${Number(minPrice) > 0 ? `<small>/ ${unit}</small>` : ""}</div>
        </div>

        <button
          class="featured-view"
          data-action="quick"
          type="button"
          aria-label="View ${p.nameEn || p.nameZh}"
          title="View details"
        >↗</button>
      </div>
    </div>
  </article>`;
}

function renderFeaturedGroups() {
  const container = $("#featuredGroups");
  const emptyState = $("#emptyState");
  const resultCount = $("#resultCount");

  if (!container) return;

  let totalProducts = 0;
  let visibleGroups = 0;

  const html = CATEGORY_MENU.map((groupInfo, groupIndex) => {
    const products = selectRepresentativeProducts(groupInfo.key);

    if (!products.length) return "";

    visibleGroups += 1;
    totalProducts += products.length;

    const copy = groupCopy(groupInfo.key, groupInfo);
    const categoryChips = [...new Map(
      products.map(item => [
        item.category || `product-${item.id}`,
        {
          zh: item.categoryZh || "",
          en: item.categoryEn || ""
        }
      ])
    ).values()];

    return `
      <section class="featured-group" data-featured-group="${groupInfo.key}">
        <div class="featured-group-heading">
          <div class="featured-group-heading-main">
            <span class="featured-group-number">${String(groupIndex + 1).padStart(2, "0")}</span>

            <div>
              <p class="featured-group-label">精选系列 · FEATURED COLLECTION</p>

              <h3 class="featured-group-title">
                ${groupInfo.zh}
                <span>${groupInfo.en}</span>
              </h3>

              <p class="featured-group-description">
                ${copy.zh}
                <span>${copy.en}</span>
              </p>
            </div>
          </div>

          <a
            class="featured-group-link"
            href="products.html?category=${encodeURIComponent(groupInfo.key)}"
          >
            浏览全部 View Collection →
          </a>
        </div>

        <div class="featured-group-grid">
          ${products.map(featuredProductCard).join("")}
        </div>
      </section>
    `;
  }).filter(Boolean).join("");

  container.innerHTML = html;

  if (resultCount) {
    resultCount.textContent =
      `${visibleGroups} 个系列 · ${totalProducts} 款代表产品 · ${visibleGroups} collections`;
  }

  if (emptyState) {
    emptyState.hidden = totalProducts > 0;
  }
}

function renderProducts() {
  const grid = $("#productGrid");
  if (!grid) return;

  const list = filteredProducts();
  const pages = state.featuredOnly ? 1 : Math.max(1, Math.ceil(list.length / STORE.perPage));
  state.page = Math.min(state.page, pages);
  const visible = state.featuredOnly
    ? list
    : list.slice((state.page - 1) * STORE.perPage, state.page * STORE.perPage);
  const label = state.featuredOnly ? { zh: "精选产品", en: "Featured Products" } : categoryLabel(state.category);

  $("#productsTitle").innerHTML = `${label.zh} <span>${label.en}</span>`;
  $("#resultCount").textContent = state.featuredOnly
    ? "精选 4 件产品 · 4 featured products"
    : `找到 ${list.length} 件产品 · ${list.length} products found`;
  grid.innerHTML = visible.map(productCard).join("");
  $("#emptyState").hidden = Boolean(list.length);
  grid.hidden = !list.length;
  renderCategoryTabs();

  const pagination = $("#pagination");
  if (pagination) {
    pagination.innerHTML = pages < 2 ? "" : `
      <button data-page="${state.page - 1}" ${state.page === 1 ? "disabled" : ""}>←</button>
      ${Array.from({ length: pages }, (_, index) => `<button data-page="${index + 1}" class="${state.page === index + 1 ? "active" : ""}">${index + 1}</button>`).join("")}
      <button data-page="${state.page + 1}" ${state.page === pages ? "disabled" : ""}>→</button>`;
  }
}

/* 4. POPUP CHI TIẾT SẢN PHẨM ----------------------------------- */
function galleryImages(p) {
  return [...new Set([p.image, ...(Array.isArray(p.images) ? p.images : [])].filter(Boolean))];
}

function changeModalImage(path, name) {
  const image = $("#modalImage");
  const fallback = $("#modalFallback");
  image.src = path;
  image.alt = name || "Product image";
  image.hidden = false;
  fallback.hidden = true;
  image.onerror = () => {
    image.hidden = true;
    fallback.hidden = false;
    fallback.textContent = name || "Product image";
  };
  $$(".modal-thumbnail").forEach(button => button.classList.toggle("active", button.dataset.image === path));
}

function renderModalGallery(p) {
  const images = galleryImages(p);
  $("#modalThumbnails").innerHTML = images.map((src, index) => `
    <button type="button" class="modal-thumbnail ${index === 0 ? "active" : ""}" data-image="${src}" data-index="${index}">
      <img src="${src}" alt="${p.nameEn || p.nameZh} ${index + 1}" onerror="this.closest('.modal-thumbnail').hidden=true">
    </button>`).join("");
  $("#modalThumbnails").hidden = images.length < 2;
  changeModalImage(images[0] || p.image, p.nameEn || p.nameZh);
}

function renderModalOptions(p) {
  const config = p?.optionConfig;
  const wrap = $("#modalOptionWrap");

  if (!config || !Array.isArray(config.items) || !config.items.length) {
    state.currentOptionIndex = 0;
    wrap.hidden = true;
    $("#modalOption").innerHTML = "";
    updateModalPrice();
    return;
  }

  state.currentOptionIndex = Math.max(0, config.items.findIndex(item => item.default === true));
  $("#modalOptionLabel").textContent = `${config.nameZh || "选择选项"} · ${config.nameEn || "Select Option"}`;
  $("#modalOption").innerHTML = config.items.map((option, index) => `
    <option value="${index}" ${index === state.currentOptionIndex ? "selected" : ""}>${optionDisplay(option)} — ${priceText(option.price)} / ${productUnit(p)}</option>`).join("");
  wrap.hidden = false;
  updateModalPrice();
}

function updateModalPrice() {
  const p = product(state.current);
  if (!p) return;
  const option = selectedOption(p, state.currentOptionIndex);
  $("#modalPrice").innerHTML = `<span class="price-value">${priceText(option.price)}</span>${priceMeta(p, option.price)}${p.oldPrice ? `<del>${money(p.oldPrice)}</del>` : ""}`;
}

function openModal(p) {
  if (!p) return;
  state.current = p.id;
  $("#modalCategory").textContent = `${p.categoryZh} · ${p.categoryEn} · ID: ${p.id}`;
  $("#modalName").innerHTML = `${p.nameZh}${p.nameEn ? `<span>${p.nameEn}</span>` : ""}`;
  $("#modalDescription").innerHTML = [p.descriptionZh, p.descriptionEn ? `<span>${p.descriptionEn}</span>` : ""].filter(Boolean).join("<br>");
  $("#modalFeatures").innerHTML = (p.featuresZh || []).map((text, index) => `<li>${text} <span>${p.featuresEn?.[index] || ""}</span></li>`).join("");
  renderModalGallery(p);
  renderModalOptions(p);
  $("#quickView").classList.add("show");
  showOverlay();
}

function closeModal() {
  $("#quickView")?.classList.remove("show");
  refreshOverlay();
}

function openLightbox(index) {
  const p = product(state.current);
  if (!p) return;
  const images = galleryImages(p);
  if (!images.length) return;
  const safeIndex = (Number(index) + images.length) % images.length;
  $("#imageLightbox").dataset.index = safeIndex;
  $("#lightboxImage").src = images[safeIndex];
  $("#lightboxCounter").textContent = `${safeIndex + 1} / ${images.length}`;
  $("#lightboxPrev").hidden = images.length < 2;
  $("#lightboxNext").hidden = images.length < 2;
  $("#imageLightbox").classList.add("show");
  $("#imageLightbox").setAttribute("aria-hidden", "false");
}

function closeLightbox() {
  $("#imageLightbox")?.classList.remove("show");
  $("#imageLightbox")?.setAttribute("aria-hidden", "true");
}

function moveLightbox(step) {
  openLightbox(Number($("#imageLightbox").dataset.index || 0) + step);
}

/* 5. GIỎ HÀNG / BẢNG GIÁ --------------------------------------- */
function addToSelection(id, optionIndex = 0) {
  const p = product(id);
  if (!p) return;

  const config = optionConfig(p);
  const option = selectedOption(p, optionIndex);
  const optionZh = cleanOptionLabel(option?.labelZh);
  const optionEn = cleanOptionLabel(option?.labelEn);

  // "base" chỉ là mã nội bộ, không hiển thị cho khách.
  const optionKey = config
    ? (optionEn || optionZh || `option-${Number(optionIndex) || 0}`)
    : "base";

  const key = `${p.id}::${optionKey}`;
  const existing = state.selection.find(item => item.key === key);
  const minimum = minimumOrderQty(p);

  if (existing) {
    existing.qty = Number(existing.qty || 0) + minimum;
  } else {
    state.selection.push({
      key,
      id: p.id,
      qty: minimum,
      optionZh,
      optionEn,
      price: Number(option?.price || p.price || 0),
      unit: productUnit(p),
      minOrderQty: minimum
    });
  }

  saveSelection();
  renderSelection();
  toast(`已加入价格清单 · Added ${p.nameEn || p.nameZh}`);
}

function selectionRow(p, item) {
  const config = optionConfig(p);
  const option = config
    ? optionDisplay({
        labelZh: item.optionZh,
        labelEn: item.optionEn
      })
    : "";

  const optionName = config
    ? (config.nameZh || config.nameEn || "")
    : "";

  const optionLine = option
    ? `<small class="drawer-size">${optionName ? `${optionName}: ` : ""}${option}</small>`
    : "";

  const safeKey = encodeURIComponent(item.key);
  const minimum = minimumOrderQty(p);

  return `<article class="drawer-item" data-key="${safeKey}" data-id="${p.id}">
    <img src="${p.image}" alt="${p.nameEn || p.nameZh}">
    <div>
      <h3>${p.nameZh}${p.nameEn ? `<span>${p.nameEn}</span>` : ""}</h3>
      ${optionLine}
      <div class="drawer-price"><strong>${priceText(item.price)}</strong>${priceMeta(p, item.price)}</div>
      <div class="quantity">
        <button data-selection="minus" type="button" aria-label="减少数量" ${item.qty <= minimum ? "disabled" : ""}>−</button>
        <span>${item.qty}</span>
        <button data-selection="plus" type="button" aria-label="增加数量">+</button>
        <button class="quantity-remove" data-selection="remove" type="button">删除 Remove</button>
      </div>
    </div>
  </article>`;
}

function renderSelection() {
  const valid = state.selection.filter(item => product(item.id));
  state.selection = valid.map(item => {
    const p = product(item.id);
    const minimum = minimumOrderQty(p);
    return {
      ...item,
      qty: Math.max(minimum, Number(item.qty || minimum)),
      price: Number(item.price || 0),
      unit: productUnit(p),
      minOrderQty: minimum
    };
  });
  saveSelection();

  let total = 0;
  let count = 0;
  let quoteItems = 0;
  $("#selectionList").innerHTML = state.selection.map(item => {
    const p = product(item.id);
    count += item.qty;
    if (item.price > 0) total += item.price * item.qty;
    else quoteItems += item.qty;
    return selectionRow(p, item);
  }).join("");

  $(".selection-count").textContent = count;
  $("#selectionSubtotal").textContent = money(total);
  $("#selectionEmpty").hidden = Boolean(state.selection.length);
  $("#clearSelection").disabled = !state.selection.length;
  $("#selectionNote").textContent = quoteItems
    ? `其中 ${quoteItems} 件需要询价 · ${quoteItems} item(s) require a quote.`
    : "最终价格、运费和定制费用请通过微信确认。";
}

function clearSelection() {
  state.selection = [];
  saveSelection();
  renderSelection();
  toast("价格清单已清空 · Price list cleared");
}

function openSelectionDrawer() {
  closeModal();
  $("#selectionDrawer").classList.add("open");
  showOverlay();
}

function closeDrawers() {
  $$(".drawer").forEach(item => item.classList.remove("open"));
  refreshOverlay();
}

function selectionSummary() {
  if (!state.selection.length) return "";

  let knownTotal = 0;

  const lines = state.selection.map((item, index) => {
    const p = product(item.id);
    if (!p) return "";

    const config = optionConfig(p);
    const option = config
      ? optionDisplay({
          labelZh: item.optionZh,
          labelEn: item.optionEn
        })
      : "";

    const optionName = config
      ? (config.nameZh || config.nameEn || "")
      : "";

    const optionLine = option
      ? `\n   ${optionName ? `${optionName}：` : ""}${option}`
      : "";

    const lineTotal = Number(item.price || 0) * Number(item.qty || 1);
    if (lineTotal > 0) knownTotal += lineTotal;

    const unit = productUnit(p);
    const minimum = minimumOrderQty(p);
    const minimumLine = minimum > 1 ? `\n   起订量：${minimum}${unit}` : "";

    return `${index + 1}. 产品：${p.nameZh}${optionLine}\n   数量：${item.qty}${unit}${minimumLine}\n   参考单价：${Number(item.price) > 0 ? `${money(item.price)} / ${unit}` : "请询价"}`;
  }).filter(Boolean);

  return `${BRAND_NAME} 产品询价清单\n\n${lines.join("\n\n")}\n\n参考小计：${money(knownTotal)}\n最终价格、运费及定制费用请微信确认。`;
}

function productContactText(p, option) {
  if (!p) return "";

  const config = optionConfig(p);
  const optionText = config ? optionDisplay(option) : "";
  const optionName = config
    ? (config.nameZh || config.nameEn || "")
    : "";

  const optionLine = optionText
    ? `
${optionName ? `${optionName}：` : ""}${optionText}`
    : "";

  const unit = productUnit(p);
  const minimum = minimumOrderQty(p);
  const minimumLine = minimum > 1 ? `\n起订量：${minimum}${unit}` : "";

  return `${BRAND_NAME} 产品询价
产品：${p.nameZh}${optionLine}
参考价格：${Number(option?.price) > 0 ? `${money(option.price)} / ${unit}` : priceText(p.price)}${minimumLine}
请通过微信确认最终价格、运费和定制要求。`;
}

/* 6. WECHAT, SAO CHÉP VÀ GIAO DIỆN CHUNG ----------------------- */
function openWechat(p = null, option = null, customText = "") {
  closeModal();
  closeDrawers();

  const context = $("#wechatProductContext");
  const copyButton = $("#copyProductInfo");
  state.contactText = customText || productContactText(p, option || (p ? selectedOption(p, 0) : null));
  if (copyButton) copyButton.textContent = "复制产品信息 · Copy Product";

  if (state.contactText) {
    context.hidden = false;
    context.textContent = state.contactText;
    copyButton.hidden = false;
  } else {
    context.hidden = true;
    context.textContent = "";
    copyButton.hidden = true;
  }

  $("#wechatPopup").classList.add("show");
  showOverlay();
}

function handleOrderWechat() {
  const summary = selectionSummary();
  if (summary) {
    openWechat(null, null, summary);
    const copyButton = $("#copyProductInfo");
    if (copyButton) copyButton.textContent = "复制价格清单 · Copy Price List";
    return;
  }

  copyText(WECHAT_ID, "微信 ID 已复制 · WeChat ID copied");
}

function closeWechat() {
  $("#wechatPopup")?.classList.remove("show");
  refreshOverlay();
}

async function copyText(text, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const input = document.createElement("textarea");
    input.value = text;
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }
  toast(successMessage);
}

function showOverlay() {
  $(".overlay")?.classList.add("show");
  document.body.classList.add("locked");
}

function refreshOverlay() {
  const active = $("#quickView")?.classList.contains("show") || $(".drawer.open") || $("#wechatPopup")?.classList.contains("show");
  if (!active) {
    $(".overlay")?.classList.remove("show");
    document.body.classList.remove("locked");
  }
}

function closeAll() {
  closeLightbox();
  $("#quickView")?.classList.remove("show");
  $$(".drawer").forEach(item => item.classList.remove("open"));
  $("#wechatPopup")?.classList.remove("show");
  $(".overlay")?.classList.remove("show");
  document.body.classList.remove("locked");
}

function toast(text) {
  const element = $(".toast");
  if (!element) return;
  element.textContent = text;
  element.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => element.classList.remove("show"), 2400);
}

function closeMobile() {
  $("#dynamicNav")?.classList.remove("open");
  $$(".has-dropdown").forEach(item => item.classList.remove("open"));
}

/* 7. CÁC SỰ KIỆN CLICK, NHẬP LIỆU ------------------------------ */
document.addEventListener("click", event => {
  if (event.target.closest(".nav-contact")) closeMobile();

  const mobileDropdown = event.target.closest(".dropdown-toggle");
  if (mobileDropdown && matchMedia("(max-width:900px)").matches) {
    const parent = mobileDropdown.closest(".has-dropdown");
    if (parent) {
      event.preventDefault();
      const wasOpen = parent.classList.contains("open");
      $$(".has-dropdown").forEach(item => item.classList.remove("open"));
      parent.classList.toggle("open", !wasOpen);
    }
  }

  const filterButton = event.target.closest("[data-filter-category]");
  if (filterButton) {
    state.category = filterButton.dataset.filterCategory;
    state.page = 1;
    renderProducts();
  }

  const card = event.target.closest(".product-card");
  if (card) {
    const p = product(card.dataset.id);
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (!action || action === "quick") openModal(p);
    if (action === "selection") addToSelection(p.id, 0);
    if (action === "contact") openWechat(p, selectedOption(p, 0));
  }

  if (event.target.closest(".order-wechat")) handleOrderWechat();
  if (event.target.closest(".open-wechat")) openWechat();

  const thumbnail = event.target.closest(".modal-thumbnail");
  if (thumbnail) changeModalImage(thumbnail.dataset.image, product(state.current)?.nameEn);
  if (event.target.closest("#modalMainImage")) openLightbox(Number($(".modal-thumbnail.active")?.dataset.index || 0));
  if (event.target.closest("#lightboxClose") || event.target.id === "imageLightbox") closeLightbox();
  if (event.target.closest("#lightboxPrev")) moveLightbox(-1);
  if (event.target.closest("#lightboxNext")) moveLightbox(1);
});

function productShareUrl(productId) {
  const url = new URL("products.html", window.location.href);

  url.searchParams.set("product", productId);

  return url.href;
}

async function shareCurrentProduct() {
  const currentProduct = product(state.current);

  if (!currentProduct) return;

  const shareUrl = productShareUrl(currentProduct.id);

  const title = [
    currentProduct.nameZh,
    currentProduct.nameEn
  ].filter(Boolean).join(" · ");

  try {
    if (navigator.share) {
      await navigator.share({
        title: title,
        text: title,
        url: shareUrl
      });

      return;
    }

    copyText(
      shareUrl,
      "产品链接已复制 · Product link copied"
    );
  } catch (error) {
    if (error.name === "AbortError") return;

    copyText(
      shareUrl,
      "产品链接已复制 · Product link copied"
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderNav();

  const sharedProductId = Number(
  new URLSearchParams(window.location.search).get("product")
);

if (sharedProductId) {
  const sharedProduct = product(sharedProductId);

  if (sharedProduct) {
    openModal(sharedProduct);
  }
}

  
  const queryCategory = new URLSearchParams(location.search).get("category");
  if (queryCategory && allCats().some(item => item.key === queryCategory)) state.category = queryCategory;

  if (isProductsPage) {
    renderProducts();
  } else {
    renderFeaturedGroups();
  }

  renderSelection();

  $("#searchInput")?.addEventListener("input", event => {
    state.search = event.target.value;
    state.page = 1;
    renderProducts();
  });

  $("#sortSelect")?.addEventListener("change", event => {
    state.sort = event.target.value;
    state.page = 1;
    renderProducts();
  });

  $("#pagination")?.addEventListener("click", event => {
    const button = event.target.closest("[data-page]");
    if (!button || button.disabled) return;
    state.page = Number(button.dataset.page);
    renderProducts();
    $("#products").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $(".mobile-toggle")?.addEventListener("click", () => $("#dynamicNav").classList.toggle("open"));
  $(".selection-open")?.addEventListener("click", openSelectionDrawer);
  $$(".drawer-close").forEach(button => button.addEventListener("click", closeDrawers));
  $(".overlay")?.addEventListener("click", closeAll);
  $(".modal-close")?.addEventListener("click", closeModal);
  $(".wechat-popup-close")?.addEventListener("click", closeWechat);

  $("#modalOption")?.addEventListener("change", event => {
    state.currentOptionIndex = Number(event.target.value);
    updateModalPrice();
  });

  $("#modalContact")?.addEventListener("click", () => {
    const p = product(state.current);
    openWechat(p, selectedOption(p, state.currentOptionIndex));
  });

  $("#modalSelection")?.addEventListener("click", () => addToSelection(state.current, state.currentOptionIndex));
  $("#shareProduct")?.addEventListener("click", shareCurrentProduct);
  $("#clearSelection")?.addEventListener("click", clearSelection);
  $("#contactSelection")?.addEventListener("click", () => {
    openWechat(null, null, selectionSummary());
    const copyButton = $("#copyProductInfo");
    if (copyButton && state.contactText) copyButton.textContent = "复制价格清单 · Copy Price List";
  });
  $("#copyWechat")?.addEventListener("click", () => copyText(WECHAT_ID, "微信 ID 已复制"));
  $("#copyProductInfo")?.addEventListener("click", () => copyText(state.contactText, "产品信息已复制"));

  $("#selectionList")?.addEventListener("click", event => {
    const actionButton = event.target.closest("[data-selection]");
    const row = event.target.closest(".drawer-item");
    if (!row || !actionButton) return;

    const action = actionButton.dataset.selection;
    const key = decodeURIComponent(row.dataset.key || "");
    const item = state.selection.find(entry => entry.key === key);
    if (!item) return;
    const p = product(item.id);
    const minimum = minimumOrderQty(p);

    if (action === "plus") item.qty = Number(item.qty || 0) + 1;
    if (action === "minus") item.qty = Math.max(minimum, Number(item.qty || minimum) - 1);
    if (action === "remove") {
      state.selection = state.selection.filter(entry => entry.key !== item.key);
    }

    saveSelection();
    renderSelection();
  });

  document.addEventListener("keydown", event => {
    const focusedCard = event.target.closest?.(".product-card");
    if (focusedCard && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      openModal(product(focusedCard.dataset.id));
      return;
    }

    if (event.key === "Escape") {
      closeAll();
      closeMobile();
    }
    if ($("#imageLightbox")?.classList.contains("show") && event.key === "ArrowLeft") moveLightbox(-1);
    if ($("#imageLightbox")?.classList.contains("show") && event.key === "ArrowRight") moveLightbox(1);
  });
});
