from korean_utils import korean_to_keys, HANGUL_START, HANGUL_END, JUNG_KEYS

# JUNG_KEYS에서 자동 도출: 모음 키 문자 집합 및 허용된 3연속 모음 패턴
VOWEL_CHARS     = frozenset(c for keys in JUNG_KEYS for c in keys)
VALID_3VOWEL    = frozenset(keys for keys in JUNG_KEYS if len(keys) == 3)  # {'hkl','njl'}

# 자모 표시용 (CHO_KEYS/JUNG_KEYS/JONG_KEYS와 인덱스·글자수 1:1 대응)
CHO_JAMO = [
    'ㄱ', 'ㄱㄱ', 'ㄴ', 'ㄷ', 'ㄷㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅂㅂ',
    'ㅅ', 'ㅅㅅ', 'ㅇ', 'ㅈ', 'ㅈㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
]
JUNG_JAMO = [
    'ㅏ', 'ㅏㅣ', 'ㅑ', 'ㅑㅣ', 'ㅓ', 'ㅓㅣ', 'ㅕ', 'ㅕㅣ', 'ㅗ', 'ㅗㅏ', 'ㅗㅏㅣ', 'ㅗㅣ', 'ㅛ',
    'ㅜ', 'ㅜㅓ', 'ㅜㅓㅣ', 'ㅜㅣ', 'ㅠ', 'ㅡ', 'ㅡㅣ', 'ㅣ'
]
JONG_JAMO = [
    '', 'ㄱ', 'ㄱㄱ', 'ㄱㅅ', 'ㄴ', 'ㄴㅈ', 'ㄴㅎ', 'ㄷ', 'ㄹ', 'ㄹㄱ', 'ㄹㅁ', 'ㄹㅂ', 'ㄹㅅ',
    'ㄹㅌ', 'ㄹㅍ', 'ㄹㅎ', 'ㅁ', 'ㅂ', 'ㅂㅅ', 'ㅅ', 'ㅅㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
]

ANSI = {
    'green':  '\033[42m\033[30m',   # 초록 배경
    'yellow': '\033[43m\033[30m',   # 노랑 배경
    'red':    '\033[41m\033[37m',   # 빨강 배경
    'reset':  '\033[0m',
}


JAMO_RANGE = range(0x3131, 0x3164)  # 독립 자모: ㄱ(3131) ~ ㅣ(3163)

def validate_guess(guess: str) -> str:
    """
    입력 유효성 검사. 오류 메시지 반환, 유효하면 빈 문자열.
    조건:
      0) 독립 자모(낱자) 포함 불가
      1) 자모 5개 여부
      2) 모음으로 시작 불가
      3) 자음 3개 이상 연속 불가
      4) 모음 3개 이상 연속 불가 (단, ㅙ→hkl / ㅞ→njl 예외 허용)
    """
    for ch in guess:
        if ord(ch) in JAMO_RANGE:
            return f"낱자 '{ch}' 포함 불가 (완성된 음절만 입력)"

    keys = korean_to_keys(guess)

    if len(keys) != 5:
        return f"자모 {len(keys)}개 (5개 필요)"

    if keys[0] in VOWEL_CHARS:
        return "모음으로 시작할 수 없습니다"

    i = 0
    while i < len(keys):
        is_vowel = keys[i] in VOWEL_CHARS
        j = i + 1
        while j < len(keys) and (keys[j] in VOWEL_CHARS) == is_vowel:
            j += 1
        run, run_len = keys[i:j], j - i

        if is_vowel and run_len >= 3:
            if run_len == 3 and run in VALID_3VOWEL:
                pass  # ㅙ(hkl) 또는 ㅞ(njl) — 허용
            else:
                return f"모음 {run_len}개 연속 불가 ('{run}')"
        elif not is_vowel and run_len >= 3:
            return f"자음 {run_len}개 연속 불가 ('{run}')"

        i = j

    return ''


def decompose_jamo(text: str) -> list[str]:
    """한글 텍스트를 개별 자모 리스트로 분해."""
    result = []
    for char in text:
        code = ord(char)
        if HANGUL_START <= code <= HANGUL_END:
            offset   = code - HANGUL_START
            cho_idx  = offset // (21 * 28)
            jung_idx = (offset % (21 * 28)) // 28
            jong_idx = offset % 28
            result.extend(list(CHO_JAMO[cho_idx]))
            result.extend(list(JUNG_JAMO[jung_idx]))
            result.extend(list(JONG_JAMO[jong_idx]))
        else:
            result.append(char)
    return result


def judge(answer: str, guess: str) -> list[tuple[str, str]]:
    """
    정답과 추측을 비교해 [(자모, 색상), ...] 5개 반환.
    색상: 'green' | 'yellow' | 'red'
    """
    a_keys = korean_to_keys(answer)
    g_keys = korean_to_keys(guess)
    g_jamo = decompose_jamo(guess)

    if len(a_keys) != 5:
        raise ValueError(f"'{answer}' 자모 {len(a_keys)}개 (5개 필요)")
    if len(g_keys) != 5:
        raise ValueError(f"'{guess}' 자모 {len(g_keys)}개 (5개 필요)")

    colors      = ['red'] * 5
    a_remaining = list(a_keys)

    # 1차: 위치·자모 모두 일치 → green
    for i in range(5):
        if g_keys[i] == a_keys[i]:
            colors[i]      = 'green'
            a_remaining[i] = None

    # 2차: 자모 존재하지만 위치 불일치 → yellow
    for i in range(5):
        if colors[i] == 'green':
            continue
        if g_keys[i] in a_remaining:
            colors[i] = 'yellow'
            a_remaining[a_remaining.index(g_keys[i])] = None

    return list(zip(g_jamo, colors))


def display_row(judgement: list[tuple[str, str]]) -> None:
    row = '  '.join(
        f"{ANSI[color]} {jamo} {ANSI['reset']}"
        for jamo, color in judgement
    )
    print(f"  {row}")


def play(answer: str) -> None:
    MAX = 5
    print('\n=== 한글 단어 맞추기 (자모 5개) ===\n')

    for attempt in range(1, MAX + 1):
        while True:
            guess = input(f"[{attempt}/{MAX}] 입력: ").strip()
            if not guess:
                continue
            err = validate_guess(guess)
            if err:
                print(f"  오류: {err}")
                continue
            result = judge(answer, guess)
            break

        display_row(result)
        print()

        if all(color == 'green' for _, color in result):
            print(f"정답! {attempt}번 만에 맞췄습니다!")
            return

    print(f"실패! 정답은 '{answer}'였습니다.")


if __name__ == '__main__':
    import getpass

    answer = getpass.getpass('출제자 입력 (화면에 표시 안 됨): ').strip()
    import subprocess
    subprocess.run('cls', shell=True)  # 입력한 단어 흔적 지우기

    from korean_utils import korean_to_keys
    try:
        keys = korean_to_keys(answer)
        if len(keys) != 5:
            print(f"오류: '{answer}' 자모 {len(keys)}개 (5개 필요)")
        else:
            play(answer)
    except Exception as e:
        print(f"오류: {e}")
