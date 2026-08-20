import { useState } from "react";

const LANGUAGE_LABEL = { ko: "한국어", ja: "일본어", en: "영어" };
const RELATIONSHIP_LABEL = { CLIENT: "고객사", PARTNER: "외부 협력사", COLLEAGUE: "동료" };
const ISSUE_LABEL = { HIGH: "위험", MEDIUM: "보통", LOW: "적정" };

const TABS = [
  { key: "reasons", label: "AI 피드백" },
  { key: "analysis", label: "분석 결과" },
  { key: "recommendation", label: "추천 이메일" },
];

function initials(name = "") {
  return name.slice(0, 2).toUpperCase();
}

function ProfileCard({ recipient, onEdit }) {
  return (
    <div className="tomo-info-block">
      <div className="tomo-info-label">
        <span className="tomo-info-dot" />
        Info.
      </div>

      <div className="tomo-profile-card">
        <div className="tomo-profile-avatar">{initials(recipient?.name)}</div>
        <div className="tomo-profile-main">
          <div className="tomo-profile-name">{recipient?.name}</div>
          <div className="tomo-profile-email">{recipient?.email}</div>
        </div>
        <button className="tomo-edit-link" onClick={onEdit}>
          수정하기
        </button>
      </div>

      <div className="tomo-meta-grid">
        <div className="tomo-meta-col">
          <div className="tomo-meta-label">국가·언어</div>
          <div className="tomo-meta-value">
            {LANGUAGE_LABEL[recipient?.languageCode] || recipient?.languageCode || "—"}
          </div>
        </div>
        <div className="tomo-meta-col">
          <div className="tomo-meta-label">관계</div>
          <div className="tomo-meta-value">
            {RELATIONSHIP_LABEL[recipient?.relationship] || recipient?.relationship || "—"}
          </div>
        </div>
        <div className="tomo-meta-col">
          <div className="tomo-meta-label">소통 방식</div>
          <div className="tomo-meta-value">{recipient?.communicationStyle || "—"}</div>
        </div>
      </div>
    </div>
  );
}

function TabNav({ activeTab, onChange }) {
  const activeIndex = TABS.findIndex((t) => t.key === activeTab);
  const go = (delta) => {
    const next = (activeIndex + delta + TABS.length) % TABS.length;
    onChange(TABS[next].key);
  };
  return (
    <div className="tomo-tabnav">
      <button className="tomo-tabnav-arrow" onClick={() => go(-1)} aria-label="이전">
        ‹
      </button>
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={`tomo-tabnav-item ${tab.key === activeTab ? "active" : ""}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
      <button className="tomo-tabnav-arrow" onClick={() => go(1)} aria-label="다음">
        ›
      </button>
    </div>
  );
}

function AnalysisPanel({ result, onGotoRecommendation }) {
  const score = result?.riskScore ?? 0;
  return (
    <div className="tomo-analysis-card">
      <div className="tomo-risk-title">문화적 오해 위험도</div>
      <div className="tomo-risk-score">
        {score}
        <span className="tomo-risk-score-max">/100</span>
      </div>
      <p className="tomo-risk-desc">{result?.requestSummary}</p>

      <div className="tomo-issues-title">발견된 이슈</div>
      {result?.risks?.length ? (
        <ul className="tomo-issue-list">
          {result.risks.map((risk, i) => (
            <li key={i} className="tomo-issue-row">
              <span className={`tomo-issue-badge tomo-issue-${risk.severity?.toLowerCase()}`}>
                <span className="tomo-issue-dot" />
                {ISSUE_LABEL[risk.severity] || risk.severity}
              </span>
              <span className="tomo-issue-text">{risk.text}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="tomo-empty">탐지된 문화적 위험 표현이 없습니다.</p>
      )}

      <button className="tomo-goto-recommend" onClick={onGotoRecommendation}>
        추천 이메일 보기 ›
      </button>
    </div>
  );
}

function ReasonsPanel({ risks }) {
  return (
    <div className="tomo-analysis-card">
      <div className="tomo-issues-title">AI 피드백</div>
      {risks?.length ? (
        <ul className="tomo-reason-list">
          {risks.map((risk, i) => (
            <li key={i} className="tomo-reason-item">
              <span className="tomo-reason-dot" />
              <span>{risk.suggestion || risk.reason}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="tomo-empty">별도 변경 사유가 없습니다.</p>
      )}
    </div>
  );
}

function RecommendationPanel({ recommendation, onApply }) {
  const [view, setView] = useState("local"); // "korean" | "local"

  if (!recommendation) {
    return (
      <div className="tomo-analysis-card">
        <p className="tomo-empty">추천 이메일이 없습니다.</p>
      </div>
    );
  }

  const hasKorean = recommendation.koreanSubject != null || recommendation.koreanBody != null;
  const subject = view === "korean" ? recommendation.koreanSubject : recommendation.subject;
  const body = view === "korean" ? recommendation.koreanBody : recommendation.body;

  return (
    <div className="tomo-analysis-card">
      {hasKorean && (
        <div className="tomo-lang-toggle">
          <button className={view === "korean" ? "active" : ""} onClick={() => setView("korean")}>
            본문
          </button>
          <button className={view === "local" ? "active" : ""} onClick={() => setView("local")}>
            현지 언어로 보기
          </button>
        </div>
      )}
      <div className="tomo-recommendation">
        <div className="tomo-recommendation-subject">{subject}</div>
        <div className="tomo-recommendation-body">{body}</div>
        <button className="tomo-primary-btn" onClick={() => onApply({ subject, body })}>
          Gmail 본문에 적용
        </button>
      </div>
    </div>
  );
}

export default function ResultScreen({ analysis, onApply, onBack, onEdit }) {
  const [activeTab, setActiveTab] = useState("analysis");
  const { recipient, analysis: result, recommendation } = analysis;

  return (
    <div className="tomo-screen tomo-result">
      <button className="tomo-back-link" onClick={onBack}>
        ‹ 다시 분석하기
      </button>

      <ProfileCard recipient={recipient} onEdit={onEdit} />

      <TabNav activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "reasons" && <ReasonsPanel risks={result?.risks} />}
      {activeTab === "analysis" && (
        <AnalysisPanel result={result} onGotoRecommendation={() => setActiveTab("recommendation")} />
      )}
      {activeTab === "recommendation" && (
        <RecommendationPanel recommendation={recommendation} onApply={onApply} />
      )}
    </div>
  );
}
