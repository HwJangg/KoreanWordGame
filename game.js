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
const VALID_3VOWEL = new Set(JUNG_KEYS.filter(k => k.length === 3)); // {'hkl','njl'}
const JAMO_START   = 0x3131;
const JAMO_END     = 0x3163;

// 단어 목록 — 순서대로 하루씩 출제
const WORDS_UPDATED = '2026-06-07 02:05';
const WORDS = [
    '서울',
];

const MAX = 5;
let answer, answerKeys, attempt, gameOver;

// ── 핵심 함수 ──────────────────────────────────────────────────────────────

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

    const keys = koreanToKeys(guess);

    if (keys.length !== 5)
        return `자모 ${keys.length}개 (5개 필요)`;

    if (VOWEL_CHARS.has(keys[0]))
        return '모음으로 시작할 수 없습니다';

    let i = 0;
    while (i < keys.length) {
        const isV = VOWEL_CHARS.has(keys[i]);
        let j = i + 1;
        while (j < keys.length && VOWEL_CHARS.has(keys[j]) === isV) j++;
        const run = keys.slice(i, j);
        const len = j - i;
        if (isV && len >= 3 && !(len === 3 && VALID_3VOWEL.has(run)))
            return `모음 ${len}개 연속 불가`;
        if (!isV && len >= 3)
            return `자음 ${len}개 연속 불가`;
        i = j;
    }
    return '';
}

function judge(ans, guess) {
    const aKeys    = koreanToKeys(ans).split('');
    const gKeys    = koreanToKeys(guess).split('');
    const gJamo    = decomposeJamo(guess);
    const colors   = Array(5).fill('gray');
    const remaining = [...aKeys];

    // 1차: green
    for (let i = 0; i < 5; i++) {
        if (gKeys[i] === aKeys[i]) {
            colors[i]      = 'green';
            remaining[i]   = null;
        }
    }
    // 2차: yellow
    for (let i = 0; i < 5; i++) {
        if (colors[i] === 'green') continue;
        const idx = remaining.indexOf(gKeys[i]);
        if (idx !== -1) {
            colors[i]      = 'yellow';
            remaining[idx] = null;
        }
    }
    return gJamo.map((jamo, i) => ({ jamo, color: colors[i] }));
}

// ── 한글 IME ──────────────────────────────────────────────────────────────

const CHO_IDX  = {ㄱ:0,ㄲ:1,ㄴ:2,ㄷ:3,ㄸ:4,ㄹ:5,ㅁ:6,ㅂ:7,ㅃ:8,ㅅ:9,ㅆ:10,ㅇ:11,ㅈ:12,ㅉ:13,ㅊ:14,ㅋ:15,ㅌ:16,ㅍ:17,ㅎ:18};
const JUNG_IDX = {ㅏ:0,ㅐ:1,ㅑ:2,ㅒ:3,ㅓ:4,ㅔ:5,ㅕ:6,ㅖ:7,ㅗ:8,ㅘ:9,ㅙ:10,ㅚ:11,ㅛ:12,ㅜ:13,ㅝ:14,ㅞ:15,ㅟ:16,ㅠ:17,ㅡ:18,ㅢ:19,ㅣ:20};
const JONG_IDX = {ㄱ:1,ㄲ:2,ㄴ:4,ㄷ:7,ㄹ:8,ㅁ:16,ㅂ:17,ㅅ:19,ㅆ:20,ㅇ:21,ㅈ:22,ㅊ:23,ㅋ:24,ㅌ:25,ㅍ:26,ㅎ:27};
const JONG_TO_CHO = {1:0,2:1,4:2,7:3,8:5,16:6,17:7,19:9,20:10,21:11,22:12,23:14,24:15,25:16,26:17,27:18};
// 겹받침: jong1+jong2 → compound
const CJONG = {'1,19':3,'4,22':5,'4,27':6,'8,1':9,'8,16':10,'8,17':11,'8,19':12,'8,25':13,'8,26':14,'8,27':15,'17,19':18};
// 겹받침 분리: compound → [first, second]
const SJONG = {3:[1,19],5:[4,22],6:[4,27],9:[8,1],10:[8,16],11:[8,17],12:[8,19],13:[8,25],14:[8,26],15:[8,27],18:[17,19]};
// 겹모음: jung_idx+vowel → compound jung
const CJUNG = {
    '0,ㅣ':1,'2,ㅣ':3,'4,ㅣ':5,'6,ㅣ':7,           // ㅏㅣ→ㅐ, ㅑㅣ→ㅒ, ㅓㅣ→ㅔ, ㅕㅣ→ㅖ
    '8,ㅏ':9,'8,ㅐ':10,'8,ㅣ':11,                   // ㅗ겹모음
    '13,ㅓ':14,'13,ㅔ':15,'13,ㅣ':16,'18,ㅣ':19     // ㅜ겹모음, ㅡㅣ→ㅢ
};
// 겹모음 분리: compound jung → first jung
const SJUNG = {1:0,3:2,5:4,7:6,9:8,10:8,11:8,14:13,15:13,16:13,19:18};
const CHO_CHARS = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
// 쌍자음 합성: cho+same → double cho (ㄱ+ㄱ→ㄲ 등)
const CCHO = {'0,0':1,'3,3':4,'7,7':8,'9,9':10,'12,12':13};
// 쌍자음 분리: double → single
const SCHO = {1:0,4:3,8:7,10:9,13:12};

let ime = { done: '', cho: -1, jung: -1, jong: 0 };

function makeSyl(cho, jung, jong) {
    return String.fromCharCode(0xAC00 + (cho * 21 + jung) * 28 + jong);
}

function imeDisplay() {
    const { done, cho, jung, jong } = ime;
    if (cho < 0) return done;
    if (jung < 0) return done + CHO_CHARS[cho];
    return done + makeSyl(cho, jung, jong);
}

function imeInput(jamo) {
    if (imeJamo().length >= 5) return;
    const s = ime;
    if (jamo in JUNG_IDX) {
        // 모음
        const vc = JUNG_IDX[jamo];
        if (s.cho < 0) {
            s.cho = 11; s.jung = vc; // 묵음 ㅇ + 모음
        } else if (s.jung < 0) {
            s.jung = vc;
        } else if (s.jong === 0) {
            const comp = CJUNG[s.jung + ',' + jamo];
            if (comp !== undefined) {
                s.jung = comp; // 겹모음 합성
            } else {
                s.done += makeSyl(s.cho, s.jung, 0);
                s.cho = 11; s.jung = vc; s.jong = 0;
            }
        } else {
            // 받침이 있을 때 모음 → 받침을 다음 음절 초성으로
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
        // 자음
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
                s.jong = comp; // 겹받침 합성
            } else {
                s.done += makeSyl(s.cho, s.jung, s.jong);
                s.cho = cc; s.jung = -1; s.jong = 0;
            }
        }
    }
    updateCurrentRow();
}

function imeBackspace() {
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
            s.cho = Math.floor(off / (21 * 28));
            s.jung = Math.floor((off % (21 * 28)) / 28);
            s.jong = off % 28;
        }
    }
    updateCurrentRow();
}

function imeReset() {
    ime = { done: '', cho: -1, jung: -1, jong: 0 };
}

// 현재 IME 상태를 개별 자모 배열로 변환 (보드 미리보기용)
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

function updateCurrentRow() {
    const jamo = imeJamo();
    for (let c = 0; c < 5; c++) {
        const cell = document.getElementById(`c${attempt}${c}`);
        if (!cell) return;
        cell.textContent = jamo[c] || '';
        cell.className = jamo[c] ? 'cell preview' : 'cell';
    }
    const full = jamo.length >= 5;
    document.getElementById('keyboard').classList.toggle('kb-full', full);
    document.getElementById('submit-btn').disabled = !full;
}

// ── 키보드 ────────────────────────────────────────────────────────────────

const KEYBOARD_ROWS = [
    ['ㅂ','ㅈ','ㄷ','ㄱ','ㅅ','ㅛ','ㅕ','ㅑ','←'],
    ['ㅁ','ㄴ','ㅇ','ㄹ','ㅎ','ㅗ','ㅓ','ㅏ','ㅣ'],
    ['ㅋ','ㅌ','ㅊ','ㅍ','ㅠ','ㅜ','ㅡ'],
];

let jamoState = {};

function buildKeyboard() {
    const kb = document.getElementById('keyboard');
    kb.innerHTML = '';
    for (const row of KEYBOARD_ROWS) {
        const rowEl = document.createElement('div');
        rowEl.className = 'kb-row';
        for (const jamo of row) {
            const key = document.createElement('div');
            if (jamo === '←') {
                key.className = 'kb-key kb-back';
                key.textContent = '⌫';
                key.addEventListener('pointerdown', e => { e.preventDefault(); if (!gameOver) imeBackspace(); });
            } else {
                key.id = 'key-' + jamo.codePointAt(0);
                key.className = 'kb-key';
                key.textContent = jamo;
                let lastPress = 0;
                key.addEventListener('pointerdown', e => {
                    e.preventDefault();
                    const now = performance.now();
                    if (now - lastPress < 180) return;
                    lastPress = now;
                    if (!gameOver) imeInput(jamo);
                });
            }
            rowEl.appendChild(key);
        }
        kb.appendChild(rowEl);
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

// ── DOM ───────────────────────────────────────────────────────────────────

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

function submit() {
    if (gameOver) return;
    const guess = imeDisplay().trim();
    if (!guess) return;

    const err = validateGuess(guess);
    if (err) { setMsg(err, 'error'); return; }

    imeReset();
    updateCurrentRow(); // preview 클리어

    setMsg('');
    const result = judge(answer, guess);
    reveal(attempt, result);
    updateKeyboard(result);
    attempt++;

    const won = result.every(r => r.color === 'green');
    setTimeout(() => {
        if (won) {
            gameOver = true;
            setMsg(`정답! ${attempt}번 만에 맞췄습니다!`, 'success');
            document.getElementById('submit-btn').disabled = true;
        } else if (attempt >= MAX) {
            gameOver = true;
            setMsg(`실패! 정답은 '${answer}'였습니다.`, 'error');
            document.getElementById('submit-btn').disabled = true;
        }
    }, 4 * 130 + 400);
}

function init() {
    const day = Math.floor((Date.now() - new Date('2024-01-01').getTime()) / 86400000);
    answer    = WORDS[day % WORDS.length];
    answerKeys = koreanToKeys(answer);
    attempt   = 0;
    gameOver  = false;
    jamoState = {};

    buildBoard();
    buildKeyboard();
    imeReset();
    setMsg('');
    document.getElementById('submit-btn').disabled = false;
    document.getElementById('words-updated').textContent = '단어 업데이트: ' + WORDS_UPDATED;
    document.getElementById('submit-btn').onclick = submit;
}

const DUBEOLSIK = {
    q:'ㅂ',w:'ㅈ',e:'ㄷ',r:'ㄱ',t:'ㅅ',y:'ㅛ',u:'ㅕ',i:'ㅑ',
    a:'ㅁ',s:'ㄴ',d:'ㅇ',f:'ㄹ',g:'ㅎ',h:'ㅗ',j:'ㅓ',k:'ㅏ',l:'ㅣ',
    z:'ㅋ',x:'ㅌ',c:'ㅊ',v:'ㅍ',b:'ㅠ',n:'ㅜ',m:'ㅡ'
};

document.addEventListener('DOMContentLoaded', init);
document.addEventListener('keydown', e => {
    if (gameOver) return;
    if (e.key === 'Enter') { submit(); return; }
    if (e.key === 'Backspace') { e.preventDefault(); imeBackspace(); return; }
    const jamo = DUBEOLSIK[e.key];
    if (jamo) { e.preventDefault(); imeInput(jamo); }
});
