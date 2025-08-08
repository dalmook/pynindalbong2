import { pinyin } from 'https://unpkg.com/pinyin-pro/dist/pinyin-pro.esm.min.js';

const inputEl = document.getElementById('inputText');
const outputEl = document.getElementById('output');
const historyEl = document.getElementById('historyList');
let history = [];

// 번역: LibreTranslate 공개 서버 사용 (무료, API 키 불필요)
async function translate(text) {
  const res = await fetch('https://libretranslate.de/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text, source: 'zh', target: 'ko', format: 'text' })
  });
  const json = await res.json();
  return json.translatedText || '';
}

// 히스토리 추가
function addHistory(input, formatted) {
  history.push({ input, formatted });
  const li = document.createElement('li');
  li.textContent = input.length < 30 ? input : input.slice(0, 27) + '...';
  li.addEventListener('click', () => {
    inputEl.value = input;
    outputEl.innerHTML = formatted;
  });
  historyEl.prepend(li);
}

// 변환 처리
async function processText() {
  let raw = inputEl.value.trim();
  if (!raw) return alert('간체 중국어 문장을 입력해주세요.');
  if (!raw.endsWith('。')) raw += '。';
  const sentences = raw.split('。').filter(s => s.trim());
  let html = '';
  for (const sent of sentences) {
    const orig = sent + '。';
    const py = pinyin(orig, { toneType: 'symbol' });
    const ko = await translate(orig);
    html += `<p>${orig}<br>` +
            `<span class="pinyin">[병음] ${py}</span><br>` +
            `<span class="meaning">[뜻] ${ko}</span></p>`;
  }
  outputEl.innerHTML = html;
  addHistory(inputEl.value.trim(), html);
}

// 이벤트
convertBtn.addEventListener('click', processText);
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(outputEl.innerText);
  alert('결과를 클립보드에 복사했습니다.');
});
