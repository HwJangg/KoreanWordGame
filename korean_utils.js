const HANGUL_START = 0xAC00;
const HANGUL_END   = 0xD7A3;

// 초성 (19)
const CHO_KEYS = [
    'r','rr','s','e','ee','f','a','q','qq',
    't','tt','d','w','ww','c','z','x','v','g'
];
// 중성 (21) — 겹모음 분해 포함
const JUNG_KEYS = [
    'k','kl','i','il','j','jl','u','ul','h','hk','hkl','hl','y',
    'n','nj','njl','nl','b','m','ml','l'
];
// 종성 (28, 0=없음) — 겹받침/쌍자음 분해 포함
const JONG_KEYS = [
    '','r','rr','rt','s','sw','sg','e','f','fr','fa','fq','ft',
    'fx','fv','fg','a','q','qt','t','tt','d','w','c','z','x','v','g'
];

function koreanToKeys(text) {
    let result = '';
    for (const char of text) {
        const code = char.codePointAt(0);
        if (code >= HANGUL_START && code <= HANGUL_END) {
            const offset  = code - HANGUL_START;
            const choIdx  = Math.floor(offset / (21 * 28));
            const jungIdx = Math.floor((offset % (21 * 28)) / 28);
            const jongIdx = offset % 28;
            result += CHO_KEYS[choIdx] + JUNG_KEYS[jungIdx] + JONG_KEYS[jongIdx];
        } else {
            result += char;
        }
    }
    return result;
}
