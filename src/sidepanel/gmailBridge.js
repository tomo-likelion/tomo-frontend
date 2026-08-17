// Side Panel <-> content-script.js 통신 헬퍼
// content-script는 Gmail DOM에서 작성창을 탐색(F-003)해서
// 수신자/제목/본문(F-004, F-005)을 추출해 응답합니다.

async function getActiveGmailTab() {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true,
    url: "https://mail.google.com/*",
  });
  return tabs[0] || null;
}

export async function getComposeContext() {
  const tab = await getActiveGmailTab();
  if (!tab) return null;

  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "TOMO_GET_COMPOSE_CONTEXT",
    });
    return response || null;
  } catch {
    // content script가 아직 로드되지 않았거나 작성창이 없는 경우
    return null;
  }
}

export async function applyToGmail({ subject, body }) {
  const tab = await getActiveGmailTab();
  if (!tab) throw new Error("Gmail 탭을 찾을 수 없습니다.");

  return chrome.tabs.sendMessage(tab.id, {
    type: "TOMO_APPLY_TO_COMPOSE",
    payload: { subject, body },
  });
}
