const RELATIONSHIP_LABEL = {
  CLIENT: "고객사",
  PARTNER: "외부 협력사",
  COLLEAGUE: "동료",
};

const LANGUAGE_LABEL = {
  ko: "한국어",
  ja: "일본어",
  en: "영어",
};

function initials(name = "") {
  return name.slice(0, 2).toUpperCase();
}

export default function MatchedScreen({ recipient, compose, onAnalyze }) {
  if (!recipient) return null;

  return (
    <div className="tomo-screen">
      <div className="tomo-recipient-card">
        <div className="tomo-avatar">{initials(recipient.name)}</div>
        <div className="tomo-recipient-info">
          <div className="tomo-recipient-name">{recipient.name}</div>
          <div className="tomo-recipient-org">{recipient.organization}</div>
          <div className="tomo-tag-row">
            <span className="tomo-tag">{LANGUAGE_LABEL[recipient.languageCode] || recipient.languageCode}</span>
            <span className="tomo-tag">
              {RELATIONSHIP_LABEL[recipient.relationship] || recipient.relationship}
            </span>
            <span className="tomo-tag tomo-tag-country">{recipient.countryCode}</span>
          </div>
        </div>
      </div>

      <div className="tomo-compose-preview">
        <div className="tomo-compose-label">현재 작성 중인 이메일</div>
        <div className="tomo-compose-subject">{compose?.subject || "(제목 없음)"}</div>
        <div className="tomo-compose-body">
          {(compose?.body || "").slice(0, 140) || "본문을 작성해주세요."}
          {compose?.body?.length > 140 ? "…" : ""}
        </div>
      </div>

      <button
        className="tomo-primary-btn tomo-analyze-btn"
        onClick={onAnalyze}
        disabled={!compose?.body}
      >
        AI 분석 요청
      </button>
    </div>
  );
}
