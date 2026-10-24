// ============================================================
// 상품 일러스트 (자체 제작 SVG)
// ------------------------------------------------------------
// 실제 쇼핑몰 느낌을 주되 외부 이미지·실제 쇼핑몰 상품사진을 쓰지 않기 위해
// 모든 상품 이미지를 코드로 그린 원본 플랫 일러스트(SVG)로 제공한다.
// 저작권/상표 안전. getArt(id) → SVG 마크업 문자열.
// ============================================================

function wrap(bg, inner) {
  return `<svg viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-hidden="true">
<rect width="220" height="220" fill="${bg}"/>
<ellipse cx="110" cy="176" rx="62" ry="11" fill="#000" opacity="0.06"/>
${inner}
</svg>`
}

const ART = {
  // 노트 (A5 무지)
  p01: wrap('#FFF6DD', `
    <g transform="rotate(-6 110 100)">
      <rect x="66" y="48" width="92" height="118" rx="8" fill="#e8a81f"/>
      <rect x="74" y="48" width="84" height="118" rx="8" fill="#ffd25a"/>
      <rect x="92" y="72" width="52" height="7" rx="3.5" fill="#fff" opacity="0.85"/>
      <rect x="92" y="88" width="52" height="6" rx="3" fill="#fff" opacity="0.6"/>
      <rect x="92" y="102" width="38" height="6" rx="3" fill="#fff" opacity="0.6"/>
      <g fill="#c6881a">
        <circle cx="74" cy="60" r="4"/><circle cx="74" cy="82" r="4"/><circle cx="74" cy="104" r="4"/><circle cx="74" cy="126" r="4"/><circle cx="74" cy="148" r="4"/>
      </g>
    </g>`),

  // 젤 볼펜 5색 세트
  p02: wrap('#E8F1FF', `
    <g transform="rotate(8 110 110)">
      ${['#ef5d6b', '#f6a94a', '#5ac08a', '#4f8ff0', '#9b7be8']
        .map((c, i) => {
          const x = 58 + i * 21
          return `<g><rect x="${x}" y="52" width="14" height="104" rx="7" fill="${c}"/><path d="M${x} 56 l7 -14 l7 14 z" fill="#3a3f4a"/><rect x="${x + 3}" y="150" width="8" height="12" rx="3" fill="#3a3f4a"/></g>`
        })
        .join('')}
    </g>`),

  // 떡메모지 (사각 100매)
  p03: wrap('#FFEAF2', `
    <rect x="62" y="70" width="96" height="92" rx="6" fill="#f7b8cf"/>
    <rect x="62" y="64" width="96" height="92" rx="6" fill="#ffd0e0"/>
    <rect x="62" y="58" width="96" height="92" rx="6" fill="#ffe3ee"/>
    <path d="M62 58 q48 -22 96 0 v8 q-48 -14 -96 0 z" fill="#fff"/>
    <rect x="80" y="90" width="60" height="6" rx="3" fill="#f090b4"/>
    <rect x="80" y="104" width="60" height="6" rx="3" fill="#f6a8c6"/>
    <rect x="80" y="118" width="40" height="6" rx="3" fill="#f6a8c6"/>`),

  // 데스크 정리 트레이
  p04: wrap('#ECEEFF', `
    <path d="M52 96 h116 v44 a8 8 0 0 1 -8 8 h-100 a8 8 0 0 1 -8 -8 z" fill="#8a93d6"/>
    <path d="M52 96 h116 l-12 -18 h-92 z" fill="#aab2ea"/>
    <rect x="70" y="72" width="10" height="30" rx="5" fill="#ef5d6b"/>
    <rect x="86" y="66" width="10" height="36" rx="5" fill="#4f8ff0"/>
    <rect x="102" y="76" width="10" height="26" rx="5" fill="#5ac08a"/>`),

  // 실리콘 접이식 컵
  p05: wrap('#E4FBEF', `
    <path d="M74 78 h72 l-8 84 a6 6 0 0 1 -6 5 h-44 a6 6 0 0 1 -6 -5 z" fill="#58c58e"/>
    <rect x="72" y="72" width="76" height="12" rx="6" fill="#3fae78"/>
    <path d="M78 96 h64 l-1.5 16 h-61 z" fill="#76d3a5" opacity="0.8"/>
    <path d="M80 120 h60 l-1.5 16 h-57 z" fill="#76d3a5" opacity="0.6"/>`),

  // 마스킹 테이프 3롤
  p06: wrap('#FFECEC', `
    ${[['#ef7d7d', 70], ['#f4b65a', 110], ['#7fb0ef', 150]]
      .map(([c, cx]) => `<g><circle cx="${cx}" cy="118" r="34" fill="${c}"/><circle cx="${cx}" cy="118" r="15" fill="#fff"/><circle cx="${cx}" cy="118" r="15" fill="none" stroke="#00000012" stroke-width="2"/></g>`)
      .join('')}`),

  // 손목 받침 마우스패드
  p07: wrap('#EDE9FF', `
    <rect x="46" y="96" width="128" height="56" rx="14" fill="#6f78c9"/>
    <rect x="46" y="118" width="128" height="20" rx="10" fill="#565ea8"/>
    <rect x="118" y="78" width="40" height="46" rx="18" fill="#3b4048"/>
    <rect x="135" y="82" width="3" height="20" rx="1.5" fill="#9aa0ab"/>`),

  // 미니 무드등 (USB)
  p08: wrap('#FFF7DF', `
    <circle cx="110" cy="96" r="42" fill="#ffe9a8"/>
    <circle cx="110" cy="96" r="42" fill="#ffd45e" opacity="0.5"/>
    <path d="M86 96 a24 24 0 0 1 48 0 z" fill="#fff3c4"/>
    <rect x="92" y="136" width="36" height="30" rx="6" fill="#c9cdd6"/>
    <rect x="92" y="136" width="36" height="10" rx="5" fill="#aeb3bf"/>`),

  // 키링 파우치 (카드수납)
  p09: wrap('#FFEAF4', `
    <rect x="70" y="80" width="80" height="78" rx="14" fill="#ef7fae"/>
    <rect x="70" y="80" width="80" height="26" rx="13" fill="#f59bc2"/>
    <circle cx="110" cy="70" r="12" fill="none" stroke="#c9789c" stroke-width="5"/>
    <rect x="98" y="118" width="24" height="16" rx="3" fill="#fff" opacity="0.85"/>`),

  // 패브릭 헤어밴드 2개입
  p10: wrap('#E8FBE9', `
    <path d="M60 150 a34 34 0 0 1 68 0" fill="none" stroke="#67c47d" stroke-width="16" stroke-linecap="round"/>
    <path d="M82 150 a34 34 0 0 1 68 0" fill="none" stroke="#f3a0b8" stroke-width="16" stroke-linecap="round"/>`),

  // 접이식 독서 받침대
  p11: wrap('#E6F4FF', `
    <path d="M60 158 l40 -86 l8 4 l-40 86 z" fill="#9aa3ad"/>
    <path d="M150 158 l-40 -86 l-8 4 l40 86 z" fill="#b7bfc8"/>
    <g transform="rotate(-18 110 96)">
      <rect x="78" y="64" width="64" height="48" rx="4" fill="#fff"/>
      <rect x="78" y="64" width="32" height="48" rx="4" fill="#eef1f5"/>
      <rect x="86" y="74" width="18" height="4" rx="2" fill="#c3cad3"/>
      <rect x="86" y="82" width="18" height="4" rx="2" fill="#c3cad3"/>
    </g>`),

  // 케이블 정리 클립 6개
  p12: wrap('#F3E8FF', `
    <rect x="72" y="86" width="76" height="48" rx="10" fill="#a98fe0"/>
    <rect x="72" y="86" width="76" height="48" rx="10" fill="none" stroke="#8f74cf" stroke-width="3"/>
    <rect x="96" y="96" width="12" height="28" rx="6" fill="#efe6ff"/>
    <rect x="116" y="96" width="12" height="28" rx="6" fill="#efe6ff"/>
    <path d="M60 150 q30 -10 48 -24 q18 -14 52 -6" fill="none" stroke="#6c56a8" stroke-width="6" stroke-linecap="round"/>`),

  // 미니 탁상 달력 (만년)
  p13: wrap('#FFF6DD', `
    <rect x="62" y="84" width="44" height="60" rx="6" fill="#f0d79a"/>
    <rect x="114" y="84" width="44" height="60" rx="6" fill="#e9cd86"/>
    <rect x="68" y="92" width="32" height="44" rx="3" fill="#fff"/>
    <rect x="120" y="92" width="32" height="44" rx="3" fill="#fff"/>
    <text x="84" y="124" font-size="30" font-family="Arial" font-weight="700" fill="#e08a2b" text-anchor="middle">7</text>
    <text x="136" y="124" font-size="30" font-family="Arial" font-weight="700" fill="#e08a2b" text-anchor="middle">4</text>
    <rect x="70" y="78" width="12" height="14" rx="4" fill="#b98f3e"/>
    <rect x="138" y="78" width="12" height="14" rx="4" fill="#b98f3e"/>`),

  // 폭신 슬리퍼 (실내용)
  p14: wrap('#FFEAF4', `
    <g>
      <path d="M58 150 q-14 -2 -14 -16 q0 -16 20 -18 q26 -2 30 8 q4 12 -8 22 q-14 6 -28 4 z" fill="#f2a6c2"/>
      <path d="M50 124 q22 -10 40 2" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.8"/>
    </g>
    <g transform="translate(66 0)">
      <path d="M78 156 q-14 -2 -14 -16 q0 -16 20 -18 q26 -2 30 8 q4 12 -8 22 q-14 6 -28 4 z" fill="#ef93b4"/>
      <path d="M70 130 q22 -10 40 2" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.8"/>
    </g>`),

  // 투명 필통 (지퍼형)
  p15: wrap('#E8F1FF', `
    <rect x="56" y="90" width="108" height="58" rx="18" fill="#bcd4f3" opacity="0.6"/>
    <rect x="56" y="90" width="108" height="58" rx="18" fill="none" stroke="#7fa8dd" stroke-width="3"/>
    <rect x="56" y="88" width="108" height="12" rx="6" fill="#7fa8dd"/>
    <circle cx="160" cy="94" r="7" fill="#5b86c2"/>
    <rect x="76" y="112" width="10" height="26" rx="5" fill="#ef5d6b" opacity="0.85"/>
    <rect x="90" y="108" width="10" height="30" rx="5" fill="#4f8ff0" opacity="0.85"/>
    <rect x="104" y="114" width="10" height="24" rx="5" fill="#5ac08a" opacity="0.85"/>`),

  // 미니 공기 식물 화분
  p16: wrap('#E4FBE9', `
    <path d="M110 110 q-26 -6 -30 -34 q24 2 30 30 z" fill="#5bb87a"/>
    <path d="M110 108 q26 -10 30 -40 q-26 6 -30 36 z" fill="#74cf92"/>
    <path d="M110 118 q-6 -30 2 -50 q8 20 2 50 z" fill="#4ca86c"/>
    <path d="M84 118 h52 l-6 40 a6 6 0 0 1 -6 5 h-28 a6 6 0 0 1 -6 -5 z" fill="#e2946a"/>
    <rect x="80" y="112" width="60" height="12" rx="6" fill="#cf7f55"/>`),

  // 자석 북마크 4개
  p17: wrap('#FFE9EC', `
    ${[['#ef5d6b', 70], ['#f4b65a', 96], ['#5ac08a', 122], ['#4f8ff0', 148]]
      .map(([c, x]) => `<path d="M${x} 72 h22 v76 l-11 -12 l-11 12 z" fill="${c}"/>`)
      .join('')}`),

  // 손거울 (접이식 스탠드)
  p18: wrap('#EDE9FF', `
    <ellipse cx="110" cy="92" rx="38" ry="42" fill="#c7ccf0"/>
    <ellipse cx="110" cy="92" rx="30" ry="34" fill="#eef1ff"/>
    <path d="M84 118 l-18 44 h30 z" fill="#9aa0d8"/>
    <path d="M100 150 h36 l-6 12 h-24 z" fill="#8086c6"/>`),

  // 다용도 정리 바구니 (소)
  p19: wrap('#E2FAFB', `
    <path d="M62 96 h96 l-10 58 a8 8 0 0 1 -8 7 h-60 a8 8 0 0 1 -8 -7 z" fill="#5fc6d0"/>
    <path d="M62 96 h96 l-2 12 h-92 z" fill="#86d7df"/>
    <g stroke="#3fa9b4" stroke-width="3" opacity="0.6">
      <line x1="84" y1="110" x2="80" y2="156"/><line x1="110" y1="110" x2="110" y2="158"/><line x1="136" y1="110" x2="140" y2="156"/>
    </g>
    <rect x="70" y="86" width="80" height="12" rx="6" fill="#3fa9b4"/>`),

  // 라운드 코스터 4p
  p20: wrap('#FFEFDD', `
    <ellipse cx="110" cy="150" rx="44" ry="12" fill="#e4b07a"/>
    <ellipse cx="110" cy="138" rx="44" ry="12" fill="#f0c48f"/>
    <ellipse cx="110" cy="126" rx="44" ry="12" fill="#e4b07a"/>
    <ellipse cx="110" cy="112" rx="44" ry="13" fill="#f6d3a3"/>
    <ellipse cx="110" cy="112" rx="30" ry="8" fill="#e4b07a" opacity="0.5"/>`),
}

export function getArt(id) {
  return ART[id] || wrap('#eee', '<circle cx="110" cy="104" r="40" fill="#ccc"/>')
}
