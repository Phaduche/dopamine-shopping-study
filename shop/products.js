// ============================================================
// 표준 상품 풀 (v6 §6.3)
// ------------------------------------------------------------
// - 가격/크기가 유사한 소액 비필수 상품 20종
// - 문구, 소형 생활용품, 액세서리 등 안전 품목
// - 식품/화장품/알레르기 위험/연령제한 품목 제외
// - 실제 쇼핑몰 브랜드·상표·상품사진을 사용하지 않음 → 연구용 가상 브랜드 + 자체 생성 썸네일
// - 상품 이미지는 외부 URL이 아니라 코드로 생성되는 색상 썸네일을 사용(저작권 안전)
//
// 파일럿에서 매력도/친숙도/선택편중을 확인해 최종 풀을 확정한다(§6.3).
// 아래 price는 '연구용 가격 범주'를 표현하기 위한 표시값이며 실제 결제와 무관하다.
// ============================================================

const CATEGORIES = [
  { id: 'all', name: '전체' },
  { id: 'stationery', name: '문구' },
  { id: 'living', name: '생활소품' },
  { id: 'desk', name: '데스크' },
  { id: 'accessory', name: '액세서리' },
  { id: 'organize', name: '정리수납' },
]

// 가상 브랜드명 (실제 브랜드 아님)
const V = {
  dot: '도트랩',
  mori: '모리',
  nook: '누크',
  piel: '피엘',
  gom: '곰손',
}

// 썸네일: 이모지 + 배경색으로 코드 생성 (외부 이미지 미사용)
function thumb(emoji, bg) {
  return { emoji, bg }
}

const PRODUCTS = [
  {
    id: 'p01', name: '파스텔 무지 노트 (A5 · 80매)', brand: V.dot, category: 'stationery',
    price: 3900, listPrice: 5500, rating: 4.8, reviews: 1243, rocket: true,
    thumb: thumb('📓', '#FDE68A'),
    desc: '부드러운 미색 내지의 무지 노트. 필기와 드로잉 모두에 적합합니다.',
  },
  {
    id: 'p02', name: '젤 볼펜 5색 세트 (0.4mm)', brand: V.mori, category: 'stationery',
    price: 4200, listPrice: 6000, rating: 4.7, reviews: 2890, rocket: true,
    thumb: thumb('🖊️', '#BFDBFE'),
    desc: '번짐 없는 빠른 건조 잉크. 다섯 가지 차분한 색상 구성.',
  },
  {
    id: 'p03', name: '떡메모지 (사각 · 100매)', brand: V.dot, category: 'stationery',
    price: 2800, listPrice: 3500, rating: 4.6, reviews: 764, rocket: true,
    thumb: thumb('🗒️', '#FBCFE8'),
    desc: '한 장씩 떼어 쓰는 메모지. 데스크 정리와 할 일 메모에 좋아요.',
  },
  {
    id: 'p04', name: '미니 데스크 정리 트레이', brand: V.nook, category: 'desk',
    price: 5900, listPrice: 8900, rating: 4.5, reviews: 538, rocket: true,
    thumb: thumb('🗂️', '#C7D2FE'),
    desc: '펜, 클립, 메모를 한 곳에. 책상 위 작은 정돈을 도와줍니다.',
  },
  {
    id: 'p05', name: '실리콘 접이식 컵', brand: V.piel, category: 'living',
    price: 4500, listPrice: 7000, rating: 4.4, reviews: 412, rocket: false,
    thumb: thumb('🥤', '#A7F3D0'),
    desc: '휴대하기 좋은 접이식 컵. 가볍고 세척이 간편합니다.',
  },
  {
    id: 'p06', name: '마스킹 테이프 3롤 세트', brand: V.mori, category: 'stationery',
    price: 3600, listPrice: 4800, rating: 4.7, reviews: 1655, rocket: true,
    thumb: thumb('🎀', '#FECACA'),
    desc: '다이어리 꾸미기와 라벨링에 쓰기 좋은 파스텔 패턴 3종.',
  },
  {
    id: 'p07', name: '손목 받침 마우스패드', brand: V.gom, category: 'desk',
    price: 6900, listPrice: 9900, rating: 4.6, reviews: 980, rocket: true,
    thumb: thumb('🖱️', '#DDD6FE'),
    desc: '쿠션 손목 받침으로 장시간 작업의 피로를 줄여줍니다.',
  },
  {
    id: 'p08', name: '미니 무드등 (USB)', brand: V.nook, category: 'living',
    price: 7500, listPrice: 11000, rating: 4.5, reviews: 623, rocket: true,
    thumb: thumb('💡', '#FEF3C7'),
    desc: '은은한 조도의 USB 무드등. 책상과 침대 옆 조명으로.',
  },
  {
    id: 'p09', name: '키링 파우치 (카드수납)', brand: V.piel, category: 'accessory',
    price: 5200, listPrice: 7900, rating: 4.3, reviews: 287, rocket: false,
    thumb: thumb('👝', '#FBCFE8'),
    desc: '교통카드와 동전을 담는 작은 키링 파우치.',
  },
  {
    id: 'p10', name: '패브릭 헤어밴드 2개입', brand: V.mori, category: 'accessory',
    price: 3300, listPrice: 4500, rating: 4.4, reviews: 519, rocket: true,
    thumb: thumb('🎗️', '#C7F9CC'),
    desc: '세안·홈케어용 부드러운 헤어밴드. 두 가지 색 구성.',
  },
  {
    id: 'p11', name: '접이식 독서 받침대', brand: V.gom, category: 'desk',
    price: 8900, listPrice: 13000, rating: 4.7, reviews: 1104, rocket: true,
    thumb: thumb('📚', '#BAE6FD'),
    desc: '각도 조절이 되는 휴대용 독서/태블릿 받침대.',
  },
  {
    id: 'p12', name: '케이블 정리 클립 6개', brand: V.nook, category: 'organize',
    price: 2900, listPrice: 4000, rating: 4.5, reviews: 2011, rocket: true,
    thumb: thumb('🔌', '#E9D5FF'),
    desc: '책상 위 충전 케이블을 깔끔하게 고정하는 접착식 클립.',
  },
  {
    id: 'p13', name: '미니 탁상 달력 (만년)', brand: V.dot, category: 'desk',
    price: 4800, listPrice: 6500, rating: 4.6, reviews: 348, rocket: false,
    thumb: thumb('📅', '#FDE68A'),
    desc: '연도에 상관없이 쓰는 원목 블록 만년 달력.',
  },
  {
    id: 'p14', name: '폭신 슬리퍼 (실내용)', brand: V.piel, category: 'living',
    price: 7900, listPrice: 11900, rating: 4.4, reviews: 742, rocket: true,
    thumb: thumb('🥿', '#FBCFE8'),
    desc: '푹신한 쿠션감의 실내 슬리퍼. 미끄럼 방지 밑창.',
  },
  {
    id: 'p15', name: '투명 필통 (지퍼형)', brand: V.mori, category: 'stationery',
    price: 3400, listPrice: 4500, rating: 4.5, reviews: 889, rocket: true,
    thumb: thumb('✏️', '#BFDBFE'),
    desc: '내용물이 보이는 투명 지퍼 필통. 넉넉한 수납.',
  },
  {
    id: 'p16', name: '미니 공기 식물 화분', brand: V.nook, category: 'living',
    price: 6200, listPrice: 8500, rating: 4.3, reviews: 194, rocket: false,
    thumb: thumb('🪴', '#BBF7D0'),
    desc: '관리가 쉬운 소형 공기정화 식물(조화 포함 옵션).',
  },
  {
    id: 'p17', name: '자석 북마크 4개 세트', brand: V.dot, category: 'stationery',
    price: 2600, listPrice: 3500, rating: 4.7, reviews: 1322, rocket: true,
    thumb: thumb('🔖', '#FECDD3'),
    desc: '페이지를 집어 고정하는 자석 북마크. 책 손상 없이 사용.',
  },
  {
    id: 'p18', name: '손거울 (접이식 스탠드)', brand: V.piel, category: 'accessory',
    price: 5500, listPrice: 7900, rating: 4.4, reviews: 406, rocket: true,
    thumb: thumb('🪞', '#DDD6FE'),
    desc: '세워서 쓰는 접이식 탁상 손거울. 휴대용 파우치 포함.',
  },
  {
    id: 'p19', name: '다용도 정리 바구니 (소)', brand: V.gom, category: 'organize',
    price: 4100, listPrice: 5500, rating: 4.6, reviews: 1577, rocket: true,
    thumb: thumb('🧺', '#A5F3FC'),
    desc: '책상, 서랍, 욕실 어디든 쓰는 소형 정리 바구니.',
  },
  {
    id: 'p20', name: '라운드 코스터 4p', brand: V.nook, category: 'living',
    price: 3900, listPrice: 5200, rating: 4.5, reviews: 611, rocket: false,
    thumb: thumb('🟤', '#FED7AA'),
    desc: '테이블을 보호하는 펠트 코스터 4개입. 두 가지 톤.',
  },
]

function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id) || null
}

function formatPrice(n) {
  return n.toLocaleString('ko-KR') + '원'
}
