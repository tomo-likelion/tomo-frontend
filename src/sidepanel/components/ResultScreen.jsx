import { useState } from "react";

const SEVERITY_LABEL = { HIGH: "높음", MEDIUM: "보통", LOW: "낮음" };

function ScoreGauge({ score = 0 }) {
  const level = score >= 75 ? "high" : score >= 50 ? "mid" : "low";
  return (
    <div className={`tomo-score tomo-score-${level}`}>
      <div className="tomo-score-number">{score}</div>
      <div className="tomo-score-max">/100</div>
      <div className="tomo-score-label">문화적 수용 지수</div>
    </div>
  );
}

function RiskList({ risks }) {
  if (!risks?.length) {
    return <p className="tomo-empty">탐지된 문화적 위험 표현이 없습니다.</p>;
  }
  return (
    <ul className="tomo-risk-list">
      {risks.map((risk, i) => (
        <li key={i} className={`tomo-risk-item tomo-risk-${risk.severity?.toLowerCase()}`}>
          <div className="tomo-risk-head">
            <span className="tomo-risk-text">“{risk.text}”</span>
            <span className="tomo-risk-severity">
              {SEVERITY_LABEL[risk.severity] || risk.severity}
            </span>
          </div>
          <p className="tomo-risk-reason">{risk.reason}</p>
        </li>
      ))}
    </ul>
  );
}

function ReasonList({ risks }) {
  if (!risks?.length) {
    return <p className="tomo-empty">별도 변경 사유가 없습니다.</p>;
  }
  return (
    <ul className="tomo-reason-list">
      {risks.map((risk, i) => (
        <li key={i} className="tomo-reason-item">
          <span className="tomo-reason-dot" />
          <span>{risk.suggestion || risk.reason}</span>
        </li>
      ))}
    </ul>
  );
}

function RecommendationPanel({ recommendation, onApply }) {
  if (!recommendation) return <p className="tomo-empty">추천 이메일이 없습니다.</p>;
  return (
    <div className="tomo-recommendation">
      <div className="tomo-recommendation-subject">{recommendation.subject}</div>
      <div className="tomo-recommendation-body">{recommendation.body}</div>
      <button className="tomo-primary-btn" onClick={onApply}>
        Gmail 본문에 적용
      </button>
    </div>
  );
}

export default function ResultScreen({ analysis, onApply, onBack }) {
  const [mainTab, setMainTab] = useState("analysis"); // analysis | recommendation
  const [subTab, setSubTab] = useState("risks"); // risks | reasons
  const { recipient, analysis: result, recommendation } = analysis;

  return (
    <div className="tomo-screen tomo-result">
      <button className="tomo-back-link" onClick={onBack}>
        ‹ 다시 분석하기
      </button>

      <div className="tomo-recipient-mini">
        <div className="tomo-avatar tomo-avatar-sm">{recipient?.name?.slice(0, 1)}</div>
        <div>
          <div className="tomo-recipient-name">{recipient?.name}</div>
          <div className="tomo-tag-row">
            <span className="tomo-tag">{recipient?.languageCode}</span>
            <span className="tomo-tag">{recipient?.relationship}</span>
          </div>
        </div>
      </div>

      <ScoreGauge score={result?.riskScore ?? 0} />

      <p className="tomo-summary">{result?.requestSummary}</p>

      <div className="tomo-main-tabs">
        <button
          className={mainTab === "analysis" ? "active" : ""}
          onClick={() => setMainTab("analysis")}
        >
          분석 결과
        </button>
        <button
          className={mainTab === "recommendation" ? "active" : ""}
          onClick={() => setMainTab("recommendation")}
        >
          추천 이메일
        </button>
      </div>

      {mainTab === "analysis" && (
        <div className="tomo-tab-panel">
          <div className="tomo-sub-tabs">
            <button
              className={subTab === "risks" ? "active" : ""}
              onClick={() => setSubTab("risks")}
            >
              위험 이슈
            </button>
            <button
              className={subTab === "reasons" ? "active" : ""}
              onClick={() => setSubTab("reasons")}
            >
              변경 이유
            </button>
          </div>
          {subTab === "risks" ? (
            <RiskList risks={result?.risks} />
          ) : (
            <ReasonList risks={result?.risks} />
          )}
        </div>
      )}

      {mainTab === "recommendation" && (
        <div className="tomo-tab-panel">
          <RecommendationPanel recommendation={recommendation} onApply={onApply} />
        </div>
      )}
    </div>
  );
}
