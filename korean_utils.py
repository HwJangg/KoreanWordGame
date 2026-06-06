"""
Korean Jamo utilities for the Korean Word Guessing Game.

Converts Korean syllables to their dubeolsik (두벌식) keyboard representation.

Examples:
    만두 -> aksen
    꿩   -> Rnjd
    라면 -> fkaus
"""

# Initial consonants (초성) - 19개
# ㄱ  ㄲ  ㄴ  ㄷ  ㄸ  ㄹ  ㅁ  ㅂ  ㅃ  ㅅ  ㅆ  ㅇ  ㅈ  ㅉ  ㅊ  ㅋ  ㅌ  ㅍ  ㅎ
CHO_KEYS = [
    'r', 'rr', 's', 'e', 'ee', 'f', 'a', 'q', 'qq',
    't', 'tt', 'd', 'w', 'ww', 'c', 'z', 'x', 'v', 'g'
]
# 쌍자음: ㄲ→rr, ㄸ→ee, ㅃ→qq, ㅆ→tt, ㅉ→ww

# Middle vowels (중성) - 21개
# ㅏ   ㅐ   ㅑ   ㅒ   ㅓ   ㅔ   ㅕ   ㅖ   ㅗ   ㅘ    ㅙ    ㅚ    ㅛ   ㅜ   ㅝ    ㅞ    ㅟ    ㅠ   ㅡ   ㅢ    ㅣ
JUNG_KEYS = [
    'k',   'kl',  'i',  'il',  'j',  'jl',  'u',  'ul',  'h',  'hk', 'hkl', 'hl', 'y',
    'n',   'nj',  'njl','nl',  'b',  'm',   'ml', 'l'
]
# ㅐ(1)=ㅏ+ㅣ→kl, ㅒ(3)=ㅑ+ㅣ→il, ㅔ(5)=ㅓ+ㅣ→jl, ㅖ(7)=ㅕ+ㅣ→ul
# ㅙ(10)=ㅗ+ㅏ+ㅣ→hkl, ㅞ(15)=ㅜ+ㅓ+ㅣ→njl

# Final consonants (종성) - 28개 (0번 = 받침 없음)
# ''  ㄱ   ㄲ   ㄳ    ㄴ   ㄵ    ㄶ    ㄷ   ㄹ   ㄺ    ㄻ    ㄼ    ㄽ    ㄾ    ㄿ    ㅀ    ㅁ   ㅂ   ㅄ    ㅅ   ㅆ   ㅇ   ㅈ   ㅊ   ㅋ   ㅌ   ㅍ   ㅎ
JONG_KEYS = [
    '',   'r',  'rr', 'rt', 's',  'sw', 'sg', 'e',  'f',  'fr', 'fa', 'fq', 'ft',
    'fx', 'fv', 'fg', 'a',  'q',  'qt', 't',  'tt', 'd',  'w',  'c',  'z',  'x',  'v',  'g'
]
# 쌍받침: ㄲ→rr, ㅆ→tt

HANGUL_START = 0xAC00
HANGUL_END   = 0xD7A3


def korean_to_keys(text: str) -> str:
    """
    Convert Korean text to dubeolsik (두벌식) keyboard characters.

    Args:
        text: Korean string (e.g. '만두')

    Returns:
        Dubeolsik key string (e.g. 'aksen')
    """
    result = []
    for char in text:
        code = ord(char)
        if HANGUL_START <= code <= HANGUL_END:
            offset   = code - HANGUL_START
            cho_idx  = offset // (21 * 28)
            jung_idx = (offset % (21 * 28)) // 28
            jong_idx = offset % 28
            result.append(CHO_KEYS[cho_idx])
            result.append(JUNG_KEYS[jung_idx])
            result.append(JONG_KEYS[jong_idx])
        else:
            result.append(char)
    return ''.join(result)


if __name__ == '__main__':
    tests = [
        ('만두', 'aksen'),   # ㅁ+ㅏ+ㄴ / ㄷ+ㅜ
        ('꿩',   'Rnjd'),    # ㄲ+ㅝ(nj)+ㅇ
        ('라면', 'fkaus'),   # ㄹ+ㅏ / ㅁ+ㅕ+ㄴ
        ('대추', 'eklcn'),   # ㄷ+ㅐ(kl) / ㅊ+ㅜ
        ('없다', 'djqtek'),  # ㅇ+ㅓ+ㅄ(qt) / ㄷ+ㅏ
    ]
    for word, expected in tests:
        result = korean_to_keys(word)
        status = 'OK' if result == expected else 'FAIL'
        print(f'{word} -> {result}  (expected: {expected})  [{status}]')
