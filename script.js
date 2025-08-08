// 전역 pinyin 함수 사용 (UMD via unpkg)
const { pinyin } = window.pinyinPro;

const inputEl = document.getElementById('inputText');
const outputEl = document.getElementById('output');
const historyEl = document.getElementById('historyList');
const convertBtn = document.getElementById('convertBtn');
const copyBtn = document.getElementById('copyBtn');

let history = [];

// 저장된 히스토리 불러오기
function loadHistory() {
  const saved = localStorage.getItem('history');
  if (saved) {
    history = JSON.parse(saved);
    history.forEach(item => renderHistoryItem(item));
  }
}

// 히스토리 렌더링
function renderHistoryItem({ input, formatted }) {
  const li = document.createElement('li');
  li.textContent = input.length < 30 ? input : input.slice(0, 27) + '...';
  li.addEventListener('click', () => {
    inputEl.value = input;
    outputEl.innerHTML = formatted;
  });
  historyEl.prepend(li);
}

// 히스토리 저장
function saveHistory() {
  localStorage.setItem('history', JSON.stringify(history));
}

// 번역: Google Translate 비공식 gtx API + 사전 데이터 활용
async function translate(text) {
  const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-CN&tl=ko&dt=t&dt=bd&q=' +
    encodeURIComponent(text);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('번역 API 요청 실패: ' + res.status);
  }
  const data = await res.json();
  let translation = '';
  if (data[1] && data[1].length && data[1][0] && data[1][0][0]) {
    translation = data[1][0][0][0];
  }
  if (!translation && data[0] && data[0][0] && data[0][0][0]) {
    translation = data[0][0][0];
  }
  return translation;
}

// 변환 처리
async function processText() {
  let raw = inputEl.value.trim();
  if (!raw) {
    alert('간체 중국어 문장을 입력해주세요.');
    return;
  }
  if (!raw.endsWith('。')) raw += '。';
  const sentences = raw.split('。').filter(s => s.trim());
  let html = '';
  for (const sent of sentences) {
    const orig = sent + '。';
    const py = pinyin(orig, { toneType: 'symbol' });
    let ko;
    try {
      ko = await translate(orig);
    } catch (e) {
      console.error(e);
      ko = '번역 오류';
    }
    html += `<p>${orig}<br>` +
            `<span class="pinyin">[병음] ${py}</span><br>` +
            `<span class="meaning">[뜻] ${ko}</span></p>`;
  }
  outputEl.innerHTML = html;
  // 히스토리 추가 및 저장
  const record = { input: raw, formatted: html };
  history.unshift(record);
  renderHistoryItem(record);
  saveHistory();
}

// 이벤트 바인딩
convertBtn.addEventListener('click', processText);
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(outputEl.innerText);
  alert('결과를 클립보드에 복사했습니다.');
});

// 페이지 로드 시 히스토리 복원
window.addEventListener('load', loadHistory);
