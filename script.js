const inputEl = document.getElementById('inputText');
const outputEl = document.getElementById('output');
const historyEl = document.getElementById('historyList');
let history = [];

// Papago API 설정 (클라이언트에서 사용 시 CORS 프록시 필요)
const PAPAGO_ID = 'YOUR_CLIENT_ID';
const PAPAGO_SECRET = 'YOUR_CLIENT_SECRET';

async function translate(text) {
  const res = await fetch('https://openapi.naver.com/v1/papago/n2mt', {
    method: 'POST',
    headers: {
      'X-Naver-Client-Id': PAPAGO_ID,
      'X-Naver-Client-Secret': PAPAGO_SECRET,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({ source: 'zh-CN', target: 'ko', text })
  });
  const json = await res.json();
  return json.message?.result.translatedText || '';
}

function addHistory(input, formatted) {
  history.push({ input, formatted });
  const li = document.createElement('li');
  li.textContent = input.length < 30 ? input : input.slice(0,27) + '...';
  li.addEventListener('click', () => {
    inputEl.value = input;
    outputEl.innerHTML = formatted;
  });
  historyEl.prepend(li);
}

async function process() {
  let raw = inputEl.value.trim();
  if (!raw) return alert('간체 중국어 문장을 입력해주세요.');
  if (!raw.endsWith('。')) raw += '。';
  const sentences = raw.split('。').filter(s=>s.trim());
  let html = '';
  for (const sent of sentences) {
    const orig = sent + '。';
    const py = pinyinPro(orig, { toneType: 'symbol' });
    const ko = await translate(orig);
    html += `<p>${orig}<br>`+
            `<span class="pinyin">[병음] ${py}</span><br>`+
            `<span class="meaning">[뜻] ${ko}</span></p>`;
  }
  outputEl.innerHTML = html;
  addHistory(inputEl.value.trim(), html);
}

document.getElementById('convertBtn').onclick = process;
document.getElementById('copyBtn').onclick = () => {
  const txt = outputEl.innerText;
  navigator.clipboard.writeText(txt);
  alert('결과를 클립보드에 복사했습니다.');
};
