// ── 상수 ──────────────────────────────────────────────────────────────────────

const MAX = 5;

// 자모 표시 문자 (CHO/JUNG/JONG_KEYS와 인덱스·글자수 1:1 대응)
const CHO_JAMO = [
    'ㄱ','ㄱㄱ','ㄴ','ㄷ','ㄷㄷ','ㄹ','ㅁ','ㅂ','ㅂㅂ',
    'ㅅ','ㅅㅅ','ㅇ','ㅈ','ㅈㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'
];
const JUNG_JAMO = [
    'ㅏ','ㅏㅣ','ㅑ','ㅑㅣ','ㅓ','ㅓㅣ','ㅕ','ㅕㅣ','ㅗ','ㅗㅏ','ㅗㅏㅣ','ㅗㅣ','ㅛ',
    'ㅜ','ㅜㅓ','ㅜㅓㅣ','ㅜㅣ','ㅠ','ㅡ','ㅡㅣ','ㅣ'
];
const JONG_JAMO = [
    '','ㄱ','ㄱㄱ','ㄱㅅ','ㄴ','ㄴㅈ','ㄴㅎ','ㄷ','ㄹ','ㄹㄱ','ㄹㅁ','ㄹㅂ','ㄹㅅ',
    'ㄹㅌ','ㄹㅍ','ㄹㅎ','ㅁ','ㅂ','ㅂㅅ','ㅅ','ㅅㅅ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'
];

// JUNG_KEYS에서 자동 도출
const VOWEL_CHARS  = new Set(JUNG_KEYS.join('').split(''));
const VALID_3VOWEL = new Set(JUNG_KEYS.filter(k => k.length === 3));
const JAMO_START   = 0x3131;
const JAMO_END     = 0x3163;

// 두벌식 키보드 배열 (쌍자음·겹모음 제외)
const DUBEOLSIK = {
    q:'ㅂ',w:'ㅈ',e:'ㄷ',r:'ㄱ',t:'ㅅ',y:'ㅛ',u:'ㅕ',i:'ㅑ',
    a:'ㅁ',s:'ㄴ',d:'ㅇ',f:'ㄹ',g:'ㅎ',h:'ㅗ',j:'ㅓ',k:'ㅏ',l:'ㅣ',
    z:'ㅋ',x:'ㅌ',c:'ㅊ',v:'ㅍ',b:'ㅠ',n:'ㅜ',m:'ㅡ'
};

const KEYBOARD_ROWS = [
    ['ㅂ','ㅈ','ㄷ','ㄱ','ㅅ','ㅛ','ㅕ','ㅑ','←'],
    ['ㅁ','ㄴ','ㅇ','ㄹ','ㅎ','ㅗ','ㅓ','ㅏ','ㅣ'],
    ['ㅋ','ㅌ','ㅊ','ㅍ','ㅠ','ㅜ','ㅡ'],
];

// ── IME 상수 ──────────────────────────────────────────────────────────────────

const CHO_IDX  = {ㄱ:0,ㄲ:1,ㄴ:2,ㄷ:3,ㄸ:4,ㄹ:5,ㅁ:6,ㅂ:7,ㅃ:8,ㅅ:9,ㅆ:10,ㅇ:11,ㅈ:12,ㅉ:13,ㅊ:14,ㅋ:15,ㅌ:16,ㅍ:17,ㅎ:18};
const JUNG_IDX = {ㅏ:0,ㅐ:1,ㅑ:2,ㅒ:3,ㅓ:4,ㅔ:5,ㅕ:6,ㅖ:7,ㅗ:8,ㅘ:9,ㅙ:10,ㅚ:11,ㅛ:12,ㅜ:13,ㅝ:14,ㅞ:15,ㅟ:16,ㅠ:17,ㅡ:18,ㅢ:19,ㅣ:20};
const JONG_IDX = {ㄱ:1,ㄲ:2,ㄴ:4,ㄷ:7,ㄹ:8,ㅁ:16,ㅂ:17,ㅅ:19,ㅆ:20,ㅇ:21,ㅈ:22,ㅊ:23,ㅋ:24,ㅌ:25,ㅍ:26,ㅎ:27};
const JONG_TO_CHO = {1:0,2:1,4:2,7:3,8:5,16:6,17:7,19:9,20:10,21:11,22:12,23:14,24:15,25:16,26:17,27:18};
const CJONG = {'1,19':3,'4,22':5,'4,27':6,'8,1':9,'8,16':10,'8,17':11,'8,19':12,'8,25':13,'8,26':14,'8,27':15,'17,19':18};
const SJONG = {3:[1,19],5:[4,22],6:[4,27],9:[8,1],10:[8,16],11:[8,17],12:[8,19],13:[8,25],14:[8,26],15:[8,27],18:[17,19]};
const CJUNG = {
    '0,ㅣ':1,'2,ㅣ':3,'4,ㅣ':5,'6,ㅣ':7,
    '8,ㅏ':9,'8,ㅐ':10,'8,ㅣ':11,
    '13,ㅓ':14,'13,ㅔ':15,'13,ㅣ':16,'18,ㅣ':19
};
const SJUNG = {1:0,3:2,5:4,7:6,9:8,10:8,11:8,14:13,15:13,16:13,19:18};
const CHO_CHARS = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const CCHO = {'0,0':1,'3,3':4,'7,7':8,'9,9':10,'12,12':13};
const SCHO = {1:0,4:3,8:7,10:9,13:12};

// ── 상태 ──────────────────────────────────────────────────────────────────────

let answer, attempt, gameOver;
let jamoState = {};
let ime = { done: '', cho: -1, jung: -1, jong: 0 };
let wordSet = null;

// DOM 캐시
let $submitBtn, $restartBtn, $keyboard, $cells = [];

// ── 핵심 함수 ─────────────────────────────────────────────────────────────────

function decomposeJamo(text) {
    const out = [];
    for (const char of text) {
        const code = char.codePointAt(0);
        if (code >= HANGUL_START && code <= HANGUL_END) {
            const offset  = code - HANGUL_START;
            const choIdx  = Math.floor(offset / (21 * 28));
            const jungIdx = Math.floor((offset % (21 * 28)) / 28);
            const jongIdx = offset % 28;
            out.push(...CHO_JAMO[choIdx].split(''));
            out.push(...JUNG_JAMO[jungIdx].split(''));
            out.push(...JONG_JAMO[jongIdx].split(''));
        } else {
            out.push(char);
        }
    }
    return out;
}

function validateGuess(guess) {
    for (const ch of guess) {
        const code = ch.codePointAt(0);
        if (code >= JAMO_START && code <= JAMO_END)
            return `낱자 '${ch}' 포함 불가 (완성된 음절만 입력)`;
    }

    const dubeolKeys = koreanToKeys(guess);

    if (dubeolKeys.length !== 5)
        return `자모 ${dubeolKeys.length}개 (5개 필요)`;

    if (wordSet && !wordSet.has(guess))
        return '사전에 없는 단어입니다';

    if (VOWEL_CHARS.has(dubeolKeys[0]))
        return '모음으로 시작할 수 없습니다';

    let i = 0;
    while (i < dubeolKeys.length) {
        const isV = VOWEL_CHARS.has(dubeolKeys[i]);
        let j = i + 1;
        while (j < dubeolKeys.length && VOWEL_CHARS.has(dubeolKeys[j]) === isV) j++;
        const run = dubeolKeys.slice(i, j);
        const len = j - i;
        if (isV && len >= 3 && !(len === 3 && VALID_3VOWEL.has(run)))
            return `모음 ${len}개 연속 불가`;
        if (!isV && len >= 3)
            return `자음 ${len}개 연속 불가`;
        i = j;
    }
    return '';
}

// 정답·입력 모두 koreanToKeys로 변환한 뒤 키 문자 단위로 비교
function judge(ans, guess) {
    const aKeys    = koreanToKeys(ans);
    const gKeys    = koreanToKeys(guess);
    const gJamo    = decomposeJamo(guess);
    const n        = gKeys.length;
    const colors   = Array(n).fill('gray');
    const remaining = [...aKeys]; // 변경 가능한 배열로 spread

    for (let i = 0; i < n; i++) {
        if (gKeys[i] === aKeys[i]) { colors[i] = 'green'; remaining[i] = null; }
    }
    for (let i = 0; i < n; i++) {
        if (colors[i] === 'green') continue;
        const idx = remaining.indexOf(gKeys[i]);
        if (idx !== -1) { colors[i] = 'yellow'; remaining[idx] = null; }
    }
    return gJamo.map((jamo, i) => ({ jamo, color: colors[i] }));
}

// ── IME ───────────────────────────────────────────────────────────────────────

function makeSyl(cho, jung, jong) {
    return String.fromCharCode(0xAC00 + (cho * 21 + jung) * 28 + jong);
}

function imeDisplay() {
    const { done, cho, jung, jong } = ime;
    if (cho < 0) return done;
    if (jung < 0) return done + CHO_CHARS[cho];
    return done + makeSyl(cho, jung, jong);
}

// UI 업데이트 없이 IME 상태만 한 단계 되돌림 (imeInput 내부 루프용)
function _imeBackstep() {
    const s = ime;
    if (s.jong > 0) {
        const split = SJONG[s.jong];
        s.jong = split ? split[0] : 0;
    } else if (s.jung >= 0) {
        const prev = SJUNG[s.jung];
        s.jung = prev !== undefined ? prev : -1;
    } else if (s.cho >= 0) {
        const prev = SCHO[s.cho];
        s.cho = prev !== undefined ? prev : -1;
    } else if (s.done.length > 0) {
        const last = s.done[s.done.length - 1];
        s.done = s.done.slice(0, -1);
        const code = last.codePointAt(0);
        if (code >= 0xAC00 && code <= 0xD7A3) {
            const off = code - 0xAC00;
            s.cho  = Math.floor(off / (21 * 28));
            s.jung = Math.floor((off % (21 * 28)) / 28);
            s.jong = off % 28;
        }
    }
}

function imeBackspace() {
    _imeBackstep();
    updateCurrentRow();
}

function imeReset() {
    ime = { done: '', cho: -1, jung: -1, jong: 0 };
}

function imeJamo() {
    const out = decomposeJamo(ime.done);
    const { cho, jung, jong } = ime;
    if (cho >= 0) {
        out.push(...CHO_JAMO[cho].split(''));
        if (jung >= 0) {
            out.push(...JUNG_JAMO[jung].split(''));
            if (jong > 0) out.push(...JONG_JAMO[jong].split(''));
        }
    }
    return out;
}

function imeInput(jamo) {
    if (imeJamo().length >= 5) return;
    const s = ime;
    if (jamo in JUNG_IDX) {
        const vc = JUNG_IDX[jamo];
        if (s.cho < 0) {
            return; // 자음 없이 모음 입력 무시
        } else if (s.jung < 0) {
            s.jung = vc;
        } else if (s.jong === 0) {
            const comp = CJUNG[s.jung + ',' + jamo];
            if (comp !== undefined) {
                s.jung = comp;
            } else {
                return; // 완성 음절 뒤 단독 모음 무시 (ㅇ 자동 삽입 방지)
            }
        } else {
            const split = SJONG[s.jong];
            if (split) {
                s.done += makeSyl(s.cho, s.jung, split[0]);
                s.cho = JONG_TO_CHO[split[1]];
            } else {
                s.done += makeSyl(s.cho, s.jung, 0);
                s.cho = JONG_TO_CHO[s.jong];
            }
            s.jung = vc; s.jong = 0;
        }
    } else {
        const cc = CHO_IDX[jamo];
        const jc = JONG_IDX[jamo] || 0;
        if (s.cho < 0) {
            s.cho = cc;
        } else if (s.jung < 0) {
            const compCho = CCHO[`${s.cho},${cc}`];
            if (compCho !== undefined) { s.cho = compCho; }
            else { s.done += CHO_CHARS[s.cho]; s.cho = cc; s.jong = 0; }
        } else if (s.jong === 0) {
            if (jc > 0) s.jong = jc;
            else { s.done += makeSyl(s.cho, s.jung, 0); s.cho = cc; s.jung = -1; s.jong = 0; }
        } else {
            const comp = CJONG[s.jong + ',' + jc];
            if (comp) {
                s.jong = comp;
            } else {
                s.done += makeSyl(s.cho, s.jung, s.jong);
                s.cho = cc; s.jung = -1; s.jong = 0;
            }
        }
    }
    while (imeJamo().length > 5) _imeBackstep(); // UI 업데이트 없이 상태만 트림
    updateCurrentRow();
}

// ── UI ────────────────────────────────────────────────────────────────────────

function cacheCells() {
    $cells = Array.from({length: 5}, (_, c) => document.getElementById(`c${attempt}${c}`));
}

function updateCurrentRow() {
    if (!$cells[0]) return; // attempt가 보드 범위 밖이면 무시
    const jamo = imeJamo();
    for (let c = 0; c < 5; c++) {
        $cells[c].textContent = jamo[c] || '';
        $cells[c].className   = jamo[c] ? 'cell preview' : 'cell';
    }
    const full = jamo.length >= 5;
    $keyboard.classList.toggle('kb-full', full);
    $submitBtn.disabled = !full;
}

function buildBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    for (let r = 0; r < MAX; r++) {
        const row = document.createElement('div');
        row.className = 'row';
        for (let c = 0; c < 5; c++) {
            const cell = document.createElement('div');
            cell.id        = `c${r}${c}`;
            cell.className = 'cell';
            row.appendChild(cell);
        }
        board.appendChild(row);
    }
}

function reveal(row, result) {
    result.forEach(({ jamo, color }, col) => {
        setTimeout(() => {
            const cell = document.getElementById(`c${row}${col}`);
            cell.textContent = jamo;
            cell.className = 'cell filled ' + color;
        }, col * 130);
    });
}

function setMsg(text, type = '') {
    const el = document.getElementById('message');
    el.textContent = text;
    el.className   = type;
}

function endGame(msg, type) {
    gameOver = true;
    setMsg(msg, type);
    $submitBtn.style.display = 'none';
    $restartBtn.style.display = '';
    const makeBtn = document.getElementById('make-btn');
    if (makeBtn) {
        makeBtn.style.display = 'block';
        makeBtn.style.border = 'none';
        makeBtn.style.color = '#fff';
        makeBtn.style.background = '#3a3a3c';
        makeBtn.style.transition = 'filter 0.15s';
        makeBtn.onmouseenter = () => makeBtn.style.filter = 'brightness(1.4)';
        makeBtn.onmouseleave = () => makeBtn.style.filter = '';
    }
}

function getShareWord() {
    const w = new URLSearchParams(location.search).get('w');
    if (!w) return null;
    try {
        const b64 = w.replace(/-/g, '+').replace(/_/g, '/');
        const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0) ^ 42);
        const word = new TextDecoder().decode(bytes);
        if (![...word].every(ch => { const c = ch.codePointAt(0); return c >= 0xAC00 && c <= 0xD7A3; }))
            return null;
        return word;
    } catch { return null; }
}

function buildKeyboard() {
    $keyboard.innerHTML = '';
    const maxKeys = Math.max(...KEYBOARD_ROWS.map(r => r.length));
    for (const row of KEYBOARD_ROWS) {
        const rowEl = document.createElement('div');
        rowEl.className = 'kb-row';
        const pad = maxKeys - row.length;
        const padL = Math.floor(pad / 2), padR = Math.ceil(pad / 2);
        for (let i = 0; i < padL; i++) {
            const sp = document.createElement('div');
            sp.className = 'kb-key kb-spacer';
            rowEl.appendChild(sp);
        }
        for (const jamo of row) {
            const key = document.createElement('div');
            if (jamo === '←') {
                key.className = 'kb-key kb-back';
                key.textContent = '⌫';
                let bsRepeat = null;
                key.addEventListener('pointerdown', e => {
                    e.preventDefault();
                    if (gameOver) return;
                    imeBackspace();
                    bsRepeat = setTimeout(function repeat() {
                        if (gameOver) return;
                        imeBackspace();
                        bsRepeat = setTimeout(repeat, 75);
                    }, 400);
                });
                const stopBs = () => { clearTimeout(bsRepeat); bsRepeat = null; };
                key.addEventListener('pointerup', stopBs);
                key.addEventListener('pointercancel', stopBs);
                key.addEventListener('pointerleave', stopBs);
            } else {
                key.id = 'key-' + jamo.codePointAt(0);
                key.className = 'kb-key';
                key.textContent = jamo;
                let lastPress = 0;
                let acceptTimer = null;
                key.addEventListener('pointerdown', e => {
                    e.preventDefault();
                    const now = performance.now();
                    if (now - lastPress < 180) return;
                    lastPress = now;
                    acceptTimer = setTimeout(() => {
                        if (!gameOver) imeInput(jamo);
                    }, 50);
                });
                const cancelAccept = () => { clearTimeout(acceptTimer); acceptTimer = null; };
                key.addEventListener('pointerup', cancelAccept);
                key.addEventListener('pointercancel', cancelAccept);
                key.addEventListener('pointerleave', cancelAccept);
            }
            rowEl.appendChild(key);
        }
        for (let i = 0; i < padR; i++) {
            const sp = document.createElement('div');
            sp.className = 'kb-key kb-spacer';
            rowEl.appendChild(sp);
        }
        $keyboard.appendChild(rowEl);
    }
}

function updateKeyboard(result) {
    const priority = { green: 3, yellow: 2, gray: 1 };
    for (const { jamo, color } of result) {
        const cur = jamoState[jamo];
        if (!cur || (priority[color] || 0) > (priority[cur] || 0)) {
            jamoState[jamo] = color;
            const el = document.getElementById('key-' + jamo.codePointAt(0));
            if (el) el.className = 'kb-key ' + color;
        }
    }
}

function submit() {
    if (gameOver) return;
    const guess = imeDisplay().trim();
    if (!guess) return;

    const err = validateGuess(guess);
    if (err) { setMsg(err, 'error'); return; }

    imeReset();
    updateCurrentRow();
    setMsg('');

    const result = judge(answer, guess);
    reveal(attempt, result);
    updateKeyboard(result);
    attempt++;
    cacheCells(); // 다음 행으로 캐시 갱신

    const won = result.every(r => r.color === 'green');
    setTimeout(() => {
        if (won) {
            endGame(`정답! ${attempt}번 만에 맞췄습니다!`, 'success');
        } else if (attempt >= MAX) {
            endGame(`정답은 '${answer}'입니다!`, 'error');
        }
    }, 4 * 130 + 400);
}

function init() {
    attempt  = 0;
    gameOver = false;
    jamoState = {};

    $submitBtn  = document.getElementById('submit-btn');
    $restartBtn = document.getElementById('restart-btn');
    $keyboard   = document.getElementById('keyboard');

    $restartBtn.style.display = 'none';
    $restartBtn.onclick = init;
    $submitBtn.style.display = '';
    $submitBtn.disabled = true;
    const makeBtn = document.getElementById('make-btn');
    if (makeBtn) makeBtn.style.display = 'none';

    buildBoard();
    buildKeyboard();
    cacheCells();
    imeReset();
    setMsg('');
    updateCurrentRow();

    // 사전 로드 (비동기, 추측 제출 전까지만 완료되면 됨)
    fetch('dict.json', { cache: 'force-cache' })
        .then(r => r.json())
        .then(data => { wordSet = new Set(data); });

    const shareWord = getShareWord();
    const hasShareParam = !!new URLSearchParams(location.search).get('w');

    function showInvalidLink() {
        setMsg('잘못된 공유 링크입니다', 'error');
        const wu = document.getElementById('words-updated');
        if (wu) wu.textContent = '';
        document.getElementById('board').style.display = 'none';
        $keyboard.style.display = 'none';
        $submitBtn.style.display = 'none';
        const makeBtn = document.getElementById('make-btn');
        if (makeBtn) {
            makeBtn.textContent = '공유링크 만들기 ▶';
            makeBtn.style.display = 'block';
            makeBtn.style.background = '#3a3a3c';
            makeBtn.style.color = '#fff';
            makeBtn.style.border = 'none';
            makeBtn.style.transition = 'filter 0.15s';
            makeBtn.onmouseenter = () => makeBtn.style.filter = 'brightness(1.4)';
            makeBtn.onmouseleave = () => makeBtn.style.filter = '';
        }
    }

    if (shareWord) {
        const ra = document.getElementById('recent-answer');
        const wu = document.getElementById('words-updated');
        if (ra) ra.textContent = '';
        if (wu) wu.textContent = '공유 게임';
        // 사전 로드 후 공유 단어 검증
        fetch('dict.json', { cache: 'force-cache' })
            .then(r => r.json())
            .then(data => {
                if (!new Set(data).has(shareWord)) { showInvalidLink(); return; }
                answer = shareWord;
                $submitBtn.onclick  = submit;
                $submitBtn.disabled = false;
            });
    } else if (hasShareParam) {
        showInvalidLink();
    } else {
        fetch('word.json?v=' + Date.now(), { cache: 'no-store' })
            .then(r => r.json())
            .then(data => {
                answer = data.word;
                $submitBtn.onclick   = submit;
                $submitBtn.disabled  = false;
                document.getElementById('recent-answer').textContent = '최근 정답: ' + data.last;
                document.getElementById('words-updated').textContent = '단어 업데이트: ' + data.updated;
            });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
document.addEventListener('keydown', e => {
    const tag = document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (gameOver) return;
    if (e.key === 'Enter') { submit(); return; }
    if (e.key === 'Backspace') { e.preventDefault(); imeBackspace(); return; }
    const jamo = DUBEOLSIK[e.key];
    if (jamo) { e.preventDefault(); imeInput(jamo); }
});
