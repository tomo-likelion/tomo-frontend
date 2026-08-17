// 확장 아이콘 클릭 시 Gmail 탭에서 Side Panel을 엽니다.
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id });
  }
});

// Gmail 탭에서만 side panel이 활성화되도록 설정
chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (!tab.url) return;
  const isGmail = tab.url.startsWith("https://mail.google.com");
  chrome.sidePanel.setOptions({
    tabId,
    path: "sidepanel.html",
    enabled: isGmail,
  });
});
