import sys
import tkinter as tk
from tkinter import messagebox
import json
import subprocess
import os
from datetime import datetime, timedelta

if getattr(sys, 'frozen', False):
    _exe_dir = os.path.dirname(sys.executable)
    if os.path.exists(os.path.join(_exe_dir, 'word.json')):
        SCRIPT_DIR = _exe_dir
    else:
        SCRIPT_DIR = os.path.dirname(_exe_dir)
else:
    SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

WORD_JSON = os.path.join(SCRIPT_DIR, 'word.json')

# CHO/JUNG/JONG_JAMO — 자모 수 계산용
CHO_JAMO  = ['ㄱ','ㄱㄱ','ㄴ','ㄷ','ㄷㄷ','ㄹ','ㅁ','ㅂ','ㅂㅂ','ㅅ','ㅅㅅ','ㅇ','ㅈ','ㅈㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
JUNG_JAMO = ['ㅏ','ㅏㅣ','ㅑ','ㅑㅣ','ㅓ','ㅓㅣ','ㅕ','ㅕㅣ','ㅗ','ㅗㅏ','ㅗㅏㅣ','ㅗㅣ','ㅛ',
             'ㅜ','ㅜㅓ','ㅜㅓㅣ','ㅜㅣ','ㅠ','ㅡ','ㅡㅣ','ㅣ']
JONG_JAMO = ['','ㄱ','ㄱㄱ','ㄱㅅ','ㄴ','ㄴㅈ','ㄴㅎ','ㄷ','ㄹ','ㄹㄱ','ㄹㅁ','ㄹㅂ','ㄹㅅ',
             'ㄹㅌ','ㄹㅍ','ㄹㅎ','ㅁ','ㅂ','ㅂㅅ','ㅅ','ㅅㅅ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']

def count_jamo(text):
    n = 0
    for ch in text:
        code = ord(ch)
        if 0xAC00 <= code <= 0xD7A3:
            off = code - 0xAC00
            n += len(CHO_JAMO[off // (21 * 28)])
            n += len(JUNG_JAMO[(off % (21 * 28)) // 28])
            n += len(JONG_JAMO[off % 28])
        else:
            n += 1
    return n

def read_values():
    with open(WORD_JSON, encoding='utf-8') as f:
        d = json.load(f)
    return d.get('word', ''), d.get('last', ''), d.get('updated', '')

def write_word_json(new_word, last_answer, upd_time):
    with open(WORD_JSON, encoding='utf-8') as f:
        d = json.load(f)
    d['word']    = new_word
    d['last']    = last_answer
    d['updated'] = upd_time
    with open(WORD_JSON, 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False, indent=2)
        f.write('\n')


class App(tk.Tk):
    BG       = '#1a1a2e'
    FG       = '#ffffff'
    GRAY     = '#888888'
    ENTRY_BG = '#2d2d44'
    GREEN    = '#538d4e'
    RED      = '#ff6b6b'

    def __init__(self):
        super().__init__()
        self.title('오늘의 단어 업데이트')
        self.configure(bg=self.BG)
        self.resizable(False, False)
        self._build()
        self._load()

    def _label(self, text, row, col, fg=None, font=None, **kw):
        lbl = tk.Label(self, text=text, bg=self.BG,
                       fg=fg or self.GRAY, font=font or ('', 10))
        lbl.grid(row=row, column=col, **kw)
        return lbl

    def _build(self):
        pad = dict(padx=18, pady=7)

        self._label('현재 단어', 0, 0, sticky='e', **pad)
        self.lbl_cur = self._label('', 0, 1, fg=self.FG,
                                   font=('', 15, 'bold'), sticky='w', **pad)

        self._label('최근 정답', 1, 0, sticky='e', **pad)
        self.lbl_last = self._label('', 1, 1, sticky='w', **pad)

        tk.Frame(self, bg='#333355', height=1).grid(
            row=2, column=0, columnspan=2, sticky='ew', padx=18, pady=4)

        self._label('새 단어', 3, 0, fg=self.FG, sticky='e', **pad)
        self.ent_word = tk.Entry(
            self, font=('', 17, 'bold'), width=7, justify='center',
            bg=self.ENTRY_BG, fg=self.FG, insertbackground=self.FG,
            relief='flat', bd=6)
        self.ent_word.grid(row=3, column=1, sticky='w', **pad)
        self.ent_word.focus()
        self.ent_word.bind('<KeyRelease>', self._on_word_change)
        self.ent_word.bind('<Return>', lambda _: self._submit())

        self.lbl_jamo = self._label('', 4, 0, columnspan=2)

        self._label('업데이트 시간', 5, 0, fg=self.FG, sticky='e', **pad)
        self.ent_time = tk.Entry(
            self, width=20, bg=self.ENTRY_BG, fg=self.FG,
            insertbackground=self.FG, relief='flat', bd=6)
        self.ent_time.grid(row=5, column=1, sticky='w', **pad)

        self.btn = tk.Button(
            self, text='업데이트 & 푸시', command=self._submit,
            bg=self.GREEN, fg='white', font=('', 11, 'bold'),
            relief='flat', padx=18, pady=9, cursor='hand2',
            activebackground='#6aaa64', activeforeground='white')
        self.btn.grid(row=6, column=0, columnspan=2, pady=(10, 6))

        self.log = tk.Text(
            self, height=5, width=36, state='disabled',
            font=('Consolas', 9), bg='#0d0d1a', fg='#aaaaaa',
            relief='flat', padx=8, pady=6)
        self.log.grid(row=7, column=0, columnspan=2, padx=18, pady=(0, 14))

    def _load(self):
        word, last, _ = read_values()
        self.lbl_cur.config(text=word)
        self.lbl_last.config(text=last)
        self._refresh_time()

    def _refresh_time(self):
        self.ent_time.delete(0, 'end')
        self.ent_time.insert(0, (datetime.now() + timedelta(minutes=1)).strftime('%Y-%m-%d %H:%M'))

    def _on_word_change(self, _=None):
        word = self.ent_word.get().strip()
        if word:
            n = count_jamo(word)
            color = self.GREEN if n == 5 else self.RED
            self.lbl_jamo.config(text=f'자모 {n}개', fg=color)
        else:
            self.lbl_jamo.config(text='')

    def _log(self, msg):
        self.log.config(state='normal')
        self.log.insert('end', msg + '\n')
        self.log.see('end')
        self.log.config(state='disabled')

    def _submit(self):
        new_word = self.ent_word.get().strip()
        upd_time = self.ent_time.get().strip()

        if not new_word:
            messagebox.showwarning('입력 오류', '새 단어를 입력하세요.')
            return

        n = count_jamo(new_word)
        if n != 5:
            if not messagebox.askyesno('자모 수 경고',
                    f'자모가 {n}개입니다 (5개 필요).\n계속 진행할까요?'):
                return

        old_word = self.lbl_cur.cget('text')
        # 버튼 누른 시점의 시간+1분으로 덮어쓰기
        self.ent_time.delete(0, 'end')
        self.ent_time.insert(0, (datetime.now() + timedelta(minutes=1)).strftime('%Y-%m-%d %H:%M'))
        upd_time = self.ent_time.get().strip()
        self.btn.config(state='disabled', text='처리 중...')
        self.update()

        try:
            write_word_json(new_word, old_word, upd_time)
            self._log('✓ word.json 수정')

            subprocess.run(['git', 'add', 'word.json'],
                           cwd=SCRIPT_DIR, check=True, capture_output=True)
            commit_msg = f'단어 {new_word}, 시간 {upd_time}'
            subprocess.run(['git', 'commit', '-m', commit_msg],
                           cwd=SCRIPT_DIR, check=True, capture_output=True)
            self._log('✓ 커밋')

            r = subprocess.run(['git', 'push', 'origin', 'master'],
                               cwd=SCRIPT_DIR, capture_output=True, text=True)
            if r.returncode == 0:
                self._log('✓ 푸시 완료!')
            else:
                self._log(f'✗ 푸시 실패\n{r.stderr.strip()}')
                return

            self.lbl_cur.config(text=new_word)
            self.lbl_last.config(text=old_word)
            self.ent_word.delete(0, 'end')
            self.lbl_jamo.config(text='')
            self._refresh_time()

        except subprocess.CalledProcessError as e:
            self._log(f'✗ git 오류: {e}')
        except Exception as e:
            self._log(f'✗ 오류: {e}')
            messagebox.showerror('오류', str(e))
        finally:
            self.btn.config(state='normal', text='업데이트 & 푸시')


if __name__ == '__main__':
    App().mainloop()
