// ============================================================
// 데모 쇼핑몰 (조건 0)
// 화면: 홈 / 검색·카테고리 / 상품상세 / 장바구니 / 주문결제 / 주문완료 / 주문·배송조회
// 모든 화면 이동과 주요 행동은 /api/log 로 기록된다 (연구 서버가 없으면 조용히 무시).
// ============================================================

const DELIVERY_HOURS = 72; // 주문 → 배송완료까지 (연구계획서 T5 ≈ 72시간)
const CAT_ICON = { all: "p08", stationery: "p02", living: "p05", desk: "p11", accessory: "p09", organize: "p19" };

const $ = id => document.getElementById(id);
const view = $("view");
const won = n => n.toLocaleString("ko-KR");
const rate = p => Math.round((1 - p.price / p.listPrice) * 100);
const art = id => getArt(id);
const stars = r => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

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
function arriveText(from = Date.now()) {
  const d = new Date(from + DELIVERY_HOURS * 3600e3);
  return `<b>${d.getMonth() + 1}/${d.getDate()}(${DAY[d.getDay()]})</b> 도착 보장`;
}
const fmtDate = t => { const d = new Date(t); return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}`; };
const fmtTime = t => { const d = new Date(t); return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };

// ── 공통 조각 ─────────────────────────────────────────────
function card(p) {
  return `<a class="item" href="#/product/${p.id}" data-pid="${p.id}">
    <div class="thumb">${art(p.id)}</div>
    <div class="name">${esc(p.brand)} ${esc(p.name)}</div>
    <div class="price-area">
      <div class="base"><span class="rate">${rate(p)}%</span><del>${won(p.listPrice)}원</del></div>
      <div class="sale">${won(p.price)}<span class="won">원</span>${p.rocket ? `<span class="rocket-badge">🚀로켓배송</span>` : ""}</div>
    </div>
    <div class="arrive">${arriveText()}</div>
    <div class="rating"><span class="stars">${stars(p.rating)}</span>(${won(p.reviews)})</div>
    <span class="reward">최대 ${won(Math.round(p.price * .01))}원 적립</span>
  </a>`;
}
const grid = list => `<div class="grid">${list.map(card).join("")}</div>`;
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

// ── 화면: 홈 ─────────────────────────────────────────────
// 상품 정렬 순서는 참가자마다 무작위 (연구계획서 v4 §7.2), 한 참가자 안에서는 고정
let ORDER = load("order", null);
if (!ORDER) { ORDER = shuffled(PRODUCTS).map(p => p.id); save("order", ORDER); }
const ordered = () => ORDER.map(getProduct).filter(Boolean);

const SLIDES = [
  ["linear-gradient(120deg,#346aff,#6f93ff)", "새학기 문구<br>최대 40% 할인", "오늘 밤 12시 전 주문 시 로켓배송", "p02"],
  ["linear-gradient(120deg,#ff8a3d,#ffbe5c)", "책상 위 작은 정리", "데스크 소품 모음전", "p04"],
  ["linear-gradient(120deg,#17a673,#5fd6a5)", "방 분위기 바꾸기", "무드등 · 화분 · 생활소품", "p08"],
  ["linear-gradient(120deg,#8d4bd6,#c27ce8)", "매일 들고 다니는", "액세서리 · 파우치 특가", "p09"],
];
let slideTimer;
function home() {
  const list = ordered();
  view.innerHTML = `
    <section class="banner" id="banner">
      ${SLIDES.map(([bg, t, s, a], i) => `<a href="#/product/${a}" class="slide${i ? "" : " on"}" style="background:${bg}">
        <div class="txt"><h2>${t}</h2><p>${s}</p></div><div class="art">${art(a)}</div></a>`).join("")}
      <div class="dots">${SLIDES.map((_, i) => `<button class="${i ? "" : "on"}" data-i="${i}"></button>`).join("")}</div>
    </section>
    <div class="wrap">
      <div class="quick">${CATEGORIES.map(c => `<a href="#/category/${c.id}"><div class="q">${art(CAT_ICON[c.id])}</div>${c.name}</a>`).join("")}</div>
      <section class="sec">
        <div class="sec-title"><h3>오늘의 <em>골드박스</em><span class="timer" id="timer"></span></h3><a href="#/category/all">더보기 ›</a></div>
        ${grid([...list].sort((a, b) => rate(b) - rate(a)).slice(0, 5))}
      </section>
      <section class="sec">
        <div class="sec-title"><h3>🚀 로켓배송 <em>추천상품</em></h3><a href="#/category/all">더보기 ›</a></div>
        ${grid(list)}
      </section>
    </div>`;
  let cur = 0;
  const go = i => { cur = i; view.querySelectorAll(".slide").forEach((s, j) => s.classList.toggle("on", j === i)); view.querySelectorAll(".dots button").forEach((d, j) => d.classList.toggle("on", j === i)); };
  view.querySelector(".dots").onclick = e => { if (e.target.dataset.i) { e.preventDefault(); go(+e.target.dataset.i); } };
  clearInterval(slideTimer); slideTimer = setInterval(() => go((cur + 1) % SLIDES.length), 4000);
  tick();
}
function tick() {
  const t = $("timer"); if (!t) return;
  const n = new Date(), end = new Date(n); end.setHours(24, 0, 0, 0);
  const s = Math.floor((end - n) / 1000);
  t.textContent = [s / 3600, s % 3600 / 60, s % 60].map(x => String(Math.floor(x)).padStart(2, "0")).join(":") + " 남음";
}
setInterval(tick, 1000);

// ── 화면: 검색·카테고리 ───────────────────────────────────
function results(title, list, sort) {
  const sorters = { rank: null, low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price, review: (a, b) => b.reviews - a.reviews };
  if (sorters[sort]) list = [...list].sort(sorters[sort]);
  const base = location.hash.split("&sort=")[0].split("?sort=")[0];
  const join = base.includes("?") ? "&" : "?";
  view.innerHTML = `<div class="wrap">
    <div class="result-head"><h2>${title}</h2>
      <div class="sort">${[["rank", "랭킹순"], ["low", "낮은가격순"], ["high", "높은가격순"], ["review", "리뷰많은순"]]
        .map(([k, n]) => `<a href="${base}${join}sort=${k}" class="${(sort || "rank") === k ? "on" : ""}">${n}</a>`).join(" · ")}</div></div>
    ${list.length ? grid(list) : `<div class="empty">검색 결과가 없습니다.<br>다른 검색어를 입력해 보세요.</div>`}
  </div>`;
}
function search(q, params) {
  const cat = params.get("cat");
  const list = ordered().filter(p => (!cat || p.category === cat) && (p.name + p.brand).toLowerCase().includes(q.toLowerCase()));
  $("q").value = q;
  log("search", { q, cat, results: list.length });
  results(`'<em>${esc(q)}</em>' 검색결과 ${list.length}개`, list, params.get("sort"));
}
function category(id, params) {
  const c = CATEGORIES.find(c => c.id === id) || CATEGORIES[0];
  const list = ordered().filter(p => c.id === "all" || p.category === c.id);
  results(`<em>${c.name}</em> 상품 ${list.length}개`, list, params.get("sort"));
}

// ── 화면: 상품상세 ────────────────────────────────────────
function product(id) {
  const p = getProduct(id);
  if (!p) return notFound();
  const cat = CATEGORIES.find(c => c.id === p.category);
  log("product_view", { product: id });
  const dist = [72, 18, 6, 2, 2];
  view.innerHTML = `<div class="wrap">
    <div class="crumb">홈 › <a href="#/category/${cat.id}">${cat.name}</a></div>
    <div class="pd">
      <div class="pd-img">${art(p.id)}</div>
      <div class="pd-info">
        <a class="pd-brand" href="#/search/${encodeURIComponent(p.brand)}">${esc(p.brand)} 브랜드샵 ›</a>
        <div class="pd-title">${esc(p.brand)} ${esc(p.name)}</div>
        <div class="pd-rating"><span class="stars">${stars(p.rating)}</span><a href="#reviews" id="toReviews">${won(p.reviews)}개 상품평</a></div>
        <div class="pd-price">
          <div class="base"><span class="rate">${rate(p)}%</span><del>${won(p.listPrice)}원</del></div>
          <div class="sale">${won(p.price)}원 ${p.rocket ? `<span class="rocket-badge">🚀로켓배송</span>` : ""}</div>
        </div>
        <div class="pd-ship">
          <div>무료배송</div>
          <div class="arrive">${arriveText()}</div>
          <small>오늘 주문 시 · 연구용 가상 배송</small>
        </div>
        <div class="pd-ship"><small>최대 ${won(Math.round(p.price * .01))}원 적립</small></div>
        <div class="pd-buy">
          <div class="qty"><input id="qty" value="1" inputmode="numeric"><div class="stack"><button id="up">▲</button><button id="down">▼</button></div></div>
          <button class="btn-cart" id="addCart">장바구니 담기</button>
          <button class="btn-buy" id="buyNow">바로구매 ›</button>
        </div>
      </div>
    </div>
    <div class="tabs"><a class="on" href="#detail" data-go="detail">상품상세</a><a href="#reviews" data-go="reviews">상품평 (${won(p.reviews)})</a><a href="#detail" data-go="detail">상품문의</a><a href="#detail" data-go="ship">배송/교환/반품 안내</a></div>
    <div class="pd-detail" id="detail"><div class="big">${art(p.id)}</div><p>${esc(p.desc)}</p></div>
    <div class="reviews" id="reviews"><h4>상품평</h4>
      <div style="display:flex;gap:30px;align-items:center">
        <div style="text-align:center"><div style="font-size:34px;font-weight:700">${p.rating.toFixed(1)}</div><div class="stars" style="font-size:16px">${stars(p.rating)}</div><div style="color:#888">${won(p.reviews)}개</div></div>
        <div style="flex:1;max-width:360px">${dist.map((v, i) => `<div style="display:flex;gap:8px;align-items:center;font-size:12px;color:#555;margin:3px 0"><span style="width:40px">${5 - i}점</span><div style="flex:1;height:8px;background:#eee"><div style="width:${v}%;height:100%;background:#346aff"></div></div><span style="width:30px">${v}%</span></div>`).join("")}</div>
      </div>
    </div>
    <div class="reviews" id="ship"><h4>배송/교환/반품 안내</h4><p style="color:#555;line-height:1.8">연구용 모의 쇼핑몰로 실제 배송·교환·반품은 이루어지지 않습니다.</p></div>
  </div>`;
  const qty = $("qty");
  const q = () => Math.max(1, Math.min(99, parseInt(qty.value) || 1));
  $("up").onclick = () => qty.value = q() + 1;
  $("down").onclick = () => qty.value = Math.max(1, q() - 1);
  $("addCart").onclick = () => { addToCart(p.id, q()); toast("장바구니에 상품을 담았습니다."); };
  $("buyNow").onclick = () => { log("buy_now", { product: p.id, qty: q() }); sessionStorage.setItem("direct", JSON.stringify({ [p.id]: q() })); location.hash = "#/checkout?direct=1"; };
  view.querySelectorAll("[data-go]").forEach(a => a.onclick = e => { e.preventDefault(); $(a.dataset.go).scrollIntoView({ behavior: "smooth" }); });
  $("toReviews").onclick = e => { e.preventDefault(); $("reviews").scrollIntoView({ behavior: "smooth" }); };
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
        <td><a href="#/product/${id}" class="ci-name">${esc(p.brand)} ${esc(p.name)}<small>${arriveText()}</small></a></td>
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
      ${ids.map(id => { const p = getProduct(id); return `<tr><th style="text-align:left;background:#fafafa;color:#00891a;font-weight:700">${arriveText()}</th><td>${esc(p.brand)} ${esc(p.name)} · 수량 ${items[id]}개 · 무료배송</td></tr>`; }).join("")}
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
      <p>${arriveText(o.at).replace(/<\/?b>/g, "")} · 연구용 가상 배송</p></div>
    ${orderCard(o)}
    <div class="cart-actions"><a href="#/orders" class="btn-line">주문목록 보기</a><a href="#/" class="btn-solid">쇼핑 계속하기</a></div>
  </div>`;
}

// ── 화면: 주문목록·배송조회 ───────────────────────────────
const STAGES = [["결제완료", 0], ["상품준비중", 6], ["배송중", 24], ["배송완료", DELIVERY_HOURS]];
function stageOf(o) { const h = (Date.now() - o.at) / 3600e3; return STAGES.reduce((s, [, at], i) => h >= at ? i : s, 0); }
function orderCard(o) {
  const st = stageOf(o);
  return `<div class="order-card">
    <div class="order-head"><span class="date">${fmtDate(o.at)} 주문</span><span class="order-status">${STAGES[st][0]}<small>${st < 3 ? arriveText(o.at).replace(/<\/?b>/g, "") : "배송이 완료되었습니다"}</small></span></div>
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
      <div class="order-head"><span class="date">${STAGES[st][0]}</span><span class="order-status"><small>${st < 3 ? arriveText(o.at).replace(/<\/?b>/g, "") : "배송이 완료되었습니다"}</small></span></div>
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
route();
