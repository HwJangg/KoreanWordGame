import requests
import json

CHO_LEN  = [1,2,1,1,2,1,1,1,2,1,2,1,1,2,1,1,1,1,1]
JUNG_LEN = [1,2,1,2,1,2,1,2,1,2,3,2,1,1,2,3,2,1,1,2,1]
JONG_LEN = [0,1,2,2,1,2,2,1,1,2,2,2,2,2,2,2,1,1,2,1,2,1,1,1,1,1,1,1]

def count_jamo(word):
    total = 0
    for ch in word:
        code = ord(ch)
        if 0xAC00 <= code <= 0xD7A3:
            off = code - 0xAC00
            total += CHO_LEN[off // (21 * 28)]
            total += JUNG_LEN[(off % (21 * 28)) // 28]
            total += JONG_LEN[off % 28]
        else:
            return -1  # 한글 음절 아닌 문자 포함 → 제외
    return total

HEADERS = {'User-Agent': 'KoreanWordGameDictBuilder/1.0 (scentofgrasse@gmail.com)'}

def fetch_category(category):
    url = 'https://ko.wiktionary.org/w/api.php'
    params = {
        'action': 'query',
        'list': 'categorymembers',
        'cmtitle': f'Category:{category}',
        'cmlimit': 500,
        'cmnamespace': 0,
        'format': 'json'
    }
    words = []
    page = 1
    while True:
        r = requests.get(url, params=params, timeout=10, headers=HEADERS).json()
        batch = [m['title'] for m in r['query']['categorymembers']]
        words.extend(batch)
        print(f'  [{category}] 페이지 {page}: {len(batch)}개 (누계 {len(words)}개)')
        if 'continue' not in r:
            break
        params['cmcontinue'] = r['continue']['cmcontinue']
        page += 1
    return words

categories = ['한국어 명사', '한국어 동사', '한국어 형용사', '한국어 부사']

all_words = set()
for cat in categories:
    print(f'\n{cat} 가져오는 중...')
    all_words.update(fetch_category(cat))

print(f'\n총 단어 수: {len(all_words)}')

filtered = sorted({
    w for w in all_words
    if len(w) in (1, 2) and count_jamo(w) == 5
})

print(f'1~2음절 + 자모 5개 필터 후: {len(filtered)}개')

with open('dict.json', 'w', encoding='utf-8') as f:
    json.dump(filtered, f, ensure_ascii=False)

print('dict.json 저장 완료')
