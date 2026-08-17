export default function LandingScreen({ onGuide }) {
  return (
    <div className="tomo-screen tomo-landing">
      <div className="tomo-landing-badge">tomo</div>
      <p className="tomo-landing-title">Making every collaboration feel local.</p>
      <p className="tomo-landing-desc">
        Gmail에서 해외 파트너에게 보낼 이메일을 작성해주세요.
        <br />
        수신자 정보를 확인하면 TOMO가 문화·언어·관계 맥락을 분석합니다.
      </p>
      <button className="tomo-primary-btn" onClick={onGuide}>
        사용 가이드 보기
      </button>
    </div>
  );
}
