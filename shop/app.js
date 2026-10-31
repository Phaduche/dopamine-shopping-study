// ============================================================
// 데모 쇼핑몰 (조건 0)
// 화면: 홈 / 검색·카테고리 / 상품상세 / 장바구니 / 주문결제 / 주문완료 / 주문·배송조회
// 모든 화면 이동과 주요 행동은 /api/log 로 기록된다 (연구 서버가 없으면 조용히 무시).
// ============================================================

const DELIVERY_HOURS = 72; // 주문 → 배송완료까지 (연구계획서 T5 ≈ 72시간)

const $ = id => document.getElementById(id);
const view = $("view");
const won = n => n.toLocaleString("ko-KR");
const rate = p => Math.round((1 - p.price / p.listPrice) * 100);
let PHOTO = {}; // 상품 id → shop/img/ 안의 사진 경로 (없으면 SVG 그림)
const art = id => PHOTO[id] ? `<img class="photo" src="${PHOTO[id]}" alt="">` : getArt(id);
const stars = (r, cls = "") => `<span class="stars ${cls}"><i style="width:${(r / 5) * 100}%"></i></span>`;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const short = p => p.name.split(" (")[0];
const catName = id => (CATEGORIES.find(c => c.id === id) || CATEGORIES[0]).name;

// ── 저장소 (참가자별로 분리) ───────────────────────────────
let PID = null;
try { PID = new URLSearchParams(location.search).get("pid") || localStorage.getItem("study-pid"); } catch {}
const KEY = k => `shop-${PID || "guest"}-${k}`;
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(KEY(k))) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(KEY(k), JSON.stringify(v)); } catch {} };
let cart = load("cart", {});      // { productId: qty }
let orders = load("orders", []);  // [{ id, at, items:[{id,qty,price}], total }]

// ── 행동 로그 ─────────────────────────────────────────────
function log(type, detail = {}) {
  const body = JSON.stringify({ pid: PID, type, detail: { ...detail, route: location.hash || "#/" } });
  try {
    if (!navigator.sendBeacon || !navigator.sendBeacon("/api/log", new Blob([body], { type: "application/json" })))
      fetch("/api/log", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
  } catch {}
}

// ── 날짜 ──────────────────────────────────────────────────
const DAY = "일월화수목금토";
function arrival(from = Date.now(), withDate = false) {
  const d = new Date(from + DELIVERY_HOURS * 3600e3);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.round((new Date(d).setHours(0, 0, 0, 0) - today) / 864e5);
  const word = { 1: "내일", 2: "모레", 3: "글피" }[diff] || "";
  return `${word}(${DAY[d.getDay()]})${withDate ? ` ${d.getMonth() + 1}/${d.getDate()}` : ""} 도착 예정`;
}
const fmtDate = t => { const d = new Date(t); return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}`; };
const fmtTime = t => { const d = new Date(t); return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };

// ── 공통 조각 ─────────────────────────────────────────────
function card(p, rank) {
  return `<a class="item" href="#/product/${p.id}">
    <div class="thumb">${rank ? `<span class="rank">${rank}</span>` : ""}${art(p.id)}</div>
    <div class="name">${esc(p.brand)} ${esc(p.name)}</div>
    <div class="price-area">
      <div class="base"><del>${won(p.listPrice)}원</del></div>
      <div class="sale"><span class="rate">${rate(p)}%</span><span class="won">${won(p.price)}원</span><span class="unit">(1개당 ${won(p.price)}원)</span></div>
    </div>
    <div class="ship">${p.rocket ? `<span class="rocket">🚀로켓배송</span> ` : ""}${arrival()}<br><span class="free">무료배송</span></div>
    <div class="rating">${stars(p.rating)}(${won(p.reviews)})</div>
    <span class="reward"><i class="coin">C</i>최대 ${won(Math.round(p.price * .05))}원 적립</span>
  </a>`;
}
const shuffled = list => list.map(p => [Math.random(), p]).sort((a, b) => a[0] - b[0]).map(x => x[1]);

function updateCount() { $("cartCount").textContent = Object.values(cart).reduce((s, n) => s + n, 0); }
function toast(msg) { const t = $("toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("on"), 1600); }
function addToCart(id, qty = 1) {
  cart[id] = (cart[id] || 0) + qty; save("cart", cart); updateCount();
  log("cart_add", { product: id, qty });
}

// ── 헤더 ──────────────────────────────────────────────────
$("catMenu").innerHTML = CATEGORIES.map(c => `<a href="#/category/${c.id}">${c.name}</a>`).join("");
$("searchCat").innerHTML = CATEGORIES.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
$("searchForm").onsubmit = e => {
  e.preventDefault();
  const q = $("q").value.trim(), c = $("searchCat").value;
  location.hash = q ? `#/search/${encodeURIComponent(q)}${c !== "all" ? `?cat=${c}` : ""}` : `#/category/${c}`;
};

// 상품 정렬 순서는 참가자마다 무작위 (연구계획서 v4 §7.2), 한 참가자 안에서는 고정
let ORDER = load("order", null);
if (!ORDER) { ORDER = shuffled(PRODUCTS).map(p => p.id); save("order", ORDER); }
const ordered = () => ORDER.map(getProduct).filter(Boolean);

// ── 화면: 홈 ─────────────────────────────────────────────
const SLIDES = [
  ["#e9dccb", "#2b2b2b", "지금 사야 할 인기 문구템", "새학기 문구<br>베스트 Pick", "p02", "문구 베스트 Pick"],
  ["#dfe9f7", "#1d2a44", "책상 위 작은 변화", "데스크 정리<br>모음전", "p04", "선착순 특가!"],
  ["#e3f1e6", "#1f3a29", "방 분위기 바꾸기", "생활소품<br>최대 40%", "p08", "생활소품 특가"],
  ["#f6e3ea", "#3d1f2b", "매일 들고 다니는", "액세서리<br>쿠폰 혜택", "p09", "쿠폰 혜택"],
];
let slideTimer;
function home() {
  const list = ordered();
  const tiles = list.slice(0, 9), shape = ["w2", "w2", "", "", "", "", "w2", "", ""];
  view.innerHTML = `
    <section class="banner">
      ${SLIDES.map(([bg, fg, s, t, a], i) => `<a href="#/product/${a}" class="slide${i ? "" : " on"}" style="background:${bg};color:${fg}">
        <div class="inner"><div class="txt"><small>${s}</small><h2>${t}</h2></div><div class="art">${art(a)}</div></div></a>`).join("")}
      <div class="bn-nav">${SLIDES.map(([, , , , a, label], i) => `<a href="#/product/${a}" data-i="${i}" class="${i ? "" : "on"}"><span>${label}</span><span class="t">${art(a)}</span></a>`).join("")}</div>
    </section>
    <div class="wrap">
      <section class="home-sec">
        <div class="sec-head"><h3>오늘의 발견</h3><span class="sub">오늘 쿠팡이 엄선한 가장 HOT한 상품!</span></div>
        <div class="discover">${tiles.map((p, i) => `<a class="tile ${shape[i]}" href="#/product/${p.id}">
          <div><div class="brand">${esc(p.brand)}</div><div class="tname">${esc(short(p))}</div></div>
          <div class="timg">${art(p.id)}</div><span class="go">›</span></a>`).join("")}</div>
      </section>
      <section class="home-sec">
        <div class="sec-head"><h3>오늘의 <em>판매자 특가</em></h3><span class="pager"><b>1</b>/4</span></div>
        <div class="hot">${[...list].sort((a, b) => rate(b) - rate(a)).slice(0, 5).map(p => card(p)).join("")}</div>
      </section>
      ${CATEGORIES.filter(c => c.id !== "all").map(c => `<section class="home-sec">
        <div class="sec-head"><h3>${c.name}</h3><span class="sub">카테고리별 추천상품</span><a class="pager" href="#/category/${c.id}">더보기 ›</a></div>
        <div class="hot">${list.filter(p => p.category === c.id).slice(0, 5).map(p => card(p)).join("")}</div></section>`).join("")}
    </div>`;
  let cur = 0;
  const go = i => { cur = i; view.querySelectorAll(".slide").forEach((s, j) => s.classList.toggle("on", j === i)); view.querySelectorAll(".bn-nav a").forEach((d, j) => d.classList.toggle("on", j === i)); };
  view.querySelectorAll(".bn-nav a").forEach(a => a.onmouseenter = () => { go(+a.dataset.i); clearInterval(slideTimer); });
  view.querySelector(".bn-nav").onmouseleave = () => { slideTimer = setInterval(() => go((cur + 1) % SLIDES.length), 4000); };
  clearInterval(slideTimer); slideTimer = setInterval(() => go((cur + 1) % SLIDES.length), 4000);
}

// ── 화면: 검색·카테고리 ───────────────────────────────────
function results({ q = "", cat = "all", params }) {
  const sort = params.get("sort") || "rank";
  const rocketOnly = params.get("rocket") === "1";
  const brands = (params.get("brand") || "").split(",").filter(Boolean);
  let list = ordered().filter(p => (cat === "all" || p.category === cat)
    && (!q || (p.name + p.brand).toLowerCase().includes(q.toLowerCase())));
  const allBrands = [...new Set(list.map(p => p.brand))];
  list = list.filter(p => (!rocketOnly || p.rocket) && (!brands.length || brands.includes(p.brand)));
  const sorters = { low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price, sales: (a, b) => b.reviews - a.reviews, new: (a, b) => b.id.localeCompare(a.id) };
  if (sorters[sort]) list = [...list].sort(sorters[sort]);

  const base = q ? `#/search/${encodeURIComponent(q)}` : `#/category/${cat}`;
  const link = changes => {
    const p = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => v ? p.set(k, v) : p.delete(k));
    const s = p.toString(); return base + (s ? `?${s}` : "");
  };
  view.innerHTML = `<div class="wide">
    <div class="crumb">전체 › <b>${q ? `'${esc(q)}'` : catName(cat)}</b></div>
    <div class="srp">
      <aside class="filters">
        <div class="fs"><h5>필터</h5>
          <label><input type="checkbox" data-f="rocket" ${rocketOnly ? "checked" : ""}> <span class="rocket">🚀로켓</span></label>
          <div class="box"><label><input type="checkbox" data-f="rocket" ${rocketOnly ? "checked" : ""}> <span class="blue">로켓배송</span>만 보기</label></div>
          <label><input type="checkbox" checked disabled> 무료배송</label>
        </div>
        <div class="fs"><h5>카테고리</h5>${CATEGORIES.map(c => `<a class="cat ${c.id === cat ? "on" : ""}" href="${q ? `#/search/${encodeURIComponent(q)}?cat=${c.id}` : `#/category/${c.id}`}">${c.name}</a>`).join("")}</div>
        <div class="fs"><h5>브랜드</h5>${allBrands.map(b => `<label><input type="checkbox" data-brand="${esc(b)}" ${brands.includes(b) ? "checked" : ""}> ${esc(b)}</label>`).join("")}</div>
        <div class="fs"><h5>가격</h5>${["5,000원 이하", "5,000원~7,000원", "7,000원 이상"].map(t => `<label><input type="checkbox" disabled> ${t}</label>`).join("")}</div>
      </aside>
      <div class="srp-main">
        <div class="srp-title">${q ? `<b>'${esc(q)}'</b>에 대한 검색결과` : `<b>${catName(cat)}</b>`}</div>
        <div class="related">연관검색어: ${[...new Set(PRODUCTS.map(p => short(p).split(" ").pop()))].slice(0, 9).map(w => `<a href="#/search/${encodeURIComponent(w)}">${esc(w)}</a>`).join("")}</div>
        <div class="sortbar"><span class="toggle"><i></i>배송비 포함</span>
          ${[["rank", "쿠팡 랭킹순"], ["low", "낮은가격순"], ["high", "높은가격순"], ["sales", "판매량순"], ["new", "최신순"]]
            .map(([k, n]) => `<a href="${link({ sort: k === "rank" ? "" : k })}" class="${sort === k ? "on" : ""}">${n}</a>`).join("")}</div>
        ${list.length ? `<div class="srp-grid">${list.map((p, i) => card(p, sort === "rank" && i < 10 ? i + 1 : 0)).join("")}</div>`
          : `<div class="empty">'${esc(q || catName(cat))}'에 대한 검색결과가 없습니다.</div>`}
      </div>
    </div></div>`;
  view.querySelectorAll("[data-f=rocket]").forEach(el => el.onchange = () => location.hash = link({ rocket: el.checked ? "1" : "" }));
  view.querySelectorAll("[data-brand]").forEach(el => el.onchange = () => {
    const next = el.checked ? [...brands, el.dataset.brand] : brands.filter(b => b !== el.dataset.brand);
    location.hash = link({ brand: next.join(",") });
  });
}
function search(q, params) {
  $("q").value = q;
  log("search", { q, cat: params.get("cat") });
  results({ q, cat: params.get("cat") || "all", params });
}
function category(id, params) { results({ cat: CATEGORIES.some(c => c.id === id) ? id : "all", params }); }

// ── 화면: 상품상세 ────────────────────────────────────────
function product(id) {
  const p = getProduct(id);
  if (!p) return notFound();
  log("product_view", { product: id });
  const dist = [72, 18, 6, 2, 2];
  view.innerHTML = `<div class="wide">
    <div class="crumb">쿠팡 홈 › <a href="#/category/${p.category}">${catName(p.category)}</a> › <a href="#/search/${encodeURIComponent(p.brand)}">${esc(p.brand)}</a></div>
    <div class="pd">
      <div class="pd-gallery"><div class="pd-thumbs"><div class="on">${art(p.id)}</div></div><div class="pd-img">${art(p.id)}</div></div>
      <div class="pd-info">
        <div class="pd-top"><div class="pd-title">${esc(p.brand)} ${esc(p.name)}</div><div class="pd-acts"><button aria-label="찜">♡</button><button aria-label="공유">⤴</button></div></div>
        <div class="pd-rating">${stars(p.rating, "lg")}<a href="#reviews" data-go="reviews">${won(p.reviews)} 개 상품평</a></div>
        <div class="pd-price">
          <div class="base"><span class="dc">${rate(p)}%</span><del>${won(p.listPrice)}원</del></div>
          <div class="sale">${won(p.price)}원 <small>(1개당 ${won(p.price)}원)</small></div>
        </div>
        <div class="pd-opt">
          <div class="pd-opt-head"><span>수량</span><span class="toggle"><i></i>배송비 포함</span></div>
          ${[1, 2, 3].map(n => `<label class="opt-row ${n === 1 ? "on" : ""}"><span class="q"><input type="radio" name="opt" value="${n}" ${n === 1 ? "checked" : ""}>${n}개</span><span><b>${won(p.price * n)}원</b></span></label>`).join("")}
        </div>
        <div class="pd-ship"><div class="t">무료배송</div><div>${p.rocket ? `<span class="rocket">🚀로켓배송</span> ` : ""}${arrival(Date.now(), true)}</div></div>
        <div class="pd-ship seller">판매자: ${esc(p.brand)}<a href="#/search/${encodeURIComponent(p.brand)}">브랜드 상품 더보기</a></div>
        <div class="pd-reward"><span><b>적립</b>최대 ${won(Math.round(p.price * .05))}원 <u>쿠팡캐시 적립</u></span><a class="more" href="#detail" data-go="detail">혜택보기 ›</a></div>
        <div class="pd-pay"><b>PC에서도 간편한 결제</b> 쿠페이머니 · 카드 · 계좌이체</div>
        <div class="pd-buy">
          <div class="qty"><input id="qty" value="1" inputmode="numeric"><div class="stack"><button id="up">▲</button><button id="down">▼</button></div></div>
          <button class="btn-cart" id="addCart">장바구니 담기</button>
          <button class="btn-buy" id="buyNow">바로구매 ›</button>
        </div>
      </div>
    </div>
    <div class="tabs"><a class="on" href="#detail" data-go="detail">상품정보</a><a href="#reviews" data-go="reviews">상품평 (${won(p.reviews)})</a><a href="#detail" data-go="notice">상품문의</a><a href="#detail" data-go="ship">배송/교환/반품 안내</a></div>
    <div class="pd-detail" id="detail"><div class="big">${art(p.id)}</div><p>${esc(p.desc)}</p></div>
    <div class="pd-notice" id="notice"><h4>필수 표기정보</h4><table>
      <tr><th>품명 및 모델명</th><td>${esc(p.name)}</td></tr><tr><th>브랜드</th><td>${esc(p.brand)}</td></tr>
      <tr><th>제조국</th><td>상세페이지 참조</td></tr><tr><th>품질보증기준</th><td>상세페이지 참조</td></tr></table></div>
    <div class="reviews" id="reviews"><h4>상품평</h4>
      <div style="display:flex;gap:40px;align-items:center">
        <div style="text-align:center"><div style="font-size:30px;font-weight:700">${p.rating.toFixed(1)}</div>${stars(p.rating, "lg")}<div style="color:#888;margin-top:4px">${won(p.reviews)}개</div></div>
        <div style="flex:1;max-width:360px">${dist.map((v, i) => `<div style="display:flex;gap:8px;align-items:center;font-size:12px;color:#555;margin:3px 0"><span style="width:52px">${["최고", "좋음", "보통", "별로", "나쁨"][i]}</span><div style="flex:1;height:8px;background:#eee"><div style="width:${v}%;height:100%;background:#ff9c00"></div></div><span style="width:30px">${v}%</span></div>`).join("")}</div>
      </div>
    </div>
    <div class="pd-notice" id="ship"><h4>배송/교환/반품 안내</h4><p style="color:#555;line-height:1.8;font-size:12px">연구용 모의 쇼핑몰로 실제 배송·교환·반품은 이루어지지 않습니다.</p></div>
  </div>`;
  const qty = $("qty");
  const q = () => Math.max(1, Math.min(99, parseInt(qty.value) || 1));
  const syncOpt = () => view.querySelectorAll(".opt-row").forEach(r => { const on = +r.querySelector("input").value === q(); r.classList.toggle("on", on); r.querySelector("input").checked = on; });
  view.querySelectorAll(".opt-row input").forEach(r => r.onchange = () => { qty.value = r.value; syncOpt(); });
  $("up").onclick = () => { qty.value = q() + 1; syncOpt(); };
  $("down").onclick = () => { qty.value = Math.max(1, q() - 1); syncOpt(); };
  qty.oninput = syncOpt;
  $("addCart").onclick = () => { addToCart(p.id, q()); toast("장바구니에 상품을 담았습니다."); };
  $("buyNow").onclick = () => { log("buy_now", { product: p.id, qty: q() }); sessionStorage.setItem("direct", JSON.stringify({ [p.id]: q() })); location.hash = "#/checkout?direct=1"; };
  view.querySelectorAll("[data-go]").forEach(a => a.onclick = e => { e.preventDefault(); $(a.dataset.go).scrollIntoView({ behavior: "smooth" }); });
  window.scrollTo(0, 0);
}

// ── 화면: 장바구니 ────────────────────────────────────────
function cartPage() {
  const ids = Object.keys(cart).filter(getProduct);
  const total = ids.reduce((s, id) => s + getProduct(id).price * cart[id], 0);
  view.innerHTML = `<div class="wrap">
    <div class="page-title">🛒 장바구니<div class="steps"><b>01 옵션선택</b> › <b>02 장바구니</b> › 03 주문결제 › 04 주문완료</div></div>
    <div class="cart-tabs"><span>일반구매 (${ids.length})</span></div>
    ${ids.length ? `<table class="cart">
      <thead><tr><th colspan="2">상품정보</th><th>수량</th><th style="text-align:right">상품금액</th><th></th></tr></thead>
      <tbody>${ids.map(id => { const p = getProduct(id); return `<tr>
        <td style="width:90px"><a href="#/product/${id}"><div class="ci-img">${art(id)}</div></a></td>
        <td><a href="#/product/${id}" class="ci-name">${esc(p.brand)} ${esc(p.name)}<small>${arrival()}</small></a></td>
        <td style="width:120px;text-align:center"><div class="qty-sm"><button data-d="-1" data-id="${id}">−</button><span>${cart[id]}</span><button data-d="1" data-id="${id}">+</button></div></td>
        <td class="ci-price" style="width:120px">${won(p.price * cart[id])}원</td>
        <td style="width:40px"><button class="del" data-del="${id}" aria-label="삭제">✕</button></td></tr>`; }).join("")}</tbody>
    </table>
    <div class="total-box">총 상품가격 <b>${won(total)}</b>원 + 총 배송비 <b>0</b>원 = 총 주문금액 <b class="final">${won(total)}원</b></div>
    <div class="cart-actions"><a href="#/" class="btn-line">계속 쇼핑하기</a><button class="btn-solid" id="order">구매하기</button></div>`
    : `<div class="empty">장바구니에 담은 상품이 없습니다.<br><br><a href="#/" class="blue">쇼핑 계속하기 ›</a></div>`}
  </div>`;
  view.querySelectorAll("[data-d]").forEach(b => b.onclick = () => {
    const id = b.dataset.id; cart[id] += +b.dataset.d;
    if (cart[id] <= 0) { delete cart[id]; log("cart_remove", { product: id }); } else log("cart_qty", { product: id, qty: cart[id] });
    save("cart", cart); updateCount(); cartPage();
  });
  view.querySelectorAll("[data-del]").forEach(b => b.onclick = () => {
    delete cart[b.dataset.del]; save("cart", cart); updateCount(); log("cart_remove", { product: b.dataset.del }); cartPage();
  });
  const o = $("order"); if (o) o.onclick = () => location.hash = "#/checkout";
}

// ── 화면: 주문/결제 ───────────────────────────────────────
function checkout(params) {
  let items = cart;
  if (params.get("direct")) { try { items = JSON.parse(sessionStorage.getItem("direct")) || {}; } catch { items = {}; } }
  const ids = Object.keys(items).filter(getProduct);
  if (!ids.length) { location.hash = "#/cart"; return; }
  const total = ids.reduce((s, id) => s + getProduct(id).price * items[id], 0);
  log("checkout_view", { items: ids.length, total });
  view.innerHTML = `<div class="wrap">
    <div class="page-title">주문/결제<div class="steps">01 옵션선택 › 02 장바구니 › <b>03 주문결제</b> › 04 주문완료</div></div>
    <div class="study-note">연구용 모의 주문입니다. 실제 결제나 배송은 이루어지지 않으며, 개인정보를 입력하지 않습니다.</div>
    <div class="co-sec"><h4>구매자정보</h4><table class="co-table">
      <tr><th>이름</th><td>연구 참가자 ${esc(PID || "")}</td></tr></table></div>
    <div class="co-sec"><h4>받는사람정보</h4><table class="co-table">
      <tr><th>배송주소</th><td>연구용 가상 주소</td></tr><tr><th>배송 요청사항</th><td>문 앞</td></tr></table></div>
    <div class="co-sec"><h4>배송 ${ids.length}건 중 1</h4><table class="co-table">
      ${ids.map(id => { const p = getProduct(id); return `<tr><th style="text-align:left;background:#fafafa;color:#00891a;font-weight:700">${arrival(Date.now(), true)}</th><td>${esc(p.brand)} ${esc(p.name)} · 수량 ${items[id]}개 · 무료배송</td></tr>`; }).join("")}
    </table></div>
    <div class="co-sec"><h4>결제정보</h4><table class="co-table">
      <tr><th>총상품가격</th><td>${won(total)}원</td></tr>
      <tr><th>배송비</th><td>0원</td></tr>
      <tr><th>총결제금액</th><td class="red">${won(total)}원</td></tr>
      <tr><th>결제방법</th><td><label class="pay-opt"><input type="radio" name="pay" checked> 연구용 가상결제</label><span style="color:#888">실제 결제되지 않음</span></td></tr>
    </table></div>
    <div class="co-agree">위 주문 내용을 확인하였으며, 연구용 모의 주문에 동의합니다.</div>
    <button class="pay-btn" id="pay">결제하기</button>
  </div>`;
  $("pay").onclick = () => {
    const order = { id: String(Date.now()).slice(-10), at: Date.now(), items: ids.map(id => ({ id, qty: items[id], price: getProduct(id).price })), total };
    orders.unshift(order); save("orders", orders);
    if (!params.get("direct")) { cart = {}; save("cart", cart); updateCount(); }
    log("order", { order: order.id, items: order.items, total });
    location.hash = `#/done/${order.id}`;
  };
}

// ── 화면: 주문완료 ────────────────────────────────────────
function done(id) {
  const o = orders.find(o => o.id === id);
  if (!o) return notFound();
  view.innerHTML = `<div class="wrap">
    <div class="page-title">주문완료<div class="steps">01 옵션선택 › 02 장바구니 › 03 주문결제 › <b>04 주문완료</b></div></div>
    <div class="done-box"><div class="ic">✅</div><h2>주문이 <em>완료</em>되었습니다.</h2>
      <p>${arrival(o.at, true)} · 연구용 가상 배송</p></div>
    ${orderCard(o)}
    <div class="cart-actions"><a href="#/orders" class="btn-line">주문목록 보기</a><a href="#/" class="btn-solid">쇼핑 계속하기</a></div>
    ${PID ? `<p style="text-align:center;font-size:13px;color:#888;margin-top:6px">쇼핑을 마치셨다면 처음 탭으로 돌아가 설문을 시작하거나, <a class="blue" href="/survey.html?pid=${encodeURIComponent(PID)}">여기서 바로 설문</a>을 시작할 수 있어요.</p>` : ""}
  </div>`;
}

// ── 화면: 주문목록·배송조회 ───────────────────────────────
const STAGES = [["결제완료", 0], ["상품준비중", 6], ["배송중", 24], ["배송완료", DELIVERY_HOURS]];
function stageOf(o) { const h = (Date.now() - o.at) / 3600e3; return STAGES.reduce((s, [, at], i) => h >= at ? i : s, 0); }
function orderCard(o) {
  const st = stageOf(o);
  return `<div class="order-card">
    <div class="order-head"><span class="date">${fmtDate(o.at)} 주문</span><span class="order-status">${STAGES[st][0]}<small>${st < 3 ? arrival(o.at, true) : "배송이 완료되었습니다"}</small></span></div>
    <div class="order-items">${o.items.map(it => { const p = getProduct(it.id); return `<a class="oi" href="#/product/${it.id}"><div class="img">${art(it.id)}</div><div>${esc(p.name)}<br><b>${won(it.price * it.qty)}원</b> · ${it.qty}개</div></a>`; }).join("")}</div>
    <div class="order-btns"><a class="track" href="#/track/${o.id}">배송조회</a></div>
  </div>`;
}
function ordersPage() {
  view.innerHTML = `<div class="wrap"><div class="page-title">주문목록</div>
    ${orders.length ? orders.map(orderCard).join("") : `<div class="empty">주문 내역이 없습니다.</div>`}</div>`;
}
function track(id) {
  const o = orders.find(o => o.id === id);
  if (!o) return notFound();
  const st = stageOf(o);
  log("track_view", { order: id, stage: STAGES[st][0], hours_since_order: +((Date.now() - o.at) / 3600e3).toFixed(2) });
  view.innerHTML = `<div class="wrap"><div class="page-title">배송조회</div>
    <div class="order-card">
      <div class="order-head"><span class="date">${STAGES[st][0]}</span><span class="order-status"><small>${st < 3 ? arrival(o.at, true) : "배송이 완료되었습니다"}</small></span></div>
      <div class="tracker">${STAGES.map(([n], i) => `<div class="st ${i <= st ? "on" : ""}"><i></i>${n}</div>`).join("")}</div>
      <div class="track-log">${STAGES.slice(0, st + 1).reverse().map(([n, h]) => `<div><span>${fmtTime(o.at + h * 3600e3)}</span><span>${n}</span></div>`).join("")}</div>
    </div>
    <div class="cart-actions"><a href="#/orders" class="btn-line">주문목록</a></div></div>`;
}

function notFound() { view.innerHTML = `<div class="wrap"><div class="empty">페이지를 찾을 수 없습니다.<br><br><a href="#/" class="blue">홈으로 ›</a></div></div>`; }

// ── 라우터 ────────────────────────────────────────────────
let lastRoute = null, lastAt = Date.now();
function route() {
  const [path, qs] = (location.hash.slice(1) || "/").split("?");
  const params = new URLSearchParams(qs || "");
  const [, page, arg] = path.split("/");
  if (lastRoute !== null) log("screen", { from: lastRoute, dwell_ms: Date.now() - lastAt });
  lastRoute = location.hash || "#/"; lastAt = Date.now();
  clearInterval(slideTimer);
  if (!page) home();
  else if (page === "search") search(decodeURIComponent(arg || ""), params);
  else if (page === "category") category(arg, params);
  else if (page === "product") product(arg);
  else if (page === "cart") cartPage();
  else if (page === "checkout") checkout(params);
  else if (page === "done") done(arg);
  else if (page === "orders") ordersPage();
  else if (page === "track") track(arg);
  else notFound();
  if (page !== "product") window.scrollTo(0, 0);
}
window.addEventListener("hashchange", route);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") { log("leave", { from: lastRoute, dwell_ms: Date.now() - lastAt }); }
  else { log("return"); lastAt = Date.now(); }
});
log("app_open");
updateCount();
fetch("/api/photos").then(r => r.ok ? r.json() : {}).catch(() => ({})).then(p => { PHOTO = p; route(); });
