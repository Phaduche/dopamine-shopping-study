import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p>
          <b>담아마켓</b> — KSEF 연구용 모의 쇼핑 애플리케이션 (가상 브랜드)
        </p>
        <p>
          본 사이트는 실제 쇼핑몰이 아닙니다. 상품·브랜드·가격은 연구용 가상 정보이며,
          <b> 실제 결제·판매·배송 및 광고가 존재하지 않습니다.</b>
        </p>
        <p>
          수집 정보는 무작위 연구ID로만 연결된 앱 사용 로그와 설문 응답이며, 기기에만 저장됩니다.
          결제·계좌·연락처·위치·사진 정보는 수집하지 않습니다.
        </p>
        <p>
          사람 대상 연구는 IRB/SRC 사전승인 이후에만 실제 참가자 자료를 수집합니다. ·{' '}
          <Link to="/admin" style={{ textDecoration: 'underline' }}>연구 관리자</Link>
        </p>
      </div>
    </footer>
  )
}
