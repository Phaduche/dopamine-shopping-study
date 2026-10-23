// ============================================================
// 행동로그 수집기 (v6 §7.3 / §15)
// ------------------------------------------------------------
// 수집하는 로그:
//   - 앱 실행 시각과 횟수        → app_open
//   - 화면별 체류시간            → screen_enter / screen_exit(dwellMs)
//   - 상품 조회 수               → product_view
//   - 상품 변경·비교 횟수        → product_compare
//   - 장바구니 추가·삭제 횟수    → cart_add / cart_remove
//   - 배송조회 화면 방문 횟수·시각 → delivery_check
//   - 설문알림~응답까지의 시간   → survey_shown / survey_submit(latencyMs)
//   - 구매·보류·포기 선택        → decision
//   - 목표상품 변경 여부         → target_change
//   - '다른 상품 더 보기' 행동    → extra_browse
//
// 수집하지 않는 정보: 결제·계좌·로그인·연락처·사진·위치·광고식별자·IP (v6 §15)
// 모든 로그는 무작위 연구ID(pid)로만 연결되며 기기 로컬에만 저장된다.
// ============================================================

import { load, save } from './storage.js'

const LOG_KEY = 'logs'
const META_KEY = 'logmeta'

let listeners = []

export function subscribe(fn) {
  listeners.push(fn)
  return () => {
    listeners = listeners.filter((f) => f !== fn)
  }
}

function emit() {
  listeners.forEach((f) => {
    try { f() } catch (e) { /* noop */ }
  })
}

function readLogs() {
  return load(LOG_KEY, [])
}

function writeLogs(logs) {
  save(LOG_KEY, logs)
  emit()
}

// 세션 메타: 조건/참가자/시작시각/실행횟수
export function getMeta() {
  return load(META_KEY, null)
}

export function initSession({ pid, cond, sim }) {
  let meta = getMeta()
  const now = Date.now()
  if (!meta || meta.pid !== pid || meta.cond !== cond) {
    // 새 참가자/조건 → 세션 초기화
    meta = {
      pid: pid || 'anonymous',
      cond: cond || null,
      sim: sim || 0,
      firstOpen: now,
      openCount: 0,
      sessionId: `${pid || 'anon'}-${now}`,
    }
  }
  meta.openCount = (meta.openCount || 0) + 1
  meta.lastOpen = now
  meta.sim = sim || meta.sim || 0
  save(META_KEY, meta)
  return meta
}

export function logEvent(type, payload = {}) {
  const meta = getMeta() || {}
  const entry = {
    t: Date.now(),
    iso: new Date().toISOString(),
    type,
    pid: meta.pid || null,
    cond: meta.cond || null,
    ...payload,
  }
  const logs = readLogs()
  logs.push(entry)
  writeLogs(logs)
  return entry
}

export function getLogs() {
  return readLogs()
}

export function clearLogs() {
  writeLogs([])
}

// ---- 집계 (관리자 화면 요약용) ----
export function summarize() {
  const logs = readLogs()
  const by = (type) => logs.filter((l) => l.type === type)
  const deliveryChecks = by('delivery_check')
  const dwell = {}
  by('screen_exit').forEach((l) => {
    dwell[l.screen] = (dwell[l.screen] || 0) + (l.dwellMs || 0)
  })
  const surveys = by('survey_submit')
  const avgLatency = surveys.length
    ? Math.round(surveys.reduce((a, b) => a + (b.latencyMs || 0), 0) / surveys.length)
    : 0
  return {
    total: logs.length,
    appOpens: by('app_open').length,
    productViews: by('product_view').length,
    productCompares: by('product_compare').length,
    cartAdds: by('cart_add').length,
    cartRemoves: by('cart_remove').length,
    deliveryChecks: deliveryChecks.length,
    extraBrowse: by('extra_browse').length,
    targetChanges: by('target_change').length,
    surveysSubmitted: surveys.length,
    avgSurveyLatencyMs: avgLatency,
    dwellByScreen: dwell,
    decisions: by('decision').map((d) => d.choice),
  }
}

// ---- 내보내기 ----
export function exportJSON() {
  return JSON.stringify(
    { meta: getMeta(), logs: readLogs(), exportedAt: new Date().toISOString() },
    null,
    2,
  )
}

export function exportCSV() {
  const logs = readLogs()
  if (!logs.length) return 'iso,type,pid,cond,screen,detail\n'
  // 모든 키를 수집해 헤더 구성
  const keys = new Set(['iso', 'type', 'pid', 'cond', 'screen'])
  logs.forEach((l) => Object.keys(l).forEach((k) => keys.add(k)))
  keys.delete('t')
  const header = Array.from(keys)
  const esc = (v) => {
    if (v == null) return ''
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v)
    return '"' + s.replace(/"/g, '""') + '"'
  }
  const rows = logs.map((l) => header.map((k) => esc(l[k])).join(','))
  return header.join(',') + '\n' + rows.join('\n')
}

export function download(filename, text, mime = 'application/json') {
  try {
    const blob = new Blob([text], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    return true
  } catch (e) {
    return false
  }
}
