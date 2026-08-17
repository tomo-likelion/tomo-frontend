// TOMO content script — Gmail 작성창을 탐색하고 side panel과 메시지로 통신합니다.
// 주의: Gmail DOM 클래스명은 난독화되어 있고 변경될 수 있으므로
// role/aria-label 기반 선택자를 우선으로 하고, 필요시 아래 셀렉터를 조정하세요.

function findComposeRoot() {
  // 여러 개의 작성창(팝업)이 떠 있을 수 있으므로 가장 마지막(최상단) 것을 사용
  const candidates = document.querySelectorAll('div[role="dialog"]');
  for (let i = candidates.length - 1; i >= 0; i--) {
    const el = candidates[i];
    if (el.querySelector('input[name="subjectbox"]')) return el;
  }
  return null;
}

function extractRecipientEmail(root) {
  // 수신자 칩은 email 속성을 가진 span으로 렌더링되는 경우가 많음
  const chip = root.querySelector("span[email]");
  if (chip) return chip.getAttribute("email");

  // fallback: "받는사람" input에 직접 입력된 텍스트
  const toInput = root.querySelector(
    'textarea[name="to"], input[aria-label*="받는사람"], input[aria-label*="To"]'
  );
  if (toInput?.value) {
    const match = toInput.value.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    return match ? match[0] : null;
  }
  return null;
}

function getSubjectInput(root) {
  return root.querySelector('input[name="subjectbox"]');
}

function getBodyEditable(root) {
  return root.querySelector(
    'div[aria-label*="본문"][contenteditable="true"], div[aria-label*="Message Body"][contenteditable="true"], div.Am.Al.editable'
  );
}

function getComposeContext() {
  const root = findComposeRoot();
  if (!root) return null;

  const subjectEl = getSubjectInput(root);
  const bodyEl = getBodyEditable(root);

  return {
    recipientEmail: extractRecipientEmail(root),
    subject: subjectEl?.value || "",
    body: bodyEl?.innerText || "",
  };
}

function setNativeValue(input, value) {
  const proto = Object.getPrototypeOf(input);
  const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
  descriptor.set.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function applyToCompose({ subject, body }) {
  const root = findComposeRoot();
  if (!root) throw new Error("작성 중인 Gmail 창을 찾을 수 없습니다.");

  const subjectEl = getSubjectInput(root);
  if (subjectEl && subject) {
    setNativeValue(subjectEl, subject);
  }

  const bodyEl = getBodyEditable(root);
  if (bodyEl && body) {
    bodyEl.focus();
    // Gmail 리치 에디터는 innerText 교체 + input 이벤트로 상태 동기화
    bodyEl.innerText = body;
    bodyEl.dispatchEvent(new InputEvent("input", { bubbles: true }));
  }

  return { applied: true };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "TOMO_GET_COMPOSE_CONTEXT") {
    sendResponse(getComposeContext());
    return true;
  }
  if (message.type === "TOMO_APPLY_TO_COMPOSE") {
    try {
      sendResponse(applyToCompose(message.payload));
    } catch (e) {
      sendResponse({ applied: false, error: e.message });
    }
    return true;
  }
  return false;
});
