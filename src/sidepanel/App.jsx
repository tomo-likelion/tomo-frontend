import { useEffect, useState, useCallback } from "react";
import { getRecipient, analyzeEmail } from "./api/client.js";
import LandingScreen from "./components/LandingScreen.jsx";
import MatchedScreen from "./components/MatchedScreen.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import ResultScreen from "./components/ResultScreen.jsx";
import UsageGuideModal from "./components/UsageGuideModal.jsx";
import { getComposeContext, applyToGmail } from "./gmailBridge.js";

// 화면 흐름: landing(수신자 미확인) -> matched(수신자 확인, 분석 전)
//           -> loading(AI 분석 중) -> result(분석 결과 + 추천 이메일)
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [compose, setCompose] = useState(null); // { recipientEmail, subject, body }
  const [recipient, setRecipient] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [showGuide, setShowGuide] = useState(false);

  // Gmail 작성창 상태를 폴링해서 수신자가 바뀌면 다시 매칭 시도
  const refreshCompose = useCallback(async () => {
    try {
      const ctx = await getComposeContext();
      setCompose(ctx);

      if (!ctx?.recipientEmail) {
        setScreen("landing");
        setRecipient(null);
        return;
      }

      try {
        const profile = await getRecipient(ctx.recipientEmail);
        setRecipient(profile);
        setScreen((prev) =>
          prev === "result" || prev === "loading" ? prev : "matched"
        );
        setError(null);
      } catch (e) {
        setRecipient(null);
        setScreen("landing");
        setError(
          e.code === "RECIPIENT_NOT_FOUND"
            ? "등록되지 않은 수신자입니다. 관리자에게 프로필 등록을 요청해주세요."
            : "수신자 정보를 불러오지 못했습니다."
        );
      }
    } catch {
      // Gmail 탭을 찾을 수 없는 경우 등
      setScreen("landing");
    }
  }, []);

  useEffect(() => {
    refreshCompose();
    const interval = setInterval(refreshCompose, 4000);
    return () => clearInterval(interval);
  }, [refreshCompose]);

  const handleAnalyze = async () => {
    if (!compose?.recipientEmail) return;
    setScreen("loading");
    setError(null);
    try {
      const result = await analyzeEmail({
        recipientEmail: compose.recipientEmail,
        subject: compose.subject,
        body: compose.body,
      });
      setAnalysis(result);
      setScreen("result");
    } catch (e) {
      setError(e.message || "분석 중 오류가 발생했습니다.");
      setScreen("matched");
    }
  };

  const handleApplyToGmail = async () => {
    if (!analysis?.recommendation) return;
    await applyToGmail(analysis.recommendation);
  };

  const handleBackToAnalysis = () => {
    setScreen("matched");
    setAnalysis(null);
  };

  return (
    <div className="tomo-shell">
      <div className="tomo-topbar">
        <img className="tomo-logo" src="/logo.png" alt="tomo" />
        <button
          className="tomo-icon-btn"
          onClick={() => setShowGuide(true)}
          aria-label="사용 가이드"
          title="사용 가이드"
        >
          ?
        </button>
      </div>

      {error && <div className="tomo-error-banner">{error}</div>}

      {screen === "landing" && <LandingScreen onGuide={() => setShowGuide(true)} />}

      {screen === "matched" && (
        <MatchedScreen
          recipient={recipient}
          compose={compose}
          onAnalyze={handleAnalyze}
        />
      )}

      {screen === "loading" && <LoadingScreen />}

      {screen === "result" && analysis && (
        <ResultScreen
          analysis={analysis}
          onApply={handleApplyToGmail}
          onBack={handleBackToAnalysis}
        />
      )}

      {showGuide && <UsageGuideModal onClose={() => setShowGuide(false)} />}
    </div>
  );
}
