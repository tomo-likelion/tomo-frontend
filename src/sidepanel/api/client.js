// API 명세서 기준 클라이언트
// - GET    /api/v1/recipients/{email}
// - POST   /api/v1/recipients            (테스트/초기 데이터 등록용, MVP UI에서는 미사용)
// - GET    /api/v1/recipients            (전체 조회)
// - POST   /api/v1/email-analyses        (핵심 API: 분석 + 추천 생성)
// - GET    /api/v1/email-analyses/{id}
// - GET    /api/v1/email-analyses

const BASE_URL = "http://1.201.116.59/api/v1";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    let body;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    const err = new Error(body?.message || `요청 실패 (${res.status})`);
    err.code = body?.code;
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}

/**
 * 이메일 주소로 수신자 프로필 조회
 * 404 시 RECIPIENT_NOT_FOUND
 */
export function getRecipient(email) {
  return request(`/recipients/${encodeURIComponent(email)}`);
}

export function listRecipients() {
  return request(`/recipients`);
}

export function createRecipient(payload) {
  return request(`/recipients`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * 핵심 API: 이메일 의도·문화적 위험 분석 + 추천 이메일 생성
 * payload: { recipientEmail, subject, body }
 */
export function analyzeEmail(payload) {
  return request(`/email-analyses`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getEmailAnalysis(analysisId) {
  return request(`/email-analyses/${analysisId}`);
}

export function listEmailAnalyses() {
  return request(`/email-analyses`);
}