import { useEffect, useState } from 'react'
import SurveyModal from '../components/SurveyModal.jsx'
import { useStudy } from '../context/StudyContext.jsx'
import { useScreenLog } from '../lib/useScreenLog.js'
import { CONDITIONS } from '../lib/conditions.js'
import { TIMEPOINTS } from '../lib/conditions.js'
import * as logger from '../lib/logger.js'
import { clearAll } from '../lib/storage.js'

const SIM_OPTIONS = [
  { v: 0, label: '실시간 (72h = 실제 3일)' },
  { v: 60, label: '60× (72h ≈ 72분)' },
  { v: 720, label: '720× (72h ≈ 6분)' },
  { v: 1440, label: '1440× (72h ≈ 3분)' },
  { v: 4320, label: '4320× (72h ≈ 1분)' },
]

function fmt(ms) {
  if (!ms) return '-'
  return new Date(ms).toLocaleString('ko-KR', { hour12: false })
}

export default function Admin() {
  const { state, condition, reassign, resetAll } = useStudy()
  useScreenLog('admin')
  const [, force] = useState(0)
  const [pid, setPid] = useState(state.pid || '')
  const [cond, setCond] = useState(condition.key)
  const [sim, setSim] = useState(state.sim || 0)
  const [openTP, setOpenTP] = useState(null)
  const [copied, setCopied] = useState('')

  // 로그 변경 시 통계 자동 갱신
  useEffect(() => logger.subscribe(() => force((x) => x + 1)), [])
  useEffect(() => {
    setPid(state.pid || '')
    setCond(condition.key)
    setSim(state.sim || 0)
  }, [state.pid, condition.key, state.sim])

  const summary = logger.summarize()
  const logs = logger.getLogs()
  const meta = logger.getMeta()

  const apply = () => reassign({ pid: pid.trim() || undefined, cond, sim: Number(sim) })

  const participantURL = () => {
    const base = window.location.origin + window.location.pathname
    const p = pid.trim() || state.pid
    return `${base}?pid=${encodeURIComponent(p)}&cond=${cond}${Number(sim) ? `&sim=${sim}` : ''}`
  }

  const copy = (text, label) => {
    try {
      navigator.clipboard.writeText(text)
      setCopied(label)
      setTimeout(() => setCopied(''), 1500)
    } catch (e) { /* noop */ }
  }

  const doExport = (type) => {
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
    const name = `${state.pid || 'anon'}_${condition.key}_${stamp}`
    if (type === 'json') logger.download(`${name}.participant.json`, logger.exportJSON(), 'application/json')
    else logger.download(`${name}.participant.csv`, logger.exportCSV(), 'text/csv')
  }

  const condChip = (k) => <span className={`chip chip-${k}`}>{k} · {CONDITIONS[k].label}</span>

  return (
    <div className="container">
      <div className="admin">
        <h2>🔬 연구 관리자 콘솔</h2>
        <div className="sub">
          분석 눈가림을 위해 참가자 화면에는 조건명이 노출되지 않습니다. 이 콘솔은 연구팀 전용입니다.
        </div>

        {/* 현재 세션 */}
        <div className="admin-row">
          <span>현재 세션:</span> {condChip(condition.key)}
          <span className="chip">참가자 {state.pid}</span>
          <span className="chip">{sim > 0 ? `시간가속 ${sim}×` : '실시간'}</span>
          <span className="chip">앱 실행 {meta?.openCount || 0}회</span>
        </div>

        {/* 조건/참가자 배정 */}
        <h3 style={{ marginTop: 20 }}>조건 배정 / 세션 설정</h3>
        <div className="admin-row">
          <label>참가자 ID
            <input value={pid} onChange={(e) => setPid(e.target.value)} placeholder="예: P017" style={{ marginLeft: 8 }} />
          </label>
        </div>
        <div className="admin-row">
          <span>조건</span>
          {Object.keys(CONDITIONS).map((k) => (
            <button
              key={k}
              className={`btn ${cond === k ? 'btn-primary' : ''}`}
              style={{ padding: '8px 14px' }}
              onClick={() => setCond(k)}
            >
              {k} · {CONDITIONS[k].label}
            </button>
          ))}
        </div>
        <div className="admin-row">
          <span>시간</span>
          <select value={sim} onChange={(e) => setSim(Number(e.target.value))}>
            {SIM_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
          </select>
          <button className="btn btn-primary" onClick={apply}>적용</button>
        </div>
        <div className="admin-row">
          <button className="btn" onClick={() => copy(participantURL(), 'URL')}>
            🔗 참가자 접속 URL 복사
          </button>
          <code style={{ fontSize: 11, color: 'var(--muted)', wordBreak: 'break-all' }}>{participantURL()}</code>
        </div>

        {/* 로그 요약 */}
        <h3 style={{ marginTop: 24 }}>행동로그 요약</h3>
        <div className="stat-grid">
          <div className="stat"><div className="n">{summary.appOpens}</div><div className="l">앱 실행</div></div>
          <div className="stat"><div className="n">{summary.productViews}</div><div className="l">상품 조회</div></div>
          <div className="stat"><div className="n">{summary.productCompares}</div><div className="l">상품 비교</div></div>
          <div className="stat"><div className="n">{summary.cartAdds}</div><div className="l">장바구니 추가</div></div>
          <div className="stat"><div className="n">{summary.cartRemoves}</div><div className="l">장바구니 삭제</div></div>
          <div className="stat"><div className="n">{summary.deliveryChecks}</div><div className="l">배송조회 횟수</div></div>
          <div className="stat"><div className="n">{summary.extraBrowse}</div><div className="l">추가 상품탐색</div></div>
          <div className="stat"><div className="n">{summary.targetChanges}</div><div className="l">목표상품 변경</div></div>
          <div className="stat"><div className="n">{summary.surveysSubmitted}</div><div className="l">설문 제출</div></div>
          <div className="stat"><div className="n">{(summary.avgSurveyLatencyMs / 1000).toFixed(1)}s</div><div className="l">평균 응답시간</div></div>
          <div className="stat"><div className="n">{summary.total}</div><div className="l">전체 로그</div></div>
          <div className="stat">
            <div className="n">{Math.round(Object.values(summary.dwellByScreen).reduce((a, b) => a + b, 0) / 1000)}s</div>
            <div className="l">총 체류시간</div>
          </div>
        </div>

        {/* 설문 진행 상태 + 수동 열기 (파일럿) */}
        <h3 style={{ marginTop: 20 }}>측정시점 진행 상태</h3>
        <div className="admin-row">
          {TIMEPOINTS.map((t) => {
            const done = !!state.responses?.[t.id]
            return (
              <button
                key={t.id}
                className={`btn ${done ? 'btn-primary' : ''}`}
                style={{ padding: '8px 12px' }}
                onClick={() => setOpenTP(t.id)}
                title={`${t.when} — 클릭하여 설문 열기(파일럿)`}
              >
                {done ? '✓ ' : ''}{t.id}
              </button>
            )
          })}
        </div>
        <div className="sub">버튼을 누르면 해당 시점 설문을 수동으로 열 수 있습니다(파일럿/디버깅용).</div>

        {/* 내보내기 */}
        <h3 style={{ marginTop: 20 }}>데이터 내보내기</h3>
        <div className="admin-row">
          <button className="btn btn-primary" onClick={() => doExport('json')}>⬇ JSON 내보내기</button>
          <button className="btn" onClick={() => doExport('csv')}>⬇ CSV 내보내기</button>
          <button className="btn" onClick={() => copy(logger.exportJSON(), 'JSON')}>📋 JSON 복사</button>
        </div>
        <div className="sub">
          데이터는 서버로 전송되지 않고 이 기기에만 저장됩니다. IRB 승인 전에는 실제 참가자 자료를 수집하지 않습니다.
        </div>

        {/* 로그 테이블 */}
        <h3 style={{ marginTop: 20 }}>최근 이벤트 로그 ({logs.length})</h3>
        <div className="logwrap">
          <table className="logtable">
            <thead>
              <tr><th>시각</th><th>type</th><th>cond</th><th>screen</th><th>상세</th></tr>
            </thead>
            <tbody>
              {[...logs].reverse().slice(0, 200).map((l, i) => {
                const { t, iso, type, pid: lp, cond: lc, screen, ...rest } = l
                return (
                  <tr key={i}>
                    <td>{fmt(l.t)}</td>
                    <td>{type}</td>
                    <td>{lc || '-'}</td>
                    <td>{screen || '-'}</td>
                    <td style={{ color: 'var(--muted)' }}>
                      {Object.entries(rest).filter(([k]) => !['iso'].includes(k)).map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`).join(' · ')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* 초기화 */}
        <h3 style={{ marginTop: 20 }}>초기화</h3>
        <div className="admin-row">
          <button className="btn" onClick={() => { if (confirm('이 참가자의 로그만 삭제할까요?')) { logger.clearLogs() } }}>로그만 삭제</button>
          <button className="btn" onClick={() => { if (confirm('주문/장바구니/설문 응답을 초기화할까요? (로그는 유지)')) resetAll() }}>진행상태 초기화</button>
          <button className="btn" style={{ color: 'var(--brand)' }} onClick={() => { if (confirm('모든 저장 데이터를 삭제할까요? 되돌릴 수 없습니다.')) { clearAll(); location.reload() } }}>전체 삭제</button>
        </div>

        {copied && <div className="toast">{copied} 복사됨</div>}
      </div>

      {openTP && <SurveyModal timepoint={openTP} onClose={() => setOpenTP(null)} />}
    </div>
  )
}
