'use strict';

// 画面検討用の架空データ。実会員・Chatwork・Supabaseとは接続しない。
const members = [
  { id: 'demo-aoi', name: 'あおい', job: 'コンテンツホルダー', color: '#e8d6cb' },
  { id: 'demo-sora', name: 'そら', job: 'プロデューサー', color: '#dbe8dd' },
  { id: 'demo-hinata', name: 'ひなた', job: '認定講師', color: '#e8dfcb' },
  { id: 'demo-ren', name: 'れん', job: 'セールス', color: '#d7e3ef' },
  { id: 'demo-koharu', name: 'こはる', job: '運営サポーター', color: '#eedde8' },
];
const seedEvents = [
  { id:'a1',userId:'demo-aoi',date:'2026-10-02',label:'学習会で学びを共有',category:'貢献',points:280,source:'運営確認・学習会記録',status:'approved' },
  { id:'a2',userId:'demo-aoi',date:'2026-10-04',label:'部活動を完走',category:'完遂',points:400,source:'30日部活動の成果物',status:'approved' },
  { id:'a3',userId:'demo-aoi',date:'2026-09-18',label:'ファネルを構築',category:'実践',points:1500,source:'運営確認・成果報告',status:'approved' },
  { id:'a4',userId:'demo-aoi',date:'2026-10-06',label:'仲間の企画を支援',category:'貢献',points:300,source:'本人申請・活動報告',status:'pending' },
  { id:'s1',userId:'demo-sora',date:'2026-10-01',label:'ワークショップを企画・開催',category:'貢献',points:600,source:'イベント運営記録',status:'approved' },
  { id:'s2',userId:'demo-sora',date:'2026-10-03',label:'仲間の企画相談をサポート',category:'貢献',points:350,source:'指定Chatworkグループ・運営確認',status:'approved' },
  { id:'s3',userId:'demo-sora',date:'2026-10-05',label:'ナレッジを共有',category:'貢献',points:250,source:'共有ライブラリ・運営確認',status:'approved' },
  { id:'s4',userId:'demo-sora',date:'2026-08-22',label:'3ヶ月チームを完遂',category:'完遂',points:2100,source:'チーム運営記録',status:'approved' },
  { id:'h1',userId:'demo-hinata',date:'2026-10-01',label:'グルコンに参加',category:'参加',points:100,source:'参加記録',status:'approved' },
  { id:'h2',userId:'demo-hinata',date:'2026-10-04',label:'仲間へ専門知識を共有',category:'貢献',points:480,source:'運営確認・シェア会記録',status:'approved' },
  { id:'h3',userId:'demo-hinata',date:'2026-09-09',label:'部活動を完走',category:'完遂',points:1800,source:'部活動の成果物',status:'approved' },
  { id:'r1',userId:'demo-ren',date:'2026-10-02',label:'セールス相談を受けた',category:'実践',points:160,source:'担当者の実施記録',status:'approved' },
  { id:'r2',userId:'demo-ren',date:'2026-10-05',label:'成果を共有',category:'貢献',points:200,source:'指定Chatwork成果報告グループ',status:'approved' },
  { id:'r3',userId:'demo-ren',date:'2026-08-10',label:'SNS発信を30日継続',category:'完遂',points:750,source:'運営確認・投稿記録',status:'approved' },
  { id:'k1',userId:'demo-koharu',date:'2026-10-03',label:'新メンバーを案内',category:'貢献',points:260,source:'運営サポート記録',status:'approved' },
  { id:'k2',userId:'demo-koharu',date:'2026-10-05',label:'ワークショップに参加',category:'参加',points:100,source:'イベント参加記録',status:'approved' },
  { id:'k3',userId:'demo-koharu',date:'2026-09-02',label:'45日シートを完遂',category:'完遂',points:1200,source:'シート確認記録',status:'approved' },
  { id:'k4',userId:'demo-koharu',date:'2026-10-06',label:'仲間の初回接続を支援',category:'貢献',points:260,source:'本人申請・活動報告',status:'pending' },
];
const seasonStart = '2026-10-01';
const seasonEnd = '2026-12-31';
const storageKey = 'plc-admin-preview-v1';
const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;' }[character]));
let approvedIds = [];
try { approvedIds = JSON.parse(localStorage.getItem(storageKey) || '[]'); if (!Array.isArray(approvedIds)) approvedIds = []; } catch { approvedIds = []; }
const events = () => seedEvents.map((event) => ({ ...event, status: approvedIds.includes(event.id) ? 'approved' : event.status }));
const isSeason = (event) => event.date >= seasonStart && event.date <= seasonEnd;
const approved = (event) => event.status === 'approved';
const forMember = (id) => events().filter((event) => event.userId === id);
function totals(id) {
  const rows = forMember(id);
  return {
    season: rows.filter((event) => approved(event) && isSeason(event)).reduce((sum,event) => sum + event.points, 0),
    lifetime: rows.filter(approved).reduce((sum,event) => sum + event.points, 0),
    seasonCount: rows.filter((event) => approved(event) && isSeason(event)).length,
    pending: rows.filter((event) => event.status === 'pending').length,
  };
}
const fmt = (number) => Number(number).toLocaleString('ja-JP');
function toast(message) { const target = $('#adminToast'); target.textContent = message; target.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => target.classList.remove('show'), 3200); }
function render() {
  const memberTotals = members.map((member) => ({ ...member, ...totals(member.id) }));
  $('#totalSeason').textContent = fmt(memberTotals.reduce((sum,row) => sum + row.season,0));
  $('#totalLifetime').textContent = fmt(memberTotals.reduce((sum,row) => sum + row.lifetime,0));
  $('#activeMembers').textContent = fmt(memberTotals.filter((row) => row.seasonCount > 0).length);
  $('#pendingCount').textContent = fmt(memberTotals.reduce((sum,row) => sum + row.pending,0));
  const keyword = $('#searchMember').value.trim().toLocaleLowerCase('ja-JP');
  const status = $('#statusFilter').value;
  const visible = memberTotals.filter((row) => (!keyword || `${row.name} ${row.job}`.toLocaleLowerCase('ja-JP').includes(keyword)) && (status === 'all' || status === 'active' && row.seasonCount > 0 || status === 'pending' && row.pending > 0)).sort((a,b) => b.season - a.season || b.lifetime - a.lifetime);
  $('#resultCount').textContent = `${visible.length} / ${members.length} 人`;
  $('#memberRows').innerHTML = visible.length ? visible.map((row) => `<tr><td><div class="admin-member"><span class="admin-avatar" style="--avatar-color:${row.color}">${esc(row.name[0])}</span><span><b>${esc(row.name)}</b><small>${esc(row.job)}</small></span></div></td><td><span class="admin-number">${fmt(row.season)} <small>T</small></span></td><td><span class="admin-number">${fmt(row.lifetime)} <small>LTT</small></span></td><td>${row.seasonCount} 件</td><td><span class="admin-chip ${row.pending?'pending':''}">${row.pending ? `${row.pending} 件を確認` : 'なし'}</span></td><td><button class="admin-text-link" data-detail="${row.id}">履歴を見る →</button></td></tr>`).join('') : '<tr><td colspan="6">該当する会員はいません。</td></tr>';
  const queue = events().filter((event) => event.status === 'pending');
  $('#reviewQueue').innerHTML = queue.length ? queue.map((event) => { const member = members.find((item) => item.id === event.userId); return `<div class="admin-review"><div><b>${esc(member?.name || '')} · ${esc(event.label)}</b><small>${esc(event.date)} / ${esc(event.source)}</small></div><strong>+${fmt(event.points)} T</strong><button class="admin-text-link" data-review="${event.id}">内容を確認 →</button></div>`; }).join('') : '<p>確認待ちの活動はありません。</p>';
}
function showMember(id) {
  const member = members.find((item) => item.id === id);
  if (!member) return;
  const score = totals(id);
  const rows = forMember(id).sort((a,b) => b.date.localeCompare(a.date));
  $('#memberDetail').innerHTML = `<div class="admin-detail"><p class="admin-eyebrow">MEMBER POINT HISTORY</p><h2>${esc(member.name)}</h2><p>${esc(member.job)} · 点数と活動の根拠</p><div class="admin-detail-stats"><div><small>今期のTポイント</small><b>${fmt(score.season)} T</b></div><div><small>累計のLTT</small><b>${fmt(score.lifetime)} LTT</b></div></div><div class="admin-detail-list">${rows.map((event) => `<article><b>${esc(event.label)}</b><b>${event.status === 'approved' ? '+'+fmt(event.points) : '承認待ち'}</b><small>${esc(event.date)} / ${esc(event.category)}</small><small>${esc(event.source)}</small></article>`).join('')}</div><div class="admin-detail-actions"><button class="admin-button" data-export="${member.id}">この会員の履歴をCSV出力</button><button class="admin-button secondary" data-close>閉じる</button></div></div>`;
  $('#memberDialog').showModal();
}
function csvCell(value) { let text = String(value ?? ''); if (/^[\s\t\r\n]*[=+\-@]/.test(text)) text = "'" + text; return '"' + text.replaceAll('"','""') + '"'; }
function downloadCsv(rows, filename) {
  const blob = new Blob(['\ufeff' + rows.map((row) => row.map(csvCell).join(',')).join('\r\n')], { type:'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('CSVを出力しました');
}
function exportMember(id) {
  const member = members.find((item) => item.id === id);
  if (!member) return;
  const score = totals(id);
  downloadCsv([['会員ID','会員名','今期T','累計LTT','日付','活動','種別','状態','ポイント','出典'], ...forMember(id).sort((a,b) => b.date.localeCompare(a.date)).map((event) => [member.id,member.name,score.season,score.lifetime,event.date,event.label,event.category,event.status === 'approved' ? '承認済み':'確認待ち',event.status === 'approved' ? event.points : 0,event.source])],`plc-points-${member.id}.csv`);
}
function exportAll() {
  downloadCsv([['会員ID','会員名','ジョブ','今期T','累計LTT','今期活動件数','確認待ち件数'], ...members.map((member) => { const score = totals(member.id); return [member.id,member.name,member.job,score.season,score.lifetime,score.seasonCount,score.pending]; })],'plc-points-members.csv');
}
$('#searchMember').addEventListener('input',render);
$('#statusFilter').addEventListener('change',render);
$('#exportAll').addEventListener('click',exportAll);
$('#closeDialog').addEventListener('click',() => $('#memberDialog').close());
$('#memberDialog').addEventListener('click',(event) => { if (event.target === $('#memberDialog')) $('#memberDialog').close(); });
document.addEventListener('click',(event) => {
  const detail = event.target.closest('[data-detail]'); if (detail) showMember(detail.dataset.detail);
  const exportButton = event.target.closest('[data-export]'); if (exportButton) exportMember(exportButton.dataset.export);
  if (event.target.closest('[data-close]')) $('#memberDialog').close();
  const review = event.target.closest('[data-review]'); if (review) { const record = events().find((item) => item.id === review.dataset.review); if (!record) return; const member = members.find((item) => item.id === record.userId); $('#memberDetail').innerHTML = `<div class="admin-detail"><p class="admin-eyebrow">ACTIVITY REVIEW</p><h2>${esc(record.label)}</h2><p>${esc(member?.name || '')} · ${esc(record.date)}</p><div class="admin-detail-list"><article><b>評価</b><b>+${fmt(record.points)} T / LTT</b><small>種別</small><small>${esc(record.category)}</small></article><article><b>出典</b><b>${esc(record.source)}</b><small>同一活動の重複を確認して承認</small><small>体験データ</small></article></div><div class="admin-detail-actions"><button class="admin-button" data-approve="${record.id}">承認して加算</button><button class="admin-button secondary" data-close>閉じる</button></div><p>この操作はブラウザ内の体験データにだけ反映されます。</p></div>`; $('#memberDialog').showModal(); }
  const approveButton = event.target.closest('[data-approve]'); if (approveButton) { const id = approveButton.dataset.approve; if (!seedEvents.some((item) => item.id === id && item.status === 'pending') || approvedIds.includes(id)) return; approvedIds.push(id); localStorage.setItem(storageKey,JSON.stringify(approvedIds)); $('#memberDialog').close(); render(); toast('体験データで承認しました。TとLTTを再集計しました'); }
});
render();
