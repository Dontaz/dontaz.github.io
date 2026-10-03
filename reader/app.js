(() => {
'use strict';
const $ = id => document.getElementById(id);
const view = $('view'), book = $('book'), panel = $('panel'), fn = $('fn');
const BLK = 'p,li,blockquote,h1,h2,h3,h4,h5,h6,pre';
const store = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
const h = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; };
const esc = s => s.replace(/[&<>]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;'}[c]));
const fracPos = () => { const m = view.scrollHeight - view.clientHeight; return m > 0 ? view.scrollTop / m : 0; };

let cfg = Object.assign({size: 18, font: 'serif', dark: false}, store.get('cfg', {}));
if (cfg.sans) cfg.font = 'sans';
delete cfg.sans;
let face = null, customName = '';
let notes = store.get('notes', {});
let cur = null, draft = null, io = null;
const workerUrl = URL.createObjectURL(new Blob([window.PDF_WORKER_SRC || ''], {type: 'text/javascript'}));
if (window.pdfjsLib) pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
let pdfWorker;
function getWorker() {
  if (pdfWorker === undefined) {
    try { pdfWorker = new pdfjsLib.PDFWorker({port: new Worker(workerUrl)}); } catch { pdfWorker = null; }
  }
  return pdfWorker || undefined;
}

function applyCfg() {
  document.documentElement.dataset.theme = cfg.dark ? 'dark' : 'light';
  document.body.dataset.font = cfg.font;
  document.documentElement.style.setProperty('--fs', cfg.size + 'px');
  $('theme').textContent = cfg.dark ? 'Light' : 'Dark';
  $('font').textContent = cfg.font === 'custom' ? customName || 'Custom' : cfg.font === 'sans' ? 'Sans' : 'Serif';
  store.set('cfg', cfg);
}
function resize(d) {
  const f = fracPos();
  cfg.size = Math.max(12, Math.min(36, cfg.size + d));
  applyCfg();
  if (cur && cur.kind === 'pdf') layoutPdf();
  else view.scrollTop = f * (view.scrollHeight - view.clientHeight);
}

function decode(buf, enc) {
  if (enc) try { return new TextDecoder(enc).decode(buf); } catch {}
  try { return new TextDecoder('utf-8', {fatal: true}).decode(buf); }
  catch { return new TextDecoder('windows-1251').decode(buf); }
}
function clean(root, pre) {
  root.querySelectorAll('script,style,link,meta,iframe,object,embed,form,title').forEach(e => e.remove());
  root.querySelectorAll('*').forEach(e => {
    for (const a of [...e.attributes]) {
      const n = a.name.toLowerCase();
      if (n.startsWith('on') || n === 'style' || n === 'class') e.removeAttribute(a.name);
      else if (n === 'id') { if (pre == null) e.removeAttribute('id'); else e.id = pre + a.value; }
      else if (n === 'name' && e.tagName === 'A' && pre != null && !e.hasAttribute('id')) e.id = pre + a.value;
    }
    if (e.tagName === 'A') {
      const hr = e.getAttribute('href') || '';
      if (/^https?:/i.test(hr)) { e.target = '_blank'; e.rel = 'noopener'; }
      else { if (pre != null && hr.length > 1 && hr[0] === '#') e.dataset.to = pre + hr.slice(1); e.removeAttribute('href'); }
    }
  });
}

const VOID = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i;
const xfix = s => s.replace(/<([a-zA-Z][\w:.-]*)((?:\s[^<>]*?)?)\s*\/>/g, (m, t, a) => VOID.test(t) ? m : '<' + t + a + '></' + t + '>');

const isNoteLink = a => !!(a.closest('sup') || /note/i.test((a.getAttribute('epub:type') || '') + (a.getAttribute('role') || '')) ||
  /^\s*[\[({]?\s*(\d{1,3}|[*†‡§#]+)\s*[\])}]?\.?\s*$/.test(a.textContent));

function parseText(buf, name) {
  const t = decode(buf).replace(/^\uFEFF/, '');
  const paras = /\n\s*\n/.test(t) ? t.split(/\n\s*\n/).map(p => p.replace(/\s*\n\s*/g, ' ')) : t.split('\n');
  const html = paras.map(p => p.trim()).filter(Boolean).map(p => '<p>' + esc(p) + '</p>').join('');
  return {title: name.replace(/\.[^.]+$/, ''), sections: [{title: 'Text', html}]};
}

function parseHtml(buf, name) {
  let src = decode(buf);
  if (/xmlns=["']http:\/\/www\.w3\.org\/1999\/xhtml/.test(src)) src = xfix(src);
  const d = new DOMParser().parseFromString(src, 'text/html');
  const title = d.title || name;
  clean(d.body, 'h_');
  return {title, sections: [{title, html: d.body.innerHTML}]};
}

function parseFb2(buf) {
  const head = new TextDecoder('latin1').decode(buf.slice(0, 200));
  const enc = (head.match(/encoding=["']([\w-]+)/) || [])[1];
  const x = new DOMParser().parseFromString(decode(buf, enc), 'application/xml');
  const bin = Object.create(null);
  x.querySelectorAll('binary').forEach(b => {
    const type = (b.getAttribute('content-type') || 'image/jpeg').replace(/[^\w/+.-]/g, '');
    bin[b.getAttribute('id')] = 'data:' + type + ';base64,' + b.textContent.replace(/[^A-Za-z0-9+/=]/g, '');
  });
  const href = n => ([...n.attributes].find(a => a.localName === 'href') || {}).value || '';
  const T = {subtitle: 'h3', p: 'p', v: 'p', 'text-author': 'p', epigraph: 'blockquote', cite: 'blockquote',
    poem: 'blockquote', emphasis: 'em', strong: 'strong', strikethrough: 's', sub: 'sub', sup: 'sup', code: 'code'};
  const fid = v => 'f_' + v.replace(/[^\w.-]/g, '_');
  const ida = n => n.getAttribute('id') ? ' id="' + fid(n.getAttribute('id')) + '"' : '';
  const conv = n => {
    if (n.nodeType === 3) return esc(n.nodeValue);
    if (n.nodeType !== 1) return '';
    const l = n.localName, kids = () => [...n.childNodes].map(conv).join('');
    if (l === 'image') { const d = bin[href(n).slice(1)]; return d ? '<img src="' + d + '">' : ''; }
    if (l === 'empty-line') return '<br>';
    if (l === 'title') return '<h2>' + [...n.children].map(c => [...c.childNodes].map(conv).join('')).join('<br>') + '</h2>';
    if (l === 'a') {
      const t = href(n);
      if (t[0] === '#') return '<a data-to="' + fid(t.slice(1)) + '"' + (n.getAttribute('type') === 'note' ? ' data-note="1"' : '') + '>' + kids() + '</a>';
      return /^https?:/i.test(t) ? '<a href="' + t.replace(/["<>]/g, '') + '" target="_blank" rel="noopener">' + kids() + '</a>' : kids();
    }
    if (l === 'section') return '<div' + ida(n) + '>' + kids() + '</div>';
    const t = T[l];
    return t ? '<' + t + ida(n) + '>' + kids() + '</' + t + '>' : kids();
  };
  const titleOf = e => { const t = [...e.children].find(c => c.localName === 'title'); return t ? t.textContent.trim().replace(/\s+/g, ' ') : ''; };
  const main = x.querySelector('body');
  const secs = [...main.children].filter(e => e.localName === 'section');
  const out = secs.map((s, i) => ({title: titleOf(s) || 'Part ' + (i + 1), html: [...s.childNodes].map(conv).join('')}));
  const pre = [...main.children].filter(e => e.localName !== 'section').map(conv).join('');
  if (pre.replace(/<[^>]+>/g, '').trim() || !out.length) out.unshift({title: titleOf(main) || 'Start', html: pre});
  const notesHtml = [...x.querySelectorAll('body')].slice(1).map(b => [...b.childNodes].map(conv).join('')).join('');
  if (notesHtml.replace(/<[^>]+>/g, '').trim()) out.push({title: 'Notes', html: notesHtml});
  const bt = x.querySelector('title-info book-title');
  return {title: bt ? bt.textContent.trim() : '', sections: out};
}

async function parseEpub(zip) {
  const rd = async p => { const f = zip.file(p); return f ? f.async('string') : ''; };
  const xml = s => new DOMParser().parseFromString(s, 'application/xml');
  const opfPath = xml(await rd('META-INF/container.xml')).querySelector('rootfile').getAttribute('full-path');
  const opf = xml(await rd(opfPath));
  const base = opfPath.replace(/[^/]*$/, '');
  const path = (p, from = base) => {
    try {
      const q = new URL(p, 'http://x/' + from).pathname.slice(1);
      try { return decodeURIComponent(q); } catch { return q; }
    } catch { return ''; }
  };
  const man = {}, mt = {};
  opf.querySelectorAll('manifest > item').forEach(i => { man[i.getAttribute('id')] = i; mt[path(i.getAttribute('href'))] = i.getAttribute('media-type'); });
  const spine = [...opf.querySelectorAll('spine > itemref')].map(r => man[r.getAttribute('idref')]).filter(Boolean);

  const toc = {}, items = Object.values(man);
  const navI = items.find(i => (i.getAttribute('properties') || '').includes('nav'));
  const ncxI = items.find(i => i.getAttribute('media-type') === 'application/x-dtbncx+xml');
  if (navI) {
    const p = path(navI.getAttribute('href'));
    const d = new DOMParser().parseFromString(xfix(await rd(p)), 'text/html');
    const n = d.querySelector('nav[epub\\:type="toc"]') || d.querySelector('nav');
    if (n) n.querySelectorAll('a').forEach(a => { toc[path((a.getAttribute('href') || '').split('#')[0], p)] ??= a.textContent.trim().replace(/\s+/g, ' '); });
  } else if (ncxI) {
    const p = path(ncxI.getAttribute('href')), d = xml(await rd(p));
    d.querySelectorAll('navPoint').forEach(np => {
      const c = np.querySelector('content'), l = np.querySelector('navLabel text');
      if (c && l) toc[path(c.getAttribute('src').split('#')[0], p)] ??= l.textContent.trim();
    });
  }

  const docs = [], idx = {}, tried = new Set();
  const addDoc = async (p, extra) => {
    const f = zip.file(p);
    if (!f || tried.has(p)) return;
    tried.add(p);
    const d = new DOMParser().parseFromString(xfix(await f.async('string')), 'text/html');
    if (!d.body.textContent.trim() && !d.body.querySelector('img,svg')) return;
    idx[p] = docs.length;
    docs.push({p, d, extra});
  };
  for (const it of spine) { try { await addDoc(path(it.getAttribute('href'))); } catch {} }
  for (let k = 0; k < docs.length; k++) {
    for (const a of docs[k].d.body.querySelectorAll('a[href]')) {
      const hr = a.getAttribute('href');
      if (!hr || hr[0] === '#' || /^[a-z][\w+.-]*:/i.test(hr) || !isNoteLink(a) || docs.length > spine.length + 40) continue;
      let tp;
      try { tp = path(hr.split('#')[0], docs[k].p); } catch { continue; }
      if (!(tp in idx) && /html/.test(mt[tp] || '')) { try { await addDoc(tp, true); } catch {} }
    }
  }
  if (!docs.length) throw new Error('no readable chapters were found in this EPUB.');
  const sections = [];
  for (const {p, d, extra} of docs) {
    const i = idx[p];
    let html;
    try {
      for (const svg of [...d.querySelectorAll('svg')]) {
        const im = svg.querySelector('image');
        if (im) { const el = d.createElement('img'); el.setAttribute('src', im.getAttribute('xlink:href') || im.getAttribute('href') || ''); svg.replaceWith(el); }
      }
      for (const im of d.querySelectorAll('img')) {
        const src = (im.getAttribute('src') || '').split('#')[0];
        const ip = src && path(src, p), zf = ip && zip.file(ip);
        im.removeAttribute('srcset');
        if (zf) im.src = URL.createObjectURL(new Blob([await zf.async('arraybuffer')], {type: mt[ip] || ''}));
        else im.removeAttribute('src');
      }
      d.body.querySelectorAll('a[href]').forEach(a => {
        const hr = a.getAttribute('href');
        if (/^[a-z][\w+.-]*:/i.test(hr)) return;
        try {
          const [f, fr = ''] = hr.split('#'), ti = idx[f ? path(f, p) : p];
          if (ti === undefined) return;
          a.dataset.to = fr ? 's' + ti + '_' + decodeURIComponent(fr) : 'sec' + ti;
          a.removeAttribute('href');
        } catch {}
      });
      clean(d.body, 's' + i + '_');
      html = d.body.innerHTML;
    } catch (e) { html = '<p>' + esc(d.body.textContent.trim()) + '</p>'; }
    sections.push({title: toc[p] || (extra ? 'Notes' : ''), html});
  }
  sections.forEach((s, i) => { s.title ||= 'Section ' + (i + 1); });
  const t = opf.querySelector('metadata > title');
  return {title: t ? t.textContent.trim() : '', sections};
}

async function parseZip(buf) {
  if (!window.JSZip) throw new Error('lib/jszip.min.js did not load. Keep the lib folder next to index.html.');
  const zip = await JSZip.loadAsync(buf);
  if (zip.file('META-INF/container.xml')) return parseEpub(zip);
  const f = Object.values(zip.files).find(f => /\.fb2$/i.test(f.name));
  if (f) return parseFb2(await f.async('arraybuffer'));
  throw new Error('no supported book inside this archive.');
}

function dispose() {
  if (io) io.disconnect();
  if (cur && cur.pdf) cur.pdf.destroy();
  cur = null;
}
function msg(t) {
  dispose();
  document.body.classList.remove('pdf');
  $('back').hidden = true; hideNote();
  book.innerHTML = '<p class="hint">' + esc(t) + '</p>';
  updateStatus();
}
function reset(key, title, kind) {
  dispose();
  cur = {key, title, kind, toc: [], blocks: [], pos: store.get('pos:' + key, 0)};
  document.body.classList.toggle('pdf', kind === 'pdf');
  $('title').textContent = title;
  document.title = title + ' — Reader';
  $('back').hidden = true; hideNote();
  view.scrollTop = 0;
}
function afterLoad() {
  cur.blocks = [...book.querySelectorAll(BLK)];
  markNotes(); renderToc(); renderNotes();
  view.scrollTop = cur.pos * (view.scrollHeight - view.clientHeight);
  view.focus(); updateStatus();
}
function showText(b, key, name) {
  reset(key, b.title || name, 'text');
  book.innerHTML = '';
  b.sections.forEach((s, i) => {
    const e = document.createElement('section');
    e.innerHTML = s.html;
    e.id = 'sec' + i;
    book.append(e);
    cur.toc.push({title: s.title, unit: i});
  });
  afterLoad();
}
async function load(file) {
  msg('Loading…');
  try {
    const buf = await file.arrayBuffer(), key = file.name + ':' + file.size;
    const ext = ((file.name.match(/\.([^.]+)$/) || [])[1] || '').toLowerCase();
    if (ext === 'pdf') return await showPdf(buf, key, file.name);
    let b;
    if (new Uint8Array(buf.slice(0, 2)).join() === '80,75') b = await parseZip(buf);
    else if (ext === 'fb2') b = parseFb2(buf);
    else if (/^x?html?$/.test(ext)) b = parseHtml(buf, file.name);
    else b = parseText(buf, file.name);
    showText(b, key, file.name);
  } catch (e) { console.error(e); msg('Could not open this file: ' + ((e && e.message) || e)); }
}

async function showPdf(buf, key, name) {
  if (!window.pdfjsLib) throw new Error('lib/pdf.min.js did not load. Keep the lib folder next to index.html.');
  const pdf = await pdfjsLib.getDocument({data: new Uint8Array(buf), worker: getWorker()}).promise;
  reset(key, name, 'pdf');
  cur.pdf = pdf;
  try {
    const t = ((await pdf.getMetadata()).info || {}).Title;
    if (t && !/^untitled/i.test(t)) { cur.title = t; $('title').textContent = t; }
  } catch {}
  await layoutPdf();
  loadOutline(cur);
  afterLoad();
}
async function layoutPdf() {
  const pdf = cur.pdf, f = fracPos();
  if (io) io.disconnect();
  const v1 = (await pdf.getPage(1)).getViewport({scale: 1});
  const w = Math.min(view.clientWidth - 24, 900) * cfg.size / 18, h1 = v1.height * w / v1.width;
  book.innerHTML = '';
  io = new IntersectionObserver(es => es.forEach(e => draw(e.target, e.isIntersecting)), {root: view, rootMargin: '1500px 0px'});
  for (let i = 1; i <= pdf.numPages; i++) {
    const d = h('div', 'page');
    d.dataset.n = i;
    d.style.cssText = 'width:' + w + 'px;height:' + h1 + 'px';
    book.append(d);
    io.observe(d);
  }
  view.scrollTop = f * (view.scrollHeight - view.clientHeight);
}
async function draw(d, on) {
  if (!on) { d.innerHTML = ''; return; }
  if (d.firstChild || d.busy) return;
  d.busy = true;
  try {
    const page = await cur.pdf.getPage(+d.dataset.n), r = window.devicePixelRatio || 1;
    const w = parseFloat(d.style.width), vp = page.getViewport({scale: w / page.getViewport({scale: 1}).width});
    const c = document.createElement('canvas');
    c.width = vp.width * r; c.height = vp.height * r;
    c.style.width = vp.width + 'px'; c.style.height = vp.height + 'px';
    d.style.height = vp.height + 'px';
    await page.render({canvasContext: c.getContext('2d'), viewport: vp, transform: r !== 1 ? [r, 0, 0, r, 0, 0] : null}).promise;
    if (!d.firstChild) d.append(c);
  } catch (e) { d.textContent = 'Could not render page ' + d.dataset.n + ': ' + (e.message || e); } finally { d.busy = false; }
}
async function loadOutline(mine) {
  try {
    const pdf = mine.pdf, o = await pdf.getOutline();
    if (!o) return;
    const walk = async (items, lvl) => {
      for (const it of items) {
        let d = it.dest;
        if (typeof d === 'string') d = await pdf.getDestination(d);
        if (d && d[0]) mine.toc.push({title: it.title, unit: await pdf.getPageIndex(d[0]), lvl});
        if (it.items && it.items.length) await walk(it.items, lvl + 1);
      }
    };
    await walk(o, 0);
    if (cur === mine) renderToc();
  } catch {}
}

function curUnit() {
  const u = book.children, y = view.scrollTop + 24 - book.offsetTop;
  let i = 0;
  while (i + 1 < u.length && u[i + 1].offsetTop <= y) i++;
  return i;
}
function jump(i) {
  const u = book.children[i];
  if (u) view.scrollTop = u.offsetTop + book.offsetTop;
}
function updateStatus() {
  const el = $('status');
  if (!cur) { el.textContent = ''; return; }
  const n = book.children.length;
  el.textContent = (cur.kind === 'pdf' ? 'Page ' : 'Section ') + (curUnit() + 1) + ' / ' + n + ' · ' + Math.round(fracPos() * 100) + '%';
}
function prev() {
  if (!cur) return;
  const i = curUnit(), u = book.children[i];
  jump(view.scrollTop > u.offsetTop + book.offsetTop + 40 ? i : Math.max(0, i - 1));
}
function next() { if (cur) jump(Math.min(book.children.length - 1, curUnit() + 1)); }
let tm;
view.addEventListener('scroll', () => {
  clearTimeout(tm);
  hideNote();
  tm = setTimeout(() => { updateStatus(); if (cur) store.set('pos:' + cur.key, fracPos()); }, 150);
});

function closePanel() { panel.hidden = true; view.focus(); }
function openPanel(t) {
  if (!panel.hidden && panel.dataset.t === t) return closePanel();
  panel.hidden = false; panel.dataset.t = t;
  $('tocList').hidden = t !== 'toc';
  $('notesBox').hidden = t !== 'notes';
  $('infoBox').hidden = t !== 'info';
  $('panelTitle').textContent = {toc: 'Contents', notes: 'Notes', info: 'About'}[t];
  if (t === 'notes') { draft = capture(); showDraft(); $('noteText').focus(); }
}
function renderToc() {
  const el = $('tocList');
  el.innerHTML = '';
  if (!cur || !cur.toc.length) { el.textContent = 'No contents.'; return; }
  cur.toc.forEach(t => {
    const b = h('button', 'item', t.title || '—');
    b.style.paddingLeft = 10 + (t.lvl || 0) * 14 + 'px';
    b.onclick = () => { closePanel(); jump(t.unit); };
    el.append(b);
  });
}

const mine = () => (cur && notes[cur.key] && notes[cur.key].list) || [];
function capture() {
  if (!cur) return null;
  if (cur.kind === 'pdf') { const i = curUnit(); return {quote: '', loc: i, label: 'Page ' + (i + 1)}; }
  const s = getSelection();
  let quote = '', blk = -1;
  if (s.rangeCount && !s.isCollapsed && view.contains(s.anchorNode)) {
    quote = s.toString().trim().replace(/\s+/g, ' ').slice(0, 400);
    const el = s.anchorNode.nodeType === 1 ? s.anchorNode : s.anchorNode.parentElement;
    const b = el && el.closest(BLK);
    blk = b ? cur.blocks.indexOf(b) : -1;
  }
  if (blk < 0) {
    quote = '';
    const top = view.getBoundingClientRect().top + 10;
    blk = cur.blocks.findIndex(b => b.getBoundingClientRect().bottom > top);
  }
  blk = Math.max(0, blk);
  const sec = cur.blocks[blk] && cur.blocks[blk].closest('#book > section');
  const si = [...book.children].indexOf(sec), t = cur.toc[si];
  return {quote, loc: blk, label: (t ? t.title + ' · ' : '') + Math.round(blk / Math.max(1, cur.blocks.length) * 100) + '%'};
}
function showDraft() {
  $('quote').textContent = !cur ? 'Open a book to take notes.' : draft ? draft.label + (draft.quote ? ' — “' + draft.quote + '”' : '') : '';
}
function saveNotes() { store.set('notes', notes); markNotes(); renderNotes(); }
function markNotes() {
  if (!cur || cur.kind === 'pdf') return;
  const set = new Set(mine().map(n => n.loc));
  cur.blocks.forEach((b, i) => b.classList.toggle('noted', set.has(i)));
}
function reveal(el) {
  view.scrollTop += el.getBoundingClientRect().top - view.getBoundingClientRect().top - 40;
  const t = el.tagName === 'SECTION' ? null : el.closest(BLK) || el;
  if (t && t !== book && t.textContent.length < 3000) { t.classList.add('flash'); setTimeout(() => t.classList.remove('flash'), 1500); }
}
function goNote(n) {
  closePanel();
  if (cur.kind === 'pdf') return jump(n.loc);
  if (cur.blocks[n.loc]) reveal(cur.blocks[n.loc]);
}
function renderNotes() {
  const el = $('noteList');
  el.innerHTML = '';
  mine().sort((a, b) => a.loc - b.loc).forEach(n => {
    const d = h('div', 'note');
    d.append(h('div', 'meta', n.label + ' · ' + String(n.date).slice(0, 10)));
    if (n.quote) d.append(h('blockquote', '', n.quote));
    d.append(h('div', '', n.text));
    const row = h('div', 'row');
    [['Go', () => goNote(n)],
     ['Edit', () => { const t = prompt('Edit note', n.text); if (t !== null && t.trim()) { n.text = t.trim(); saveNotes(); } }],
     ['Delete', () => { if (confirm('Delete this note?')) { notes[cur.key].list = notes[cur.key].list.filter(x => x !== n); saveNotes(); } }]
    ].forEach(([l, f]) => { const b = h('button', '', l); b.onclick = f; row.append(b); });
    d.append(row);
    el.append(d);
  });
}
$('save').onclick = () => {
  const text = $('noteText').value.trim();
  if (!cur || !text) return;
  const d = draft || capture();
  (notes[cur.key] ||= {title: cur.title, list: []}).list.push(
    Object.assign({id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), text, date: new Date().toISOString()}, d));
  $('noteText').value = '';
  saveNotes();
  draft = capture(); showDraft();
};

$('exp').onclick = () => {
  const a = h('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({app: 'reader-notes', version: 1, books: notes}, null, 2)], {type: 'application/json'}));
  a.download = 'reader-notes.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};
$('impBtn').onclick = () => $('imp').click();
$('imp').onchange = async e => {
  const f = e.target.files[0];
  e.target.value = '';
  if (!f) return;
  try {
    const books = JSON.parse(await f.text()).books || {};
    let added = 0;
    for (const [k, b] of Object.entries(books)) {
      const dst = notes[k] ||= {title: String(b.title || ''), list: []}, ids = new Set(dst.list.map(n => n.id));
      (b.list || []).forEach(n => {
        if (n && n.id && typeof n.text === 'string' && !ids.has(n.id)) {
          dst.list.push({id: String(n.id), text: n.text, quote: String(n.quote || ''), loc: +n.loc || 0, label: String(n.label || ''), date: String(n.date || '')});
          added++;
        }
      });
    }
    saveNotes();
    alert('Imported ' + added + ' note(s).');
  } catch { alert('Could not read this notes file.'); }
};

function hideNote() { fn.hidden = true; }
function noteBlock(a, el) {
  const isRef = a.dataset.note || isNoteLink(a);
  if (!isRef && !el.closest('aside,[epub\\:type*="note"],[role*="note"]')) return null;
  if (/^(SECTION|H[1-6])$/.test(el.tagName)) return null;
  const b = /^(P|LI|ASIDE|DD|BLOCKQUOTE|DIV)$/.test(el.tagName) ? el : el.closest('aside,li,p,dd,blockquote,div');
  return b && b !== book && b.textContent.length < 3000 ? b : null;
}
function showNote(a, blk) {
  const c = blk.cloneNode(true);
  c.querySelectorAll('a[data-to]').forEach(x => { if (x.textContent.trim().length <= 3) x.remove(); });
  [c, ...c.querySelectorAll('*')].forEach(x => { x.removeAttribute('id'); x.classList.remove('noted', 'flash'); });
  fn.replaceChildren(c);
  fn.hidden = false;
  const r = a.getBoundingClientRect(), w = fn.offsetWidth, hh = fn.offsetHeight;
  let top = r.bottom + 8;
  if (top + hh > innerHeight - 8) top = Math.max(8, r.top - hh - 8);
  fn.style.top = top + 'px';
  fn.style.left = Math.max(8, Math.min(r.left, innerWidth - w - 8)) + 'px';
}
document.addEventListener('click', e => {
  if (fn.contains(e.target)) return;
  hideNote();
  const a = e.target.closest && e.target.closest('#book a[data-to]');
  if (!a || !cur) return;
  e.preventDefault();
  const el = document.getElementById(a.dataset.to);
  if (!el) return;
  const blk = noteBlock(a, el);
  if (blk) return showNote(a, blk);
  cur.back = view.scrollTop;
  $('back').hidden = false;
  reveal(el);
});
$('back').onclick = () => { if (cur) view.scrollTop = cur.back; $('back').hidden = true; };

$('open').onclick = () => $('file').click();
$('file').onchange = e => { const f = e.target.files[0]; e.target.value = ''; if (f) load(f); };
addEventListener('dragover', e => e.preventDefault());
addEventListener('drop', e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) load(f); });
$('smaller').onclick = () => resize(-2);
$('bigger').onclick = () => resize(2);
$('theme').onclick = () => { cfg.dark = !cfg.dark; applyCfg(); };
$('font').onclick = () => {
  const f = fracPos(), o = face ? ['serif', 'sans', 'custom'] : ['serif', 'sans'];
  cfg.font = o[(o.indexOf(cfg.font) + 1) % o.length];
  applyCfg();
  view.scrollTop = f * (view.scrollHeight - view.clientHeight);
};

const idb = (mode, fn) => new Promise((res, rej) => {
  const r = indexedDB.open('reader', 1);
  r.onupgradeneeded = () => r.result.createObjectStore('kv');
  r.onerror = () => rej(r.error);
  r.onsuccess = () => {
    const tx = r.result.transaction('kv', mode), req = fn(tx.objectStore('kv'));
    tx.oncomplete = () => res(req && req.result);
    tx.onerror = tx.onabort = () => rej(tx.error);
  };
});
async function useFont(name, buf) {
  const f = new FontFace('ReaderCustom', buf.slice(0));
  await f.load();
  if (face) document.fonts.delete(face);
  document.fonts.add(face = f);
  customName = name;
  $('rmFont').hidden = false;
}
$('fontFile').onclick = () => $('fontInput').click();
$('fontInput').onchange = async e => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    const buf = await file.arrayBuffer();
    await useFont(file.name.replace(/\.[^.]+$/, ''), buf);
    cfg.font = 'custom';
    applyCfg();
    idb('readwrite', s => s.put({name: customName, buf}, 'font')).catch(() => {});
  } catch { alert('Could not load this font file. Use .ttf, .otf, .woff or .woff2.'); }
};
$('rmFont').onclick = () => {
  if (face) document.fonts.delete(face);
  face = null; customName = '';
  $('rmFont').hidden = true;
  if (cfg.font === 'custom') cfg.font = 'serif';
  applyCfg();
  idb('readwrite', s => s.delete('font')).catch(() => {});
};
idb('readonly', s => s.get('font')).then(v => v && useFont(v.name, v.buf)).catch(() => {})
  .then(() => { if (cfg.font === 'custom' && !face) cfg.font = 'serif'; applyCfg(); });
$('btnToc').onclick = () => openPanel('toc');
$('btnNotes').onclick = () => openPanel('notes');
$('btnInfo').onclick = () => openPanel('info');
$('close').onclick = closePanel;
$('prev').onclick = prev;
$('next').onclick = next;
$('status').onclick = () => {
  if (!cur) return;
  const n = parseInt(prompt('Go to ' + (cur.kind === 'pdf' ? 'page' : 'section') + ':'), 10);
  if (n > 0) jump(Math.min(n, book.children.length) - 1);
};
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'TEXTAREA') return;
  if (e.key === 'Escape') { hideNote(); closePanel(); }
  else if (e.key === 'ArrowRight') next();
  else if (e.key === 'ArrowLeft') prev();
});
applyCfg();
})();
