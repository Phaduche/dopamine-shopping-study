// ============================================================
// localStorage 래퍼 (브라우저 저장 실패에도 앱이 동작하도록 방어)
// ============================================================
// 연구 데이터는 서버로 전송하지 않고 기기 로컬에만 저장한 뒤
// 연구 담당자가 관리자 화면에서 내보낸다(IRB 승인 전 수집 금지 원칙과 부합).

const PREFIX = 'dss.' // dopamine shopping study

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw == null) return fallback
    return JSON.parse(raw)
  } catch (e) {
    return fallback
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
    return true
  } catch (e) {
    return false
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch (e) {
    /* noop */
  }
}

export function clearAll() {
  try {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(PREFIX)) keys.push(k)
    }
    keys.forEach((k) => localStorage.removeItem(k))
  } catch (e) {
    /* noop */
  }
}
