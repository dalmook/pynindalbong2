// 전역 pinyin 함수 사용 (UMD via unpkg)
const { pinyin } = window.pinyinPro;

const inputEl = document.getElementById('inputText');
const outputEl = document.getElementById('output');
const historyEl = document.getElementById('historyList');
const convertBtn = document.getElementById('convertBtn');
const copyBtn = document.getElementById('copyBtn');
let history = [];

// 번역: Google Translate 비공식 gtx API 사용 (무료, 키 불필요)
// 번역: Google Translate 비공식 gtx API + 사전 데이터 활용
async function translate(text) {
  // dt=t: 문장 번역, dt=bd: 사전(entry) 지원
  const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh&tl=ko&dt=t&dt=bd&q='
    + encodeURIComponent(text);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('번역 API 요청 실패: ' + res.status);
  }
  const data = await res.json();
  // data 구조: [ [ [ 번역문, 원문, ... ], ... ], null, '원어코드', null, null, [ [ ['사전 번역1', ...], ... ], ... ] ]
  let translation = '';
  // 사전 번역이 있으면 우선 사용
  if (data[1] && data[1].length > 0) {
    // 사전 데이터는 data[1][0][0][0]
    translation = data[1][0][0][0];
  }
  // 사전 번역 없거나 빈 문자열이면 일반 번역 사용
  if (!translation && data[0] && data[0][0] && data[0][0][0]) {
    translation = data[0][0][0];
  }
  return translation;
}
  const data = await res.json();
  // JSON 구조: [[["번역결과",원문, ...],...],...]
  return data[0][0][0] || '';
}

// 히스토리 추가 함수
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

// 변환 처리 함수
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
    let ko = '';
    try {
      ko = await translate(orig);
    } catch (e) {
      ko = '번역 오류';
      console.error(e);
    }
    html += `<p>${orig}<br>` +
            `<span class="pinyin">[병음] ${py}</span><br>` +
            `<span class="meaning">[뜻] ${ko}</span></p>`;
  }
  outputEl.innerHTML = html;
  addHistory(raw, html);
}

// 이벤트 바인딩
convertBtn.addEventListener('click', processText);
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(outputEl.innerText);
  alert('결과를 클립보드에 복사했습니다.');
});
