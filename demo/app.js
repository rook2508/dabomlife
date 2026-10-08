const tasks = {
  shopping: {
    keywords: ['사줘', '사고 싶', '주문', '쇼핑', '생수', '휴지', '쌀'],
    icon: '🛒', label: '생활 쇼핑', badge: '결제 전 확인 필요',
    heading: '필요한 물건을 찾아볼게요.',
    detail: '평소 구매하던 상품과 비슷한 조건을 먼저 확인하고, 결제 직전에 다시 물어봅니다.',
    steps: ['원하는 상품과 수량 확인', '배송 가능한 상품 비교', '가격·배송일 쉽게 설명', '결제 전 최종 확인'],
    sensitive: true
  },
  hospital: {
    keywords: ['병원', '의원', '진료', '예약', '정형외과', '내과', '치과'],
    icon: '🏥', label: '병원 예약', badge: '개인정보 보호',
    heading: '갈 수 있는 병원 시간을 정리할게요.',
    detail: '희망 시간과 진료과를 기준으로 예약 가능한 선택지를 보여주고, 예약 확정 전에 확인합니다.',
    steps: ['희망 진료과와 시간 확인', '가까운 병원 후보 정리', '예약 가능한 시간 비교', '예약 내용 최종 확인'],
    sensitive: true
  },
  government: {
    keywords: ['등본', '초본', '정부24', '민원', '주민센터', '동사무소', '서류'],
    icon: '📄', label: '공공 민원', badge: '본인 확인 필요',
    heading: '필요한 민원 절차를 대신 정리할게요.',
    detail: '발급 가능한 방법과 준비물을 먼저 확인하고, 본인인증이나 제출 직전에 안내합니다.',
    steps: ['필요한 민원 서류 확인', '온라인 발급 가능 여부 확인', '신청 정보 준비', '본인인증 후 발급'],
    sensitive: true
  },
  scam: {
    keywords: ['사기', '문자', '피싱', '링크', '스미싱', '수상'],
    icon: '🛡️', label: '사기·피싱 확인', badge: '안전 우선',
    heading: '수상한 내용을 먼저 확인할게요.',
    detail: '링크를 누르거나 개인정보를 입력하지 않은 상태에서 발신자와 문구를 확인하는 것이 안전합니다.',
    steps: ['문자나 화면 내용 확인', '수상한 링크·요구사항 점검', '공식 기관 여부 교차 확인', '안전한 다음 행동 안내'],
    sensitive: false
  },
  delivery: {
    keywords: ['배달', '치킨', '짜장', '음식', '저녁', '점심'],
    icon: '🍚', label: '음식 배달', badge: '결제 전 확인 필요',
    heading: '먹고 싶은 음식을 찾아볼게요.',
    detail: '배달 가능 여부와 최소 주문금액을 확인하고 결제 직전에 다시 물어봅니다.',
    steps: ['원하는 음식 확인', '배달 가능한 식당 비교', '가격·배달시간 안내', '주문 전 최종 확인'],
    sensitive: true
  },
  general: {
    keywords: [], icon: '✨', label: '생활 도움', badge: '안전하게 진행',
    heading: '어떻게 도와드릴지 순서대로 정리할게요.',
    detail: '요청을 작은 단계로 나눠서 설명하고, 중요한 행동은 사용자가 직접 확인하도록 합니다.',
    steps: ['원하는 결과 확인', '필요한 정보 찾기', '선택지를 쉽게 설명', '진행 전 최종 확인'],
    sensitive: false
  }
};

const els = {
  requestForm: document.querySelector('#requestForm'),
  requestInput: document.querySelector('#requestInput'),
  voiceButton: document.querySelector('#voiceButton'),
  assistantTitle: document.querySelector('#assistantTitle'),
  assistantSubtitle: document.querySelector('#assistantSubtitle'),
  workflow: document.querySelector('#workflowSection'),
  taskHeading: document.querySelector('#taskHeading'),
  safetyBadge: document.querySelector('#safetyBadge'),
  taskIcon: document.querySelector('#taskIcon'),
  taskLabel: document.querySelector('#taskLabel'),
  taskSummary: document.querySelector('#taskSummary'),
  taskDetail: document.querySelector('#taskDetail'),
  steps: document.querySelector('#stepsList'),
  actionTitle: document.querySelector('#actionTitle'),
  actionDescription: document.querySelector('#actionDescription'),
  continueTask: document.querySelector('#continueTask'),
  cancelTask: document.querySelector('#cancelTask'),
  guardianButton: document.querySelector('#guardianButton'),
  guardianModal: document.querySelector('#guardianModal'),
  modalClose: document.querySelector('#modalClose'),
  approvalRequest: document.querySelector('#approvalRequest'),
  sendApproval: document.querySelector('#sendApproval'),
  selfConfirm: document.querySelector('#selfConfirm'),
  requestApprovalActions: document.querySelector('#requestApprovalActions'),
  guardianReviewActions: document.querySelector('#guardianReviewActions'),
  guardianApprove: document.querySelector('#guardianApprove'),
  guardianReject: document.querySelector('#guardianReject'),
  fontToggle: document.querySelector('#fontToggle'),
  toast: document.querySelector('#toast'),
  historyList: document.querySelector('#historyList'),
  clearHistory: document.querySelector('#clearHistory')
};

let currentRequest = '';
let currentTask = tasks.general;
let toastTimer;
const STORAGE_KEY = 'dabom-mvp-state-v1';
let savedState = loadState();

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      pendingApproval: parsed.pendingApproval || null,
      history: Array.isArray(parsed.history) ? parsed.history.slice(0, 8) : []
    };
  } catch {
    return { pendingApproval: null, history: [] };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));
  renderHistory();
  updateGuardianPill();
}

function addHistory({ request, icon, label, status, statusText }) {
  savedState.history = [
    { id: Date.now(), request, icon, label, status, statusText, at: new Date().toISOString() },
    ...savedState.history.filter(item => item.request !== request)
  ].slice(0, 8);
  saveState();
}

function formatTime(value) {
  const date = new Date(value);
  return new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
}

function renderHistory() {
  if (!savedState.history.length) {
    els.historyList.innerHTML = '<div class="history-empty">아직 처리한 일이 없어요. 위에서 필요한 일을 말씀해보세요.</div>';
    return;
  }
  els.historyList.innerHTML = savedState.history.map(item => `
    <article class="history-item">
      <span class="history-icon" aria-hidden="true">${item.icon}</span>
      <div>
        <strong>${escapeHtml(item.request)}</strong>
        <p>${escapeHtml(item.label)} · ${formatTime(item.at)}</p>
      </div>
      <span class="history-status ${item.status}">${escapeHtml(item.statusText)}</span>
    </article>`).join('');
}

function escapeHtml(text) {
  return String(text).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function updateGuardianPill() {
  els.guardianButton.innerHTML = savedState.pendingApproval
    ? '<span class="status-dot"></span>승인 요청 1건'
    : '<span class="status-dot"></span>보호자 역할 체험';
}

function detectTask(text) {
  const normalized = text.replace(/\s+/g, '').toLowerCase();
  return Object.values(tasks).find(task => task.keywords.some(k => normalized.includes(k.replace(/\s+/g, '').toLowerCase()))) || tasks.general;
}

function renderTask(request) {
  currentRequest = request.trim();
  if (!currentRequest) return;
  currentTask = detectTask(currentRequest);

  els.workflow.hidden = false;
  els.taskHeading.textContent = `“${currentRequest}”`;
  els.safetyBadge.textContent = currentTask.badge;
  els.taskIcon.textContent = currentTask.icon;
  els.taskLabel.textContent = currentTask.label;
  els.taskSummary.textContent = currentTask.heading;
  els.taskDetail.textContent = currentTask.detail;
  els.steps.innerHTML = currentTask.steps.map((step, index) => `
    <li class="${index === 0 ? 'done' : ''}">
      <strong>${step}</strong>
      <span>${index === 0 ? '확인됨' : index === 1 ? '다음 단계' : '대기'}</span>
    </li>`).join('');

  els.actionTitle.textContent = currentTask.sensitive ? '중요한 단계 전까지 준비해둘게요.' : '안전하게 다음 단계로 진행할까요?';
  els.actionDescription.textContent = currentTask.sensitive
    ? '결제·예약·본인인증처럼 실제로 실행되는 순간에는 꼭 다시 확인합니다.'
    : '지금은 데모이므로 외부 서비스에 실제 정보가 전송되지는 않습니다.';
  els.continueTask.textContent = currentTask.sensitive ? '다음 단계 확인' : '계속하기';
  els.assistantTitle.textContent = '요청을 알아들었어요.';
  els.assistantSubtitle.textContent = currentTask.heading;
  els.requestInput.value = '';
  addHistory({
    request: currentRequest,
    icon: currentTask.icon,
    label: currentTask.label,
    status: 'ready',
    statusText: '준비 중'
  });
  if (window.parent === window) {
    els.workflow.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    // Embedded examples scroll their own frame without moving the introduction page.
    window.scrollTo({ top: els.workflow.offsetTop - 24, behavior: 'auto' });
  }
}

function openGuardianModal(mode = 'request') {
  const reviewing = mode === 'review' && savedState.pendingApproval;
  const item = reviewing ? savedState.pendingApproval : null;
  document.querySelector('#modalTitle').textContent = reviewing
    ? '가족에게 온 승인 요청이에요.'
    : (currentRequest ? '중요한 단계라서 보호자에게 확인할게요.' : '보호자가 연결되어 있어요.');
  document.querySelector('#modalText').textContent = reviewing
    ? '내용을 확인한 뒤 승인하거나 거절할 수 있습니다.'
    : (currentRequest ? '이 요청을 가족에게 보내 확인받습니다.' : '중요한 결제나 신청이 생기면 이곳에서 확인할 수 있습니다.');
  els.approvalRequest.textContent = reviewing ? item.request : (currentRequest || '현재 대기 중인 요청이 없습니다.');
  els.requestApprovalActions.hidden = reviewing || !currentRequest;
  els.guardianReviewActions.hidden = !reviewing;
  els.guardianModal.hidden = false;
  if (window.parent !== window && window.frameElement) {
    window.frameElement.scrollIntoView({ block: 'center', behavior: 'instant' });
  }
  els.modalClose.focus({ preventScroll: true });
}

function closeGuardianModal() {
  els.guardianModal.hidden = true;
}

function showToast(message) {
  clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add('show');
  toastTimer = setTimeout(() => els.toast.classList.remove('show'), 2600);
}

els.requestForm.addEventListener('submit', event => {
  event.preventDefault();
  renderTask(els.requestInput.value);
});

document.querySelectorAll('[data-request]').forEach(button => {
  button.addEventListener('click', () => renderTask(button.dataset.request));
});

els.continueTask.addEventListener('click', () => {
  if (currentTask.sensitive) {
    openGuardianModal();
  } else {
    showToast('다음 단계까지 안전하게 준비했어요.');
    [...els.steps.children].slice(0, 2).forEach(li => li.classList.add('done'));
  }
});

els.cancelTask.addEventListener('click', () => {
  els.workflow.hidden = true;
  els.assistantTitle.textContent = '알겠어요. 여기서 그만할게요.';
  els.assistantSubtitle.textContent = '다른 일이 필요하면 언제든 다시 말씀하세요.';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

els.guardianButton.addEventListener('click', () => openGuardianModal(savedState.pendingApproval ? 'review' : 'status'));
els.modalClose.addEventListener('click', closeGuardianModal);
els.guardianModal.addEventListener('click', event => { if (event.target === els.guardianModal) closeGuardianModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeGuardianModal(); });

els.sendApproval.addEventListener('click', () => {
  savedState.pendingApproval = {
    request: currentRequest,
    taskLabel: currentTask.label,
    icon: currentTask.icon,
    createdAt: new Date().toISOString()
  };
  addHistory({
    request: currentRequest,
    icon: currentTask.icon,
    label: currentTask.label,
    status: 'pending',
    statusText: '보호자 확인 중'
  });
  closeGuardianModal();
  showToast('보호자에게 승인 요청을 보냈어요.');
  els.assistantTitle.textContent = '보호자 확인을 기다리고 있어요.';
  els.assistantSubtitle.textContent = '승인되기 전에는 결제나 신청을 진행하지 않습니다.';
});

els.selfConfirm.addEventListener('click', () => {
  closeGuardianModal();
  addHistory({ request: currentRequest, icon: currentTask.icon, label: currentTask.label, status: 'approved', statusText: '본인 확인 준비' });
  showToast('본인 확인 단계까지 준비했어요.');
  [...els.steps.children].forEach(li => li.classList.add('done'));
  els.assistantTitle.textContent = '본인 확인 직전까지 준비했어요.';
  els.assistantSubtitle.textContent = '실제 외부 서비스에는 아직 아무 정보도 전송하지 않았습니다.';
});

els.guardianApprove.addEventListener('click', () => {
  const item = savedState.pendingApproval;
  if (!item) return closeGuardianModal();
  savedState.pendingApproval = null;
  addHistory({ request: item.request, icon: item.icon, label: item.taskLabel, status: 'approved', statusText: '보호자 승인' });
  closeGuardianModal();
  showToast('보호자가 승인했어요.');
  if (currentRequest === item.request) {
    [...els.steps.children].forEach(li => li.classList.add('done'));
    els.assistantTitle.textContent = '보호자 승인이 완료됐어요.';
    els.assistantSubtitle.textContent = '실제 실행 버튼을 붙이기 전 단계까지 안전하게 완료했습니다.';
  }
});

els.guardianReject.addEventListener('click', () => {
  const item = savedState.pendingApproval;
  if (!item) return closeGuardianModal();
  savedState.pendingApproval = null;
  addHistory({ request: item.request, icon: item.icon, label: item.taskLabel, status: 'rejected', statusText: '보호자 거절' });
  closeGuardianModal();
  showToast('보호자가 요청을 거절했어요.');
  if (currentRequest === item.request) {
    els.assistantTitle.textContent = '요청이 중단됐어요.';
    els.assistantSubtitle.textContent = '보호자가 거절해서 결제나 신청은 진행하지 않습니다.';
  }
});

els.clearHistory.addEventListener('click', () => {
  savedState.history = [];
  saveState();
  showToast('최근 도움 내역을 지웠어요.');
});

els.fontToggle.addEventListener('click', () => {
  const active = document.body.classList.toggle('large-text');
  els.fontToggle.setAttribute('aria-pressed', String(active));
  els.fontToggle.textContent = active ? '기본 글씨' : '글씨 크게';
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = 'ko-KR';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.addEventListener('start', () => {
    els.voiceButton.classList.add('listening');
    els.voiceButton.querySelector('span').textContent = '듣고 있어요…';
    els.assistantSubtitle.textContent = '천천히 말씀하셔도 됩니다.';
  });
  recognition.addEventListener('end', () => {
    els.voiceButton.classList.remove('listening');
    els.voiceButton.querySelector('span').textContent = '눌러서 말하기';
  });
  recognition.addEventListener('result', event => {
    const transcript = event.results[0][0].transcript;
    els.requestInput.value = transcript;
    renderTask(transcript);
  });
  recognition.addEventListener('error', () => {
    showToast('음성 인식이 잘 안 됐어요. 아래에 직접 적어도 됩니다.');
  });
  els.voiceButton.addEventListener('click', () => recognition.start());
} else {
  els.voiceButton.addEventListener('click', () => {
    els.requestInput.focus();
    showToast('이 브라우저에서는 음성 인식을 지원하지 않아 입력창을 열었어요.');
  });
}

renderHistory();
updateGuardianPill();

const demoExamples = { shopping: '생수 한 박스 주문해줘', hospital: '내일 오전에 정형외과 예약하고 싶어', government: '주민등록등본이 필요해' };
const demoRequest = demoExamples[new URLSearchParams(location.search).get('request')];
if (demoRequest) renderTask(demoRequest);

