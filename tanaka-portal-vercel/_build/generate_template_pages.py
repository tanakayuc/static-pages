# -*- coding: utf-8 -*-
"""テンプレート説明ページ（素材集スタイル）生成器 v2。

v1への田中FB(2026-07-31):「フォルダ階層を見せてるだけ。素材1個1個へのリンクと
使い方の説明が欲しい。cl-tokutenの素材集のように」→ 全面改修。
- 全体像フロー（チップ表示）
- 「まずはここから」= 00_系資料への直リンク
- フェーズごとのセクション: 素材1個1個にDrive直リンク＋一言説明
- 入力: portal_cards.json（tree=再帰取得済みの素材ツリー・直リンク付き）
実行: python3 _build/generate_template_pages.py （tanaka-portal-vercel/ で実行）
"""
import json, re, sys, html
from pathlib import Path

BUILD = Path(__file__).resolve().parent
ROOT = BUILD.parent
sys.path.insert(0, str(BUILD))
from template_pages_data import CARD_COPY, GROUP_COPY, FILE_NOTES, CARD_FLOWS, FOLDER_CAPS

CARDS_JSON = BUILD / 'portal_cards.json'
OUT_DIR = ROOT / 'templates' / 't'
MAX_CHILDREN = 12   # サブフォルダ内で直接列挙する上限（超過分はフォルダリンクへ誘導）
SKIP_NAMES = {'.DS_Store'}

def resolve_copy(group, name, desc):
    for key in (f"{group}|{name}|{'3期' if '3期' in desc else '4期'}", f"{group}|{name}", name):
        if key in CARD_COPY:
            return CARD_COPY[key]
    raise KeyError(f'文言未定義: {group}/{name}')

def note_for(name):
    if name in FOLDER_CAPS:
        return FOLDER_CAPS[name]
    for prefix, note in FILE_NOTES.items():
        if name.startswith(prefix):
            return note
    return ''

def esc(s):
    return html.escape(s, quote=True)

def item_li(node, indent=False):
    """素材1件=名前(直リンク)+一言。フォルダは📁で自身のリンクも持つ。"""
    icon = '📁' if node['is_folder'] else '📄'
    note = note_for(node['name'])
    note_html = f'<span class="text-xs text-slate-500 ml-2">{esc(note)}</span>' if note else ''
    pad = ' pl-6' if indent else ''
    return (
        f'<li class="py-1.5{pad}"><span class="mr-1">{icon}</span>'
        f'<a href="{node["url"]}" target="_blank" rel="noopener" '
        f'class="font-medium text-brand-700 hover:underline break-all">{esc(node["name"])}</a>'
        f'{note_html}</li>'
    )

def section_for_folder(node):
    """トップ階層フォルダ1つ=1セクション。配下素材を直リンクで列挙。"""
    cap = note_for(node['name'])
    children = [c for c in node.get('children', []) if c['name'] not in SKIP_NAMES]
    lis = [item_li(c) for c in children[:MAX_CHILDREN]]
    more = len(children) - MAX_CHILDREN
    more_html = (
        f'<li class="py-1.5 text-sm"><a href="{node["url"]}" target="_blank" rel="noopener" '
        f'class="text-brand-700 hover:underline">…ほか{more}件をフォルダで見る →</a></li>'
        if more > 0 else ''
    )
    empty_html = (
        f'<li class="py-1.5 text-sm text-slate-500">中身は<a href="{node["url"]}" target="_blank" rel="noopener" '
        f'class="text-brand-700 hover:underline">フォルダを開いて</a>確認してください。</li>'
        if not children else ''
    )
    return f'''
    <section class="bg-white rounded-2xl border border-slate-200 p-6 mb-5">
      <h3 class="font-bold text-slate-900 mb-1">
        <a href="{node['url']}" target="_blank" rel="noopener" class="text-inherit no-underline hover:underline">📁 {esc(node['name'])}</a>
      </h3>
      {f'<p class="text-sm text-slate-500 mb-3">{esc(cap)}</p>' if cap else '<div class="mb-3"></div>'}
      <ul class="divide-y divide-slate-100">
        {''.join(lis)}{more_html}{empty_html}
      </ul>
    </section>'''

def flow_chips(slug):
    steps = CARD_FLOWS.get(slug)
    if not steps:
        return ''
    chips = '<span class="text-slate-300 mx-1">→</span>'.join(
        f'<span class="inline-block bg-white border border-brand-200 text-brand-700 text-sm font-medium px-3 py-1.5 rounded-full whitespace-nowrap">{esc(s)}</span>'
        for s in steps
    )
    return f'''
    <section class="mb-6">
      <h2 class="font-bold text-lg text-slate-900 mb-3">🗺️ 全体像</h2>
      <div class="overflow-x-auto"><div class="flex items-center py-1">{chips}</div></div>
      <p class="text-sm text-slate-500 mt-2">この流れが、下の実物素材でひとつながりになっています。</p>
    </section>'''

def page_html(group, gdesc, card, copy):
    name = esc(card['name'])
    emoji = card['emoji'] or '📁'
    drive = card['url']
    origin = GROUP_COPY.get(group, '')
    tree = [n for n in card.get('tree', []) if n['name'] not in SKIP_NAMES]
    folders = [n for n in tree if n['is_folder']]
    loose_files = [n for n in tree if not n['is_folder']]
    first_reads = [n for n in loose_files if n['name'].startswith('00_')] or \
                  [n for n in tree if n['name'].startswith(('00_', '01_素材リンク集'))]
    other_files = [n for n in loose_files if n not in first_reads]

    first_section = ''
    if first_reads:
        lis = ''.join(item_li(n) for n in first_reads)
        first_section = f'''
    <section class="bg-brand-100/60 rounded-2xl border border-brand-200 p-6 mb-5">
      <h3 class="font-bold text-slate-900 mb-1">🔰 まずはここから</h3>
      <p class="text-sm text-slate-600 mb-3">全体の設計と素材の並び順の解説です。最初に読むと、各素材の位置づけが分かります。</p>
      <ul>{lis}</ul>
    </section>'''

    folder_sections = ''.join(section_for_folder(n) for n in folders)
    other_section = ''
    if other_files:
        lis = ''.join(item_li(n) for n in other_files)
        other_section = f'''
    <section class="bg-white rounded-2xl border border-slate-200 p-6 mb-5">
      <h3 class="font-bold text-slate-900 mb-3">📄 単票の資料</h3>
      <ul class="divide-y divide-slate-100">{lis}</ul>
    </section>'''

    single_cta = '資料を開く' if copy.get('single_file') else 'フォルダ全体をGoogle Driveで開く'
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
      <span class="inline-block text-xs font-bold text-brand-700 bg-brand-100 px-2.5 py-1 rounded-full">{esc(group)}</span>
      <span class="inline-block text-xs text-slate-500 ml-2">{esc(gdesc)}</span>
    </header>

    <section class="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
      <h2 class="font-bold text-lg text-slate-900 mb-3">✅ これは何？</h2>
      <p class="leading-relaxed mb-3">{esc(copy['what'])}</p>
      <p class="leading-relaxed text-slate-600">{esc(origin)}</p>
    </section>

    <section class="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
      <h2 class="font-bold text-lg text-slate-900 mb-3">🕐 いつ使う？</h2>
      <p class="leading-relaxed">{esc(copy['when'])}</p>
    </section>
{flow_chips(copy['slug'])}
{first_section}{folder_sections}{other_section}
    <section class="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
      <h2 class="font-bold text-lg text-slate-900 mb-3">📖 使い方</h2>
      <ol class="list-decimal list-inside space-y-2 text-slate-700">
        <li>上の素材リンクは<strong>すべて閲覧用の実物</strong>です。まず気になる素材を開いて読む</li>
        <li>自分の案件に使いたい素材は<strong>コピーして</strong>編集する（原本は書き換えない）</li>
        <li>書き換えた原稿は田中祐一AIの添削に出して仕上げる</li>
      </ol>
    </section>

    <a href="{drive}" target="_blank" rel="noopener" class="block w-full text-center bg-brand-600 hover:bg-brand-700 text-white font-bold text-lg py-4 rounded-2xl no-underline shadow-md">
      {single_cta} →
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
    print(f'一覧リンク差し替え(新規分): {replaced} 箇所')

if __name__ == '__main__':
    main()
