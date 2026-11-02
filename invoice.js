/* WebOuts "Submit an Invoice" page (webouts.com/invoice), deployed via GitHub + jsDelivr.
 * The Bricks page only holds a tiny loader (see invoice-loader.html).
 * The page serves the "live" branch, NOT main. Publish with:
 *   git push origin main:live --force-with-lease
 * No secrets here. Section 3 posts to the public ClockUp endpoint
 * /pub/invoice-builder (server/invoice-builder.js in the ClockUp repo). */
(function () {
  'use strict';

  var LIVE_API = 'https://live1-service-13475384-d7871bdd.us.monday.app/pub/invoice-builder';
  // ?api=<draft origin> lets us test against a ClockUp server draft before promote.
  // Only OUR app's hosts (account 13475384, app d7871bdd) are accepted, so a
  // crafted link cannot send someone's invoice to another server.
  var API = (function () {
    try {
      var o = new URLSearchParams(location.search).get('api');
      if (o && /^https:\/\/[a-z0-9]+-service-13475384-d7871bdd\.us\.monday\.app$/.test(o)) return o + '/pub/invoice-builder';
    } catch (e) { /* ignore */ }
    return LIVE_API;
  })();
  var FORM_URL = 'https://forms.monday.com/forms/embed/f1a09557ffe9f2b313cbdf05215c367f?r=use1';
  var BILL_TO = 'WebOuts LLC\nadenure@webouts.com';
  var ROLES = ['Camera', 'Audio', 'Hair & Makeup', 'Talent', 'Coach', 'Production Assistant', 'Video Editor', 'Colorist', 'Script Writer'];
  var MAX_LINES = 40;

  // The logo ships next to this script, so it loads from the same commit.
  var LOGO = (function () {
    var src = (document.currentScript && document.currentScript.src) || '';
    return src ? src.replace(/[^/]*$/, '') + 'webouts-logo.png' : 'https://cdn.jsdelivr.net/gh/WebOuts-Media/webouts-widgets@live/webouts-logo.png';
  })();

  var root = document.getElementById('wo-invoice-root');
  if (!root) return;

  // ---------- styles ----------
  var css = [
    '#wo-inv{--navy:#07378C;--orange:#E26337;--ink:#1f2430;--muted:#5b6472;--line:#e6e9ef;--soft:#f2f6ff;--zebra:#f6f8fb;--ok:#2F8F5C;',
    'font-family:"Poppins",Arial,Helvetica,sans-serif;color:var(--ink);max-width:1100px;margin:0 auto;padding:32px 16px 64px;box-sizing:border-box;line-height:1.55}',
    '#wo-inv *,#wo-inv *::before,#wo-inv *::after{box-sizing:border-box}',
    // The site theme caps heading widths (h2 ~698px, h3 ~436px) and adds flow
    // spacing; the doubled id outranks it so the page lays out the same anywhere.
    '#wo-inv#wo-inv :is(h1,h2,h3,p){max-width:none;text-align:inherit;text-wrap:wrap;letter-spacing:normal;padding:0}',
    '#wo-inv#wo-inv h1{font-size:clamp(28px,4vw,40px);color:var(--navy);margin:0 0 8px;font-weight:700;line-height:1.15}',
    '#wo-inv#wo-inv h2{font-size:24px;color:var(--navy);margin:0 0 6px;font-weight:700;line-height:1.25}',
    '#wo-inv#wo-inv h3{font-size:15px;color:var(--navy);margin:22px 0 10px;font-weight:600;line-height:1.35}',
    '#wo-inv#wo-inv p{margin:0 0 12px;font-size:15px;line-height:1.55}',
    '#wo-inv#wo-inv .lede{font-size:17px;color:var(--muted);max-width:720px}',
    '#wo-inv#wo-inv .done h2{margin:0 0 8px}',
    '#wo-inv .tax{display:flex;gap:12px;align-items:flex-start;background:#fff7f3;border:1px solid #f6d3c4;border-left:4px solid var(--orange);border-radius:10px;padding:14px 16px;margin:20px 0 28px;font-size:15px}',
    '#wo-inv .tax svg{flex:0 0 22px;margin-top:2px}',
    '#wo-inv .tax strong{color:var(--ink)}',
    '#wo-inv .paths{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:28px}',
    '#wo-inv .path{all:unset;cursor:pointer;display:flex;flex-direction:column;gap:6px;background:#fff;border:2px solid var(--line);border-radius:14px;padding:18px;transition:border-color .2s,box-shadow .2s;box-shadow:0 1px 3px rgba(16,24,40,.06)}',
    '#wo-inv .path:hover{border-color:#b9c6e4}',
    '#wo-inv .path:focus-visible{outline:3px solid var(--orange);outline-offset:2px}',
    '#wo-inv .path[aria-selected="true"]{border-color:var(--navy);box-shadow:0 4px 14px rgba(7,55,140,.12)}',
    '#wo-inv .path .num{font-size:12px;font-weight:600;color:var(--orange);letter-spacing:.06em;text-transform:uppercase}',
    '#wo-inv .path .t{font-size:17px;font-weight:600;color:var(--navy);line-height:1.3}',
    '#wo-inv .path .d{font-size:14px;color:var(--muted)}',
    // The theme makes every <section> a centered flex column with a ~62px gap.
    '#wo-inv#wo-inv .panel{display:block;gap:0;align-items:initial;margin:0;min-height:0;max-width:none;width:auto;padding:28px}',
    '#wo-inv .panel{background:#fff;border:1px solid var(--line);border-radius:14px;padding:28px;box-shadow:0 1px 3px rgba(16,24,40,.06)}',
    '#wo-inv .panel[hidden]{display:none}',
    '#wo-inv .formframe{width:100%;height:760px;border:0;border-radius:10px;background:var(--zebra)}',
    '#wo-inv ul.need{list-style:none;padding:0;margin:0 0 8px;display:grid;gap:10px}',
    '#wo-inv ul.need li{display:flex;gap:10px;align-items:flex-start}',
    '#wo-inv ul.need li svg{flex:0 0 18px;margin-top:4px}',
    '#wo-inv .billto{display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:space-between;background:var(--soft);border-radius:10px;padding:16px 18px;margin:8px 0 16px}',
    '#wo-inv#wo-inv .billto{display:flex;flex-direction:row;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px 16px;text-align:left}',
    '#wo-inv#wo-inv .billto .bt{flex:1 1 auto;min-width:0;margin:0;font:inherit;font-size:16px;font-weight:500;color:var(--ink);white-space:pre-line;background:none;padding:0}',
    '#wo-inv .btn{all:unset;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;font-weight:600;font-size:15px;padding:11px 20px;border-radius:9px;transition:filter .2s,background .2s;text-align:center}',
    '#wo-inv .btn:focus-visible{outline:3px solid var(--orange);outline-offset:2px}',
    '#wo-inv .btn.primary{background:var(--orange);color:#fff}',
    '#wo-inv .btn.primary:hover{filter:brightness(.94)}',
    '#wo-inv .btn.primary[disabled]{opacity:.55;cursor:default}',
    '#wo-inv .btn.secondary{background:var(--navy);color:#fff}',
    '#wo-inv .btn.ghost{color:var(--navy);border:1px solid #c9d3ea;background:#fff}',
    '#wo-inv .btn.small{font-size:14px;padding:8px 14px}',
    '#wo-inv .builder{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);column-gap:28px;align-items:start}',
    '#wo-inv .builder .fields{grid-column:1;grid-row:1}#wo-inv .builder .send{grid-column:1;grid-row:2}#wo-inv .builder .previewwrap{grid-column:2;grid-row:1 / span 2}',
    '#wo-inv .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}',
    '#wo-inv label.f{display:block;font-size:13px;font-weight:600;color:var(--ink);margin-bottom:12px}',
    '#wo-inv [hidden]{display:none !important}',
    '#wo-inv label.f .opt{font-weight:400;color:var(--muted)}',
    '#wo-inv label.f .hint{display:block;font-weight:400;color:var(--muted);font-size:12px;margin-top:3px}',
    '#wo-inv input,#wo-inv textarea,#wo-inv select{display:block;width:100%;margin-top:5px;font:inherit;font-size:15px;color:var(--ink);background:#fff;border:1px solid #cfd6e2;border-radius:8px;padding:10px 12px}',
    '#wo-inv textarea{min-height:76px;resize:vertical}',
    '#wo-inv input:focus,#wo-inv textarea:focus{outline:none;border-color:var(--navy);box-shadow:0 0 0 3px rgba(7,55,140,.15)}',
    '#wo-inv .bad{border-color:#c0392b !important;box-shadow:0 0 0 3px rgba(192,57,43,.12) !important}',
    '#wo-inv .seg{display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 12px}',
    '#wo-inv .seg label{flex:1 1 180px;display:flex;gap:10px;align-items:flex-start;border:1px solid #cfd6e2;border-radius:10px;padding:12px;cursor:pointer;font-size:14px}',
    '#wo-inv .seg label:has(input:checked){border-color:var(--navy);background:var(--soft)}',
    '#wo-inv .seg input{width:auto;margin:3px 0 0}',
    '#wo-inv .seg b{display:block;color:var(--navy)}',
    '#wo-inv .line{border:1px solid var(--line);border-radius:10px;padding:14px 14px 2px;margin-bottom:10px;position:relative;background:#fff}',
    '#wo-inv .line .rm{all:unset;cursor:pointer;position:absolute;top:8px;right:10px;color:var(--muted);font-size:13px;padding:4px}',
    '#wo-inv .line .rm:hover{color:#c0392b}',
    '#wo-inv .line .ln{font-size:12px;font-weight:600;color:var(--orange);letter-spacing:.05em;text-transform:uppercase;margin-bottom:6px}',
    '#wo-inv .ack{display:flex;gap:10px;align-items:flex-start;font-size:14px;background:#fff7f3;border:1px solid #f6d3c4;border-radius:10px;padding:12px;margin:16px 0}',
    '#wo-inv .ack input{width:auto;margin:3px 0 0;flex:0 0 auto}',
    '#wo-inv .hp{position:absolute !important;left:-9999px !important;width:1px;height:1px;overflow:hidden}',
    '#wo-inv#wo-inv .err{color:#c0392b;font-size:14px;margin:10px 0 0;min-height:1em}',
    '#wo-inv .previewwrap{position:sticky;top:24px}',
    '#wo-inv .previewlabel{font-size:12px;font-weight:600;color:var(--muted);letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px}',
    // Paper preview, modelled on the PDF ClockUp renders (server/invoice-pdf.js).
    '#wo-inv .paper{background:#fff;border:1px solid var(--line);border-radius:6px;box-shadow:0 8px 28px rgba(16,24,40,.10);padding:26px 24px;font-size:11px;color:#1a1d23;aspect-ratio:8.5/11;overflow:hidden;display:flex;flex-direction:column}',
    '#wo-inv .paper .ph{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid var(--orange);padding-bottom:10px;margin-bottom:14px}',
    '#wo-inv .paper .logo{display:block;width:29%;max-width:150px;height:auto}',
    '#wo-inv .paper .title{text-align:right;color:#224094;font-weight:700;font-size:22px;line-height:1}',
    '#wo-inv .paper .no{font-size:9px;color:#5f6775;font-weight:400;margin-top:4px}',
    '#wo-inv .paper .parties{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:12px}',
    '#wo-inv .paper .cap{font-size:7.5px;font-weight:600;color:#5f6775;letter-spacing:.06em;text-transform:uppercase}',
    '#wo-inv .paper .pn{font-size:12px;font-weight:500;margin:2px 0}',
    '#wo-inv .paper .pd{color:#5f6775;font-size:9.5px;white-space:pre-line;word-break:break-all}',
    '#wo-inv .paper .meta{display:grid;grid-template-columns:repeat(3,1fr);background:#f6f8fb;border-radius:5px;padding:6px 10px;margin-bottom:12px}',
    '#wo-inv .paper .meta b{display:block;color:#224094;font-weight:500;font-size:10px}',
    '#wo-inv .paper .cl{background:#f6f8fb;border-radius:4px;color:#224094;font-weight:600;font-size:10px;padding:4px 8px;margin:6px 0 2px}',
    '#wo-inv .paper table{width:100%;border-collapse:collapse;font-size:9.5px}',
    '#wo-inv .paper th{font-size:7px;color:#5f6775;font-weight:600;letter-spacing:.06em;text-align:left;padding:4px 6px;border-bottom:1px solid #e2e6ed;text-transform:uppercase}',
    '#wo-inv .paper td{padding:5px 6px;vertical-align:top}',
    '#wo-inv .paper td.m{color:#5f6775;white-space:nowrap}',
    '#wo-inv .paper .r{text-align:right;white-space:nowrap}',
    '#wo-inv .paper .tot{display:flex;justify-content:space-between;align-items:center;margin-top:12px}',
    '#wo-inv .paper .box{background:#224094;color:#fff;border-radius:5px;padding:8px 12px;display:flex;gap:24px;align-items:center;font-size:10px;font-weight:600}',
    '#wo-inv .paper .box b{font-size:15px}',
    '#wo-inv .paper .foot{margin-top:auto;border-top:1px solid #e2e6ed;padding-top:6px;text-align:center;color:#5f6775;font-size:7.5px}',
    '#wo-inv .paper .empty{color:#9aa3b2;font-style:italic;padding:8px 6px}',
    '#wo-inv .done{text-align:center;padding:12px 0}',
    '#wo-inv .done svg{margin-bottom:8px}',
    '#wo-inv .done .acts{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin:16px 0}',
    '#wo-inv .pdfframe{width:100%;height:720px;border:1px solid var(--line);border-radius:8px;margin-top:8px}',
    '@media (max-width:860px){#wo-inv .builder{grid-template-columns:1fr}#wo-inv .builder .fields,#wo-inv .builder .send,#wo-inv .builder .previewwrap{grid-column:1;grid-row:auto}#wo-inv .previewwrap{margin-top:12px}#wo-inv .previewwrap{position:static}#wo-inv .pdfframe{display:none}}',
    '@media (max-width:720px){#wo-inv .paths{grid-template-columns:1fr}#wo-inv#wo-inv .panel{padding:20px 16px}#wo-inv .grid2{grid-template-columns:1fr}#wo-inv .formframe{height:820px}}',
    '@media (max-width:480px){#wo-inv .paper{aspect-ratio:auto;min-height:420px;padding:18px 14px}#wo-inv .paper .parties{grid-template-columns:1fr}}'
  ].join('\n');
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  // ---------- helpers ----------
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k]; // static strings only
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c != null) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function usd(n) { return '$' + (Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function fmtDay(iso) { var p = iso.split('-').map(Number); return MON[p[1] - 1] + ' ' + p[2] + ', ' + p[0]; }
  function todayIso() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function periodOf(dates) {
    var s = dates.slice().sort(); if (!s.length) return '';
    var a = s[0], b = s[s.length - 1];
    if (a.slice(0, 7) === b.slice(0, 7)) return MONTH[Number(a.slice(5, 7)) - 1] + ' ' + a.slice(0, 4);
    var fa = fmtDay(a), fb = fmtDay(b);
    return (a.slice(0, 4) === b.slice(0, 4) ? fa.replace(/, \d{4}$/, '') : fa) + ' - ' + fb;
  }
  function lastName(n) { var p = String(n || '').trim().split(/\s+/); return (p[p.length - 1] || '').replace(/[^A-Za-z0-9'-]/g, '') || 'Subcontractor'; }
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); });
  }
  var ICON = {
    check: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2F8F5C" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    info: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E26337" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
    done: '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#2F8F5C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/></svg>'
  };

  // ---------- page shell ----------
  var wrap = el('div', { id: 'wo-inv' });
  wrap.appendChild(el('h1', { text: 'Submit an Invoice' }));
  wrap.appendChild(el('p', { class: 'lede', text: 'Thanks for working with WebOuts. Pick the option that fits you best. All three get your invoice to the same place.' }));

  var tax = el('div', { class: 'tax', role: 'note' });
  tax.innerHTML = ICON.info + '<div><strong>WebOuts does not withhold taxes for sub-contractors.</strong> You work with us as an independent contractor, so you are responsible for your own income and self-employment taxes. If we pay you over the IRS reporting threshold in a calendar year, we send you a 1099-NEC, so we need a <strong>W-9</strong> from you on file before we can pay you. Questions? <a href="mailto:adenure@webouts.com" style="color:#07378C">adenure@webouts.com</a></div>';
  wrap.appendChild(tax);

  var PATHS = [
    { id: 'upload', num: 'Option 1', t: "I've invoiced WebOuts before", d: 'Upload your invoice PDF. Takes a minute.' },
    { id: 'details', num: 'Option 2', t: 'I have my own invoicing system', d: 'See what your invoice needs and our billing details.' },
    { id: 'builder', num: 'Option 3', t: 'Make my invoice for me', d: 'Fill in the blanks and we create the invoice, email you a copy and submit it.' }
  ];
  var pathBar = el('div', { class: 'paths', role: 'tablist', 'aria-label': 'How do you want to submit?' });
  var panels = {};
  PATHS.forEach(function (p) {
    pathBar.appendChild(el('button', { class: 'path', role: 'tab', id: 'wo-tab-' + p.id, 'aria-controls': 'wo-panel-' + p.id, 'aria-selected': 'false', 'data-id': p.id, onclick: function () { show(p.id, true); } }, [
      el('span', { class: 'num', text: p.num }), el('span', { class: 't', text: p.t }), el('span', { class: 'd', text: p.d })
    ]));
  });
  wrap.appendChild(pathBar);

  // ---------- Option 1: Monday form ----------
  panels.upload = el('section', { class: 'panel', id: 'wo-panel-upload', role: 'tabpanel', 'aria-labelledby': 'wo-tab-upload', hidden: '' }, [
    el('h2', { text: 'Upload your invoice' }),
    el('p', { text: 'Enter your name and attach your invoice as a PDF. Not sure your invoice has everything? Check Option 2 first.' }),
    el('iframe', { class: 'formframe', title: 'Submit an Invoice form', loading: 'lazy', 'data-src': FORM_URL }),
    el('p', { style: 'font-size:13px;color:#5b6472;margin-top:10px' }, ['Form not loading? ', el('a', { href: 'https://wkf.ms/4aRjQaX', target: '_blank', rel: 'noopener', style: 'color:#07378C', text: 'Open it in a new tab' }), '.'])
  ]);

  // ---------- Option 2: requirements ----------
  var NEED = [
    ['Your legal name or business name', 'Whoever the check or payment should go to. This is also the name on your 1099.'],
    ['Your contact info', 'Email and phone, plus your mailing address if you want a paper check.'],
    ['An invoice number and the invoice date', 'Any numbering works, as long as you never reuse a number.'],
    ['Bill To: WebOuts LLC', 'Use the billing details above.'],
    ['One line for each job', 'The client or project (e.g. Orlando Health, Dr. Smith profile), your role, the date of the work, and the amount.'],
    ['The total amount due', 'In US dollars.'],
    ['How you want to be paid', 'Either a check (who it is payable to plus a mailing address) or a payment link we can pay without making an account, such as a PayPal or Stripe link.'],
    ['A W-9 on file with us', 'Send it once; we keep it for future invoices. Without it we cannot pay you.']
  ];
  var needList = el('ul', { class: 'need' });
  NEED.forEach(function (n) {
    var li = el('li'); li.innerHTML = ICON.check;
    li.appendChild(el('div', null, [el('strong', { text: n[0] }), el('div', { style: 'color:#5b6472;font-size:14px', text: n[1] })]));
    needList.appendChild(li);
  });
  var copyBtn = el('button', { class: 'btn ghost small', type: 'button', text: 'Copy billing details', onclick: function () {
    var done = function () { copyBtn.textContent = 'Copied'; setTimeout(function () { copyBtn.textContent = 'Copy billing details'; }, 1800); };
    if (navigator.clipboard) navigator.clipboard.writeText(BILL_TO).then(done, function () {}); else done();
  } });
  panels.details = el('section', { class: 'panel', id: 'wo-panel-details', role: 'tabpanel', 'aria-labelledby': 'wo-tab-details', hidden: '' }, [
    el('h2', { text: 'What your invoice needs' }),
    el('p', { text: 'Use your own system. Just make sure your invoice includes everything below, save it as a PDF, and upload it.' }),
    el('h3', { text: 'Bill to' }),
    el('div', { class: 'billto' }, [el('div', { class: 'bt', text: BILL_TO }), copyBtn]),
    el('h3', { text: 'Checklist' }),
    needList,
    el('div', { style: 'margin-top:20px' }, [el('button', { class: 'btn primary', type: 'button', text: 'Upload my invoice', onclick: function () { show('upload', true); } })])
  ]);

  // ---------- Option 3: builder ----------
  var state = { submissionId: uuid(), busy: false, pdfUrl: null };
  function field(label, input, opts) {
    opts = opts || {};
    return el('label', { class: 'f' }, [label, opts.optional ? el('span', { class: 'opt', text: ' (optional)' }) : null, input, opts.hint ? el('span', { class: 'hint', text: opts.hint }) : null]);
  }
  var f = {
    name: el('input', { type: 'text', autocomplete: 'name', maxlength: '120', placeholder: 'Jamie Rivera' }),
    email: el('input', { type: 'email', autocomplete: 'email', maxlength: '200', placeholder: 'you@example.com' }),
    phone: el('input', { type: 'tel', autocomplete: 'tel', maxlength: '40', placeholder: '(555) 555-5555' }),
    payableTo: el('input', { type: 'text', maxlength: '120', placeholder: 'Your name or business' }),
    address: el('textarea', { autocomplete: 'street-address', maxlength: '300', placeholder: '123 Main St\nAppleton, WI 54911' }),
    link: el('input', { type: 'url', maxlength: '500', placeholder: 'https://paypal.me/yourname' }),
    invoiceNumber: el('input', { type: 'text', maxlength: '40', placeholder: 'We make one if you leave this blank' }),
    notes: el('textarea', { maxlength: '1000', placeholder: 'Anything we should know' }),
    ack: el('input', { type: 'checkbox' }),
    hp: el('input', { type: 'text', tabindex: '-1', autocomplete: 'off', name: 'website' })
  };
  var mCheck = el('input', { type: 'radio', name: 'wo-pay', value: 'check', checked: '' });
  var mDigital = el('input', { type: 'radio', name: 'wo-pay', value: 'digital' });
  var addrWrap = field('Mailing address for the check', f.address);
  var linkWrap = field('Payment link', f.link, { hint: 'Must start with https:// and let us pay without creating an account.' });
  linkWrap.hidden = true;
  function method() { return mDigital.checked ? 'digital' : 'check'; }
  function syncMethod() { addrWrap.hidden = method() !== 'check'; linkWrap.hidden = method() !== 'digital'; render(); }
  mCheck.addEventListener('change', syncMethod); mDigital.addEventListener('change', syncMethod);

  var linesBox = el('div');
  var lines = [];
  function addLine() {
    if (lines.length >= MAX_LINES) return;
    var L = {
      client: el('input', { type: 'text', autocomplete: 'off', maxlength: '80', placeholder: 'e.g. Orlando Health' }),
      project: el('input', { type: 'text', maxlength: '200', placeholder: 'e.g. Profile filming, Dr. Smith' }),
      roleSel: el('select', null, [el('option', { value: '', text: 'Choose a role' })].concat(ROLES.map(function (r) { return el('option', { value: r, text: r }); }), [el('option', { value: 'other', text: 'Other' })])),
      roleOther: el('input', { type: 'text', autocomplete: 'off', maxlength: '40', placeholder: 'Type your role', hidden: '' }),
      date: el('input', { type: 'date', max: todayIso() }),
      amount: el('input', { type: 'number', inputmode: 'decimal', min: '0.01', step: '0.01', placeholder: '0.00' })
    };
    L.node = el('div', { class: 'line' }, [
      el('div', { class: 'ln' }),
      el('button', { class: 'rm', type: 'button', text: 'Remove', 'aria-label': 'Remove this line', onclick: function () {
        if (lines.length === 1) return;
        lines.splice(lines.indexOf(L), 1); L.node.remove(); renumber(); render();
      } }),
      el('div', { class: 'grid2' }, [field('Client', L.client, { optional: true }), field('Your role', el('div', null, [L.roleSel, L.roleOther]), { optional: true })]),
      field('What you did', L.project),
      el('div', { class: 'grid2' }, [field('Date of the work', L.date), field('Amount (USD)', L.amount)])
    ]);
    L.roleSel.addEventListener('change', function () {
      L.roleOther.hidden = L.roleSel.value !== 'other';
      if (!L.roleOther.hidden) L.roleOther.focus();
      render();
    });
    ['client', 'project', 'roleOther', 'date', 'amount'].forEach(function (k) { L[k].addEventListener('input', render); });
    lines.push(L); linesBox.appendChild(L.node); renumber(); render();
  }
  function renumber() {
    lines.forEach(function (L, i) {
      L.node.querySelector('.ln').textContent = 'Line ' + (i + 1);
      L.node.querySelector('.rm').style.display = lines.length > 1 ? '' : 'none';
    });
    addBtn.style.display = lines.length >= MAX_LINES ? 'none' : '';
  }
  var addBtn = el('button', { class: 'btn ghost small', type: 'button', text: '+ Add another line', onclick: function () { addLine(); lines[lines.length - 1].client.focus(); } });

  var errBox = el('p', { class: 'err', role: 'alert' });
  var submitBtn = el('button', { class: 'btn primary', type: 'submit', text: 'Send my invoice' });
  var fields = el('div', { class: 'fields' }, [
    el('h3', { text: '1. About you' }),
    field('Your full name', f.name),
    el('div', { class: 'grid2' }, [field('Email', f.email, { hint: 'We send your copy here.' }), field('Phone', f.phone, { optional: true })]),
    el('h3', { text: '2. How you want to be paid' }),
    el('div', { class: 'seg', role: 'radiogroup' }, [
      el('label', null, [mCheck, el('span', null, [el('b', { text: 'Paper check' }), 'Mailed to you'])]),
      el('label', null, [mDigital, el('span', null, [el('b', { text: 'Payment link' }), 'PayPal, Stripe or similar'])])
    ]),
    field('Make payment out to', f.payableTo, { optional: true, hint: 'Leave blank to use your name. Use your business name if you have one.' }),
    addrWrap, linkWrap,
    el('h3', { text: '3. The work' }),
    linesBox, addBtn,
    el('h3', { text: '4. Extras' }),
    field('Your invoice number', f.invoiceNumber, { optional: true }),
    field('Notes', f.notes, { optional: true }),
    el('label', { class: 'hp', 'aria-hidden': 'true' }, ['Website', f.hp])
  ]);
  var sendArea = el('div', { class: 'send' }, [
    el('label', { class: 'ack' }, [f.ack, el('span', { text: 'I understand WebOuts does not withhold taxes, that I may receive a 1099-NEC, and that WebOuts needs my W-9 on file before paying me.' })]),
    submitBtn, errBox
  ]);
  ['name', 'email', 'payableTo', 'address', 'link', 'invoiceNumber'].forEach(function (k) { f[k].addEventListener('input', render); });

  var paper = el('div', { class: 'paper', 'aria-label': 'Invoice preview' });
  // The form IS the grid: fields + send on the left, preview on the right; on a
  // phone it stacks in DOM order, so the preview sits above the Send button.
  var form = el('form', { class: 'builder', novalidate: '' }, [fields, el('div', { class: 'previewwrap' }, [el('div', { class: 'previewlabel', text: 'Live preview' }), paper]), sendArea]);
  var builderBody = form;
  var donePane = el('div', { hidden: '' });
  panels.builder = el('section', { class: 'panel', id: 'wo-panel-builder', role: 'tabpanel', 'aria-labelledby': 'wo-tab-builder', hidden: '' }, [
    el('h2', { text: 'Make my invoice' }),
    el('p', { text: 'Fill in the blanks and watch your invoice build in the preview. When you send it, we email you a PDF copy and it goes straight to our billing team.' }),
    builderBody, donePane
  ]);

  // ---------- preview ----------
  function readLines() {
    return lines.map(function (L) {
      return { client: L.client.value.trim(), project: L.project.value.trim(), role: L.roleSel.value === 'other' ? L.roleOther.value.trim() : L.roleSel.value, date: L.date.value, amount: L.amount.value === '' ? NaN : Number(L.amount.value) };
    });
  }
  function render() {
    var name = f.name.value.trim();
    var payee = f.payableTo.value.trim() || name || 'Your name';
    var dig = method() === 'digital';
    var ls = readLines().filter(function (l) { return l.project || l.amount > 0; });
    var dated = ls.filter(function (l) { return /^\d{4}-\d{2}-\d{2}$/.test(l.date); });
    var total = ls.reduce(function (s, l) { return s + (l.amount > 0 ? Math.round(l.amount * 100) / 100 : 0); }, 0);
    var today = todayIso();
    var number = f.invoiceNumber.value.trim().replace(/[^A-Za-z0-9#._-]/g, '') || (lastName(name) + '-' + today + '-#1');
    var period = periodOf(dated.map(function (l) { return l.date; })) || '';

    paper.textContent = '';
    paper.appendChild(el('div', { class: 'ph' }, [
      el('img', { class: 'logo', src: LOGO, alt: 'WebOuts' }),
      el('div', { class: 'title' }, ['INVOICE', el('div', { class: 'no', text: number })])
    ]));
    var detail = dig ? (f.link.value.trim() || 'Payment link') : (f.address.value.trim() || 'Mailing address');
    paper.appendChild(el('div', { class: 'parties' }, [
      el('div', null, [el('div', { class: 'cap', text: dig ? 'Contractor (pay via link)' : 'Contractor (make check payable to)' }), el('div', { class: 'pn', text: payee }), el('div', { class: 'pd', text: detail })]),
      el('div', null, [el('div', { class: 'cap', text: 'Bill to' }), el('div', { class: 'pn', text: 'WebOuts LLC' }), el('div', { class: 'pd', text: 'adenure@webouts.com' })])
    ]));
    paper.appendChild(el('div', { class: 'meta' }, [
      el('div', null, [el('span', { class: 'cap', text: 'Issue date' }), el('b', { text: today })]),
      el('div', null, [el('span', { class: 'cap', text: 'Pay period' }), el('b', { text: period || '-' })]),
      el('div', null, [el('span', { class: 'cap', text: 'Status' }), el('b', { text: 'Submitted' })])
    ]));
    if (!ls.length) {
      paper.appendChild(el('div', { class: 'empty', text: 'Your work lines show up here.' }));
    } else {
      var groups = {};
      ls.slice().sort(function (a, b) { return (a.date || '').localeCompare(b.date || ''); }).forEach(function (l) {
        var k = l.client || 'WebOuts'; (groups[k] = groups[k] || []).push(l);
      });
      var names = Object.keys(groups).sort(function (a, b) { return a.localeCompare(b); });
      names.forEach(function (k) {
        paper.appendChild(el('div', { class: 'cl', text: k }));
        var tb = el('tbody');
        groups[k].forEach(function (l) {
          tb.appendChild(el('tr', null, [
            el('td', { text: l.project || '-' }), el('td', { class: 'm', text: l.role }),
            el('td', { class: 'm', text: /^\d{4}-\d{2}-\d{2}$/.test(l.date) ? fmtDay(l.date) : '' }),
            el('td', { class: 'r', text: l.amount > 0 ? usd(l.amount) : '' })
          ]));
        });
        paper.appendChild(el('table', null, [el('thead', null, [el('tr', null, [el('th', { text: 'Project' }), el('th', { text: 'Role' }), el('th', { text: 'Completed' }), el('th', { class: 'r', text: 'Amount' })])]), tb]));
      });
    }
    paper.appendChild(el('div', { class: 'tot' }, [
      el('span', { style: 'color:#5f6775;font-size:9.5px', text: ls.length + ' item' + (ls.length === 1 ? '' : 's') + (period ? ' • ' + period : '') }),
      el('div', { class: 'box' }, ['TOTAL DUE', el('b', { text: usd(total) })])
    ]));
    paper.appendChild(el('div', { class: 'foot', text: 'Approved electronically by ' + (name || 'you') + ' on ' + today + '.  Generated by WebOuts LLC. Questions: adenure@webouts.com' }));
  }

  // ---------- submit ----------
  var ERR = {
    'name-required': 'Please enter your full name.',
    'email-invalid': 'Please enter a valid email address so we can send your copy.',
    'payable-to-required': 'Please enter who the payment should go to.',
    'address-required': 'Please enter the mailing address for your check.',
    'link-required': 'Please enter your payment link.',
    'link-invalid': 'That payment link does not look right. Paste the full link, starting with https://.',
    'link-not-https': 'Your payment link must start with https://.',
    'tax-ack-required': 'Please check the box to confirm you understand the tax note.',
    'lines-required': 'Please add at least one line of work.',
    'too-many-lines': 'That is more than 40 lines. Please split it into two invoices.',
    'line-project-required': 'Each line needs a short description of the work.',
    'line-date-invalid': 'Each line needs the date of the work (today or earlier).',
    'line-amount-invalid': 'Each line needs an amount above $0.',
    'total-too-high': 'That total is higher than this form accepts. Please email adenure@webouts.com.',
    'rate-limited': 'Too many invoices from this connection in the last hour. Please try again later or email adenure@webouts.com.',
    'busy': 'The invoice form is busy right now. Please try again later or email adenure@webouts.com.',
    'in-progress': 'Your invoice is still sending. Give it a few seconds before trying again.',
    'duplicate': 'This invoice was already sent. Reload the page to start a new one.'
  };
  function clearBad() { Array.prototype.forEach.call(form.querySelectorAll('.bad'), function (n) { n.classList.remove('bad'); }); }
  function markBad(code, field) {
    var t = null;
    if (field === 'name') t = f.name; else if (field === 'email') t = f.email;
    else if (field === 'payment') t = code === 'address-required' ? f.address : (code === 'payable-to-required' ? f.payableTo : f.link);
    else if (field === 'taxAck') t = f.ack;
    else if (field && field.indexOf('lines.') === 0) {
      var L = lines[Number(field.split('.')[1])];
      if (L) t = code === 'line-project-required' ? L.project : (code === 'line-date-invalid' ? L.date : L.amount);
    }
    if (t) { t.classList.add('bad'); t.focus(); }
  }
  // Same checks as the server, so most mistakes are caught before a round trip.
  function localCheck(p) {
    if (!p.name) return ['name-required', 'name'];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(p.email)) return ['email-invalid', 'email'];
    if (p.paymentMethod === 'check' && !p.address) return ['address-required', 'payment'];
    if (p.paymentMethod === 'digital') {
      if (!p.paymentLink) return ['link-required', 'payment'];
      if (!/^https:\/\//i.test(p.paymentLink)) return ['link-not-https', 'payment'];
    }
    var today = todayIso();
    for (var i = 0; i < p.lines.length; i++) {
      var l = p.lines[i];
      if (!l.project) return ['line-project-required', 'lines.' + i];
      if (!/^\d{4}-\d{2}-\d{2}$/.test(l.date) || l.date > today) return ['line-date-invalid', 'lines.' + i];
      if (!(l.amount > 0)) return ['line-amount-invalid', 'lines.' + i];
    }
    if (!p.taxAck) return ['tax-ack-required', 'taxAck'];
    return null;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (state.busy) return;
    clearBad(); errBox.textContent = '';
    var p = {
      submissionId: state.submissionId,
      website: f.hp.value,
      name: f.name.value.trim(), email: f.email.value.trim(), phone: f.phone.value.trim(),
      paymentMethod: method(), payableTo: f.payableTo.value.trim(),
      address: method() === 'check' ? f.address.value.trim() : '',
      paymentLink: method() === 'digital' ? f.link.value.trim() : '',
      invoiceNumber: f.invoiceNumber.value.trim(), notes: f.notes.value.trim(),
      taxAck: f.ack.checked,
      lines: readLines()
    };
    var bad = localCheck(p);
    if (bad) { errBox.textContent = ERR[bad[0]]; markBad(bad[0], bad[1]); return; }

    state.busy = true; submitBtn.disabled = true; submitBtn.textContent = 'Sending...';
    fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) })
      .then(function (r) { return r.json().catch(function () { return { ok: false, error: 'server-error' }; }); })
      .then(function (res) {
        if (!res || !res.ok) {
          errBox.textContent = ERR[res && res.error] || 'Something went wrong on our side and your invoice was NOT sent. Please try again in a minute, or email adenure@webouts.com.';
          if (res && res.field) markBad(res.error, res.field);
          return;
        }
        showDone(res, p);
      })
      .catch(function () {
        errBox.textContent = 'We could not reach our server, so your invoice was NOT sent. Check your connection and try again.';
      })
      .then(function () { state.busy = false; submitBtn.disabled = false; submitBtn.textContent = 'Send my invoice'; });
  });

  function showDone(res, p) {
    if (state.pdfUrl) URL.revokeObjectURL(state.pdfUrl);
    var bin = atob(res.pdfBase64 || ''), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    state.pdfUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
    var fname = String(res.invoiceNumber || 'invoice').replace(/[^A-Za-z0-9._-]/g, '') + '.pdf';

    builderBody.hidden = true;
    donePane.hidden = false;
    donePane.textContent = '';
    var head = el('div', { class: 'done' });
    head.innerHTML = ICON.done;
    head.appendChild(el('h2', { text: 'Invoice sent' }));
    head.appendChild(el('p', { text: 'Invoice ' + res.invoiceNumber + ' is with our billing team. ' + (res.emailed === false
      ? 'We could not email your copy, so please download it below and keep it for your records.'
      : 'A PDF copy is on its way to ' + p.email + '.') }));
    head.appendChild(el('div', { class: 'acts' }, [
      el('a', { class: 'btn primary', href: state.pdfUrl, download: fname, text: 'Download my PDF' }),
      el('button', { class: 'btn ghost', type: 'button', text: 'Make another invoice', onclick: resetBuilder })
    ]));
    head.appendChild(el('p', { style: 'font-size:14px;color:#5b6472', text: 'Reminder: WebOuts does not withhold taxes, and we need your W-9 on file before we can pay you. Reply to the email if you have not sent one yet.' }));
    donePane.appendChild(head);
    donePane.appendChild(el('iframe', { class: 'pdfframe', title: 'Your invoice PDF', src: state.pdfUrl }));
    panels.builder.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function resetBuilder() {
    state.submissionId = uuid();
    lines.slice().forEach(function (L) { L.node.remove(); });
    lines.length = 0;
    f.invoiceNumber.value = ''; f.notes.value = ''; f.ack.checked = false;
    addLine();
    donePane.hidden = true; builderBody.hidden = false;
    panels.builder.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ---------- tabs ----------
  function show(id, scroll) {
    PATHS.forEach(function (p) {
      var on = p.id === id;
      panels[p.id].hidden = !on;
      document.getElementById('wo-tab-' + p.id).setAttribute('aria-selected', on ? 'true' : 'false');
    });
    if (id === 'upload') {
      var fr = panels.upload.querySelector('iframe');
      if (!fr.src) fr.src = fr.getAttribute('data-src');
    }
    try { history.replaceState(null, '', '#' + id); } catch (e) { /* ignore */ }
    if (scroll) panels[id].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  wrap.appendChild(panels.upload);
  wrap.appendChild(panels.details);
  wrap.appendChild(panels.builder);
  root.appendChild(wrap);
  addLine();
  render();
  var start = (location.hash || '').replace('#', '');
  if (panels[start]) show(start, false);
})();
