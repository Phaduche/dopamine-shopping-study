import { useStudy } from '../context/StudyContext.jsx'

// 상단 연구 고지 바 — 모든 화면 상단에 '실제 쇼핑몰 아님'을 상시 표시
export default function StudyBar() {
  const { state, condition } = useStudy()
  return (
    <div className="studybar">
      🔬 <b>연구용 모의 쇼핑 앱</b> · 실제 쇼핑몰이 아니며 <b>실제 결제·판매가 발생하지 않습니다</b>
      {state.sim > 0 && <> · <b>시간가속 {state.sim}×</b> 데모 모드</>}
    </div>
  )
}
