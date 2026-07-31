# -*- coding: utf-8 -*-
"""テンプレート説明ページ（ワンクッション）生成器。

田中要望 2026-07-31: テンプレ集の各カードとDriveの間に、用途説明のHTMLを1枚挟む。
- 入力: portal_cards.json（templates.htmlから抽出したカード＋Drive実フォルダ一覧）
       template_pages_data.py（37件の説明文言・slug）
- 出力: templates/t/<slug>.html（37枚）＋ templates.html のカードリンク差し替え
実行: python3 _build/generate_template_pages.py （tanaka-portal-vercel/ で実行）
"""
import json, re, sys, html
from pathlib import Path

BUILD = Path(__file__).resolve().parent
ROOT = BUILD.parent
sys.path.insert(0, str(BUILD))
from template_pages_data import CARD_COPY, GROUP_COPY, FILE_NOTES

CARDS_JSON = BUILD / 'portal_cards.json'
OUT_DIR = ROOT / 'templates' / 't'
MAX_FILES_SHOWN = 24

def resolve_copy(group, name, desc):
    for key in (
        f"{group}|{name}|{'3期' if '3期' in desc else '4期'}",
        f"{group}|{name}",
        name,
    ):
        if key in CARD_COPY:
            return CARD_COPY[key]
    raise KeyError(f'文言未定義: {group}/{name}')

def note_for(fname):
    for prefix, note in FILE_NOTES.items():
        if fname.startswith(prefix):
            return note
    return ''

def page_html(group, gdesc, card, copy):
    name = html.escape(card['name'])
    emoji = card['emoji'] or '📁'
    drive = card['url']
    files = card.get('files', [])
    shown = files[:MAX_FILES_SHOWN]
    more = len(files) - len(shown)
    origin = GROUP_COPY.get(group, '')
    first_read = next((f for f in files if f.startswith('00_')), None)
    is_single = copy.get('single_file')

    items = '\n'.join(
        f'          <li class="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">'
        f'<span class="text-slate-400 mt-0.5">📄</span>'
        f'<div class="min-w-0"><div class="font-medium text-slate-800 break-all">{html.escape(f)}</div>'
        + (f'<div class="text-xs text-slate-500 mt-0.5">{html.escape(note_for(f))}</div>' if note_for(f) else '')
        + '</div></li>'
        for f in shown
    )
    more_html = (
        f'<p class="text-sm text-slate-500 mt-3">ほか {more} 件。全量はDriveで確認できます。</p>' if more > 0 else ''
    )
    contents_section = '' if is_single else f'''
    <section class="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
      <h2 class="font-bold text-lg text-slate-900 mb-3">📦 中身（Driveの実フォルダ構成）</h2>
      <ul>
{items}
      </ul>
      {more_html}
    </section>'''

    howto_first = (
        f'<li>まず <strong>{html.escape(first_read)}</strong> を開いて全体の並びをつかむ</li>'
        if first_read else
        '<li>まずフォルダを一望して、自分の案件にある物・ない物を見比べる</li>'
    )
    return f'''<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex">
<title>{name}とは | テンプレート集 | PLCのAIポータル</title>
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config={{theme:{{extend:{{colors:{{brand:{{50:'#f0faf8',100:'#d9f2ec',200:'#b3e5d9',300:'#7dd3bd',600:'#189b7d',700:'#137a63'}}}}}}}}}}</script>
</head>
<body class="bg-brand-50 min-h-screen text-slate-800">
  <main class="max-w-3xl mx-auto px-5 py-10">
    <a href="/templates" class="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 no-underline hover:underline mb-6">← テンプレート集に戻る</a>

    <header class="mb-6">
      <div class="flex items-center gap-3 mb-2">
        <span class="text-4xl">{emoji}</span>
        <h1 class="text-2xl font-bold text-slate-900">{name}</h1>
      </div>
      <span class="inline-block text-xs font-bold text-brand-700 bg-brand-100 px-2.5 py-1 rounded-full">{html.escape(group)}</span>
      <span class="inline-block text-xs text-slate-500 ml-2">{html.escape(gdesc)}</span>
    </header>

    <section class="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
      <h2 class="font-bold text-lg text-slate-900 mb-3">✅ これは何？</h2>
      <p class="leading-relaxed mb-3">{html.escape(copy['what'])}</p>
      <p class="leading-relaxed text-slate-600">{html.escape(origin)}</p>
    </section>

    <section class="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
      <h2 class="font-bold text-lg text-slate-900 mb-3">🕐 いつ使う？</h2>
      <p class="leading-relaxed">{html.escape(copy['when'])}</p>
    </section>
{contents_section}
    <section class="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
      <h2 class="font-bold text-lg text-slate-900 mb-3">📖 使い方</h2>
      <ol class="list-decimal list-inside space-y-2 text-slate-700">
        {howto_first}
        <li>自分の案件に当てはめたい素材を選び、<strong>コピーして</strong>編集する（原本は書き換えない）</li>
        <li>書き換えた原稿は田中祐一AIの添削に出して仕上げる</li>
      </ol>
    </section>

    <a href="{drive}" target="_blank" rel="noopener" class="block w-full text-center bg-brand-600 hover:bg-brand-700 text-white font-bold text-lg py-4 rounded-2xl no-underline shadow-md">
      Google Driveでこのテンプレートを開く →
    </a>
    <p class="text-center text-xs text-slate-400 mt-3">Googleドライブが新しいタブで開きます</p>
  </main>
</body>
</html>
'''

def main():
    groups = json.load(open(CARDS_JSON))
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    slug_map = {}
    for g in groups:
        for c in g['cards']:
            copy = resolve_copy(g['group'], c['name'], c['desc'])
            slug = copy['slug']
            (OUT_DIR / f'{slug}.html').write_text(
                page_html(g['group'], g['group_desc'], c, copy), encoding='utf-8')
            slug_map[c['url']] = f'/templates/t/{slug}'
    print(f'生成: {len(slug_map)} ページ → templates/t/')

    # templates.html のカードリンクを説明ページへ差し替え（funnel-cardのhrefのみ）
    tpl = ROOT / 'templates.html'
    h = tpl.read_text(encoding='utf-8')
    replaced = 0
    def sub(m):
        nonlocal replaced
        url = m.group(1)
        if url in slug_map:
            replaced += 1
            return f'<a href="{slug_map[url]}" class='
        return m.group(0)
    h2 = re.sub(r'<a href="(https://drive\.google\.com/[^"]+)" target="_blank" rel="noopener" class=', sub, h)
    tpl.write_text(h2, encoding='utf-8')
    print(f'リンク差し替え: {replaced} 箇所')
    if replaced != len(slug_map):
        print(f'⚠️ 差し替え数がページ数と不一致（重複URLか構造差異）')

if __name__ == '__main__':
    main()
