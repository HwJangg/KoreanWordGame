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
const WORDS_UPDATED = '2026-06-07 00:49';
const WORDS = [
    '봄비',
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

// ── 키보드 ────────────────────────────────────────────────────────────────

const KEYBOARD_ROWS = [
    ['ㅂ','ㅈ','ㄷ','ㄱ','ㅅ','ㅛ','ㅕ','ㅑ'],
    ['ㅁ','ㄴ','ㅇ','ㄹ','ㅎ','ㅗ','ㅓ','ㅏ','ㅣ'],
    ['ㅊ','ㅋ','ㅌ','ㅍ','ㅠ','ㅜ','ㅡ'],
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
            key.id = 'key-' + jamo.codePointAt(0);
            key.className = 'kb-key';
            key.textContent = jamo;
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
            cell.classList.add('filled', color);
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
    const input = document.getElementById('guess-input');
    const guess = input.value.trim();
    input.value = '';
    if (!guess) return;

    const err = validateGuess(guess);
    if (err) { setMsg(err, 'error'); return; }

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
    setMsg('');
    document.getElementById('submit-btn').disabled = false;
    document.getElementById('words-updated').textContent = '단어 업데이트: ' + WORDS_UPDATED;

    const input = document.getElementById('guess-input');
    input.focus();
    input.onkeydown = e => { if (e.key === 'Enter') submit(); };
    document.getElementById('submit-btn').onclick = submit;
}

document.addEventListener('DOMContentLoaded', init);
