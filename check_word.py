from game import validate_guess, korean_to_keys

words = input("검증할 단어들 (쉼표로 구분): ").split(",")
for w in words:
    w = w.strip()
    if not w:
        continue
    err = validate_guess(w)
    keys = korean_to_keys(w)
    status = f"✓ 유효  ({keys})" if not err else f"✗ 오류  {err}"
    print(f"  {w:6s}  {status}")
