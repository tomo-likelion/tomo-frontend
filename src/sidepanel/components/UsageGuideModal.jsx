const STEPS = [
  "Gmail에서 이메일을 작성해주세요.",
  "수신자의 언어와 관계를 확인해주세요.",
  "AI 분석 요청을 눌러주세요.",
  "문화적 오해 위험을 확인해주세요.",
  "TOMO가 추천한 이메일을 확인해주세요.",
  "마음에 들면 Gmail 본문에 적용해주세요.",
];

export default function UsageGuideModal({ onClose }) {
  return (
    <div className="tomo-modal-backdrop" onClick={onClose}>
      <div className="tomo-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tomo-modal-header">
          <span>TOMO 사용 가이드</span>
          <button className="tomo-icon-btn" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>
        <ol className="tomo-guide-list">
          {STEPS.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
        <p className="tomo-guide-note">
          ※ TOMO는 이메일을 자동으로 발송하지 않습니다. 최종 확인과 전송은 사용자가 직접 진행합니다.
        </p>
      </div>
    </div>
  );
}
