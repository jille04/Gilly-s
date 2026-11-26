/* Gilly's administration portal */
(() => {
  'use strict';

  const FILE = location.protocol === 'file:';
  const ROOT = new URL('../', document.currentScript.src);
  const isAdmin = acc => acc?.role === 'admin' && acc.active;
  const canManageOrders = isAdmin;
  const roleLabel = () => 'Administrator';
  const STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Pickup Issue', 'Picked Up', 'Cancelled'];
  const NEXT = {
    Pending: ['Confirmed', 'Cancelled'],
    Confirmed: ['Preparing', 'Cancelled'],
    Preparing: ['Ready for Pickup', 'Cancelled'],
    'Ready for Pickup': [], // The customer acknowledges collection from My Orders.
    'Pickup Issue': ['Ready for Pickup'], // Re-mark ready after a reported pickup issue is resolved.
    'Picked Up': [], Cancelled: [],
  };
  const PATHS = {
    login: 'admin/login/admin-login.html',
    recovery: 'admin/recovery/admin-recovery.html',
    dashboard: 'admin/dashboard/admin-dashboard.html',
    orders: 'admin/orders/admin-orders.html',
    customers: 'admin/customers/admin-customers.html',
    reports: 'admin/reports/admin-reports.html',
    accounts: 'admin/accounts/admin-accounts.html',
  };
  const SECTION = { login: 'login', recovery: 'recovery', dashboard: 'dashboard', orders: 'orders', customers: 'customers', reports: 'reports' };
  const state = { q: '', status: 'All', kind: 'All', sort: 'newest', detailId: '', feedback: '', customerEmail: '' };
  const monetary = (n) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(n || 0));
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const norm = (v) => String(v || '').trim().toLowerCase();
  const dateText = (d) => { const dt = new Date(d); return isNaN(dt.getTime()) ? '—' : dt.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }); };
  const dateCode = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date(d));
  const brand = `<img class="ga-brand-logo" src="${new URL('assets/Cheerful Gilly Chef Mascot.png',ROOT).href}" alt="Gilly's chef mascot"/><span class="ga-brand-text"><b>gilly's</b><small>Good food, good days</small></span>`;

  // Opening the stand-alone module from File Explorer routes back to index.html
  // so checkout and admin run in the SAME local file origin, not separate file URLs.
  if (FILE && !location.hash.startsWith('#/admin/') && location.pathname.includes('/admin/')) {
    const filename = decodeURIComponent(location.pathname.split('/').pop());
    const page = Object.keys(PATHS).find(k => PATHS[k].endsWith('/' + filename)) || 'login';
    location.replace(new URL('index.html#/admin/' + page, ROOT).href);
    return;
  }

  function activePage() {
    if (FILE) {
      const match = location.hash.match(/^#\/admin\/(login|recovery|dashboard|orders|customers|reports|accounts)/);
      return match?.[1] || null;
    }
    // Clean administrator portal URL: /admin/ (or /admin/index.html) is the
    // official entry point. Session-aware rendering sends signed-in administrators
    // directly to their dashboard. Legacy named HTML modules still work.
    const path = decodeURIComponent(location.pathname);
    const portal = new URL('admin/', ROOT).pathname;
    if (path === portal || path === portal.slice(0, -1) || path === portal + 'index.html') {
      return 'login';
    }
    const filename = path.split('/').pop();
    return Object.keys(PATHS).find(k => {
      const basename = PATHS[k].split('/').pop().replace(/\.html$/, '');
      return filename === basename || filename === basename + '.html';
    }) || null;
  }
  function urlFor(page) {
    if (FILE) return new URL('index.html#/admin/' + page, ROOT).href;
    // Keep every existing separate HTML module. Login always returns to
    // the recognizable, bookmarkable administrator portal address instead of a file.
    return new URL(page === 'login' ? 'admin/' : (PATHS[page] || 'admin/'), ROOT).href;
  }
  function openPage(page) {
    if (FILE) {
      const url = urlFor(page);
      if (location.href === url) render();
      else location.href = url;
    } else location.href = urlFor(page);
  }
  let admin = null;
  const currentAdmin = () => admin;
  const adminsSession = () => Boolean(admin);

  let connectedOrders = [];
  let taxTreatment = 'unconfigured';
  let recordsError = '';
  let refreshing = false;
  const allOrders = () => connectedOrders;

  async function auth(action, body, query = '') {
    const readOnly = action === 'session' || action === 'orders';
    const response = await fetch(new URL('api/admin/' + action + query, ROOT), {
      method: readOnly ? 'GET' : 'POST',
      headers: readOnly ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
    });
    if (response.status === 401 && action === 'session') return null;
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      const error = Error(result?.error || (response.status === 401 && action === 'login'
        ? 'Incorrect username or password.' : 'Administrator access is unavailable. Check the Cloudflare configuration.'));
      error.status = response.status;
      throw error;
    }
    return result;
  }

  async function refreshRecords() {
    if (refreshing || !currentAdmin()) return;
    refreshing = true;
    recordsError = '';
    render();
    try {
      const tax = fetch(new URL('api/customer/settings', ROOT), { cache: 'no-store' }).then(async response => {
        if (!response.ok) throw Error('Could not load tax settings.');
        return (await response.json()).taxTreatment;
      });
      const orders = (async () => {
        const records = [];
        let cursor = null;
        do {
          const result = await auth('orders', undefined, cursor ? '?after=' + encodeURIComponent(cursor) : '');
          records.push(...result.orders);
          cursor = result.cursor;
        } while (cursor);
        return records;
      })();
      [taxTreatment, connectedOrders] = await Promise.all([tax, orders]);
    } catch (error) {
      if (error.status === 401) { openPage('login'); return; }
      recordsError = error.message;
    } finally {
      refreshing = false;
      render();
    }
  }

  function orderStatus(o) { return STATUSES.includes(o.status) ? o.status : 'Pending'; }
  const bowlCount = (o) => (o.items || []).filter(i => i.productId === 'custom-bowl').length;
  function typeKey(o) {
    if (o.kind === 'plan') return 'plan';
    if (o.kind === 'subscription') return 'subscription';
    const b = bowlCount(o), n = (o.items || []).length;
    return b === 0 ? 'meals' : b === n ? 'bowl' : 'mixed';
  }
  const TYPE_LABELS = { meals: 'Individual Meals', bowl: 'Build Your Own Bowl', mixed: 'Individual Meals + Bowl', plan: 'Meal Plans', subscription: 'Subscriptions' };
  const typeLabel = (o) => TYPE_LABELS[typeKey(o)];
  const matchesType = (o, f) => f === 'All' || typeKey(o) === f || (f === 'meals' && typeKey(o) === 'mixed') || (f === 'bowl' && typeKey(o) === 'mixed');
  function itemCount(o) { return (o.items || []).reduce((s, x) => s + Math.max(1, Number(x.quantity)||1), 0); }
  function total(o) { return Number(o.estimated_total || 0); }
  function ref(o) { return o.id?.startsWith('LOCAL-') ? 'Legacy ' + o.id.slice(6) : o.id; }
  function pill(status) { return `<span class="ga-status ga-status-${esc(status.toLowerCase().replace(/\s+/g, '-'))}">${esc(status)}</span>`; }
  async function updateStatus(orderId, nextStatus) {
    const order = allOrders().find(order => order.id === orderId);
    if (!order || !NEXT[orderStatus(order)]?.includes(nextStatus)) return;
    const updated = await auth('status', { id: orderId, version: order.version, nextStatus });
    connectedOrders = connectedOrders.map(order => order.id === orderId ? updated : order);
  }
  function customers(orders) {
    const by = new Map();
    for (const order of orders) {
      const email = norm(order.customer?.email || order._email);
      if (!by.has(email)) by.set(email, {email, name:order.customer?.name||'Customer', phone:order.customer?.phone||'', orders:[]});
      by.get(email).orders.push(order);
    }
    return [...by.values()].sort((a,b)=>b.orders.length-a.orders.length);
  }
  function topItems(orders) {
    const counts = new Map();
    for (const order of orders) for (const i of order.items || []) {
      const name = String(i.label || i.productId || 'Meal').trim();
      counts.set(name, (counts.get(name)||0) + Math.max(1,Number(i.quantity)||1));
    }
    return [...counts].sort((a,b)=>b[1]-a[1]);
  }
  function deliveredDate(o) {
    const changes = (o.status_history||[]).filter(x=>x.status === 'Picked Up');
    return changes.at(-1)?.changedAt || o.created_at;
  }
  function revenueMetrics(orders) {
    const delivered = orders.filter(o=>orderStatus(o)==='Picked Up');
    const today = dateCode(new Date());
    const startWeek = new Date(Date.now()-6*86400000);
    const month = today.slice(0,7);
    const sum = a => a.reduce((s,o)=>s+total(o),0);
    return { delivered, total:sum(delivered), day:sum(delivered.filter(o=>dateCode(deliveredDate(o))===today)),
      week:sum(delivered.filter(o=>new Date(deliveredDate(o))>=startWeek)),
      month:sum(delivered.filter(o=>dateCode(deliveredDate(o)).startsWith(month))) };
  }
  const ICONS={dashboard:'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',orders:'<path d="M6 2h12v20l-3-2-3 2-3-2-3 2z"/><path d="M9 7h6M9 11h6"/>',customers:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c2 .6 3.2 2.2 3.5 5.2"/>',reports:'<path d="M4 21V10M10 21V4M16 21v-8M22 21H2"/>',accounts:'<circle cx="12" cy="8" r="4"/><path d="M4 21c.6-4.2 3.8-6.5 8-6.5s7.4 2.3 8 6.5"/>',site:'<path d="M7 17 17 7M8 7h9v9"/>',logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>'};
  const ic=n=>`<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;
  const nav = page => `<nav class="ga-nav" aria-label="Admin navigation">${[
    ['dashboard','Dashboard'],['orders','Orders'],['customers','Customers'],['reports','Order Value Reports'],['accounts','Administrator Accounts']
  ].map(([id,label])=>`<a href="${urlFor(id)}" class="${page===id?'ga-active':''}" data-admin-nav="${id}">${ic(id)}<span>${label}</span>${id==='orders'&&allOrders().some(o=>orderStatus(o)==='Pending')?`<em class="ga-nav-count" aria-label="Pending orders">${allOrders().filter(o=>orderStatus(o)==='Pending').length}</em>`:''}</a>`).join('')}
    <a href="${new URL('index.html', ROOT).href}">${ic('site')}<span>Customer Website</span></a>
    <button type="button" data-admin-action="logout">${ic('logout')}<span>Logout</span></button>
  </nav>`;
  const layout = (page,title,subtitle,content) => `<div class="ga-layout">
    <aside class="ga-sidebar"><a class="ga-brand" href="${urlFor('dashboard')}">${brand}</a>${nav(page)}<div class="ga-sidefoot"><p>Gilly’s Restaurant</p></div></aside>
    <div class="ga-workspace"><div class="ga-topline"><span>GILLY'S / ADMINISTRATION</span><span>${esc(currentAdmin()?.name||'')} · ${esc(roleLabel(currentAdmin()?.role||''))} · Cash at Pickup</span></div>
      <main class="ga-main"><header class="ga-pagehead"><div><p class="ga-eyebrow">RESTAURANT OPERATIONS</p><h1>${title}</h1><p>${subtitle}</p></div><button type="button" class="ga-btn ga-ghost" data-admin-action="refresh">Refresh records</button></header>
      ${recordsError ? `<p class="ga-error" role="alert">${esc(recordsError)}</p>` : ''}
      ${refreshing ? '<p role="status">Loading pickup records…</p>' : ''}
      ${content}</main></div>
    <div id="ga-modal-root"></div>
  </div>`;
  const stat = (label,value,extra='') => `<article class="ga-stat" data-k="${label.toLowerCase().replace(/[^a-z]+/g,'-')}"><span>${label}</span><strong>${value}</strong><small>${extra}</small></article>`;
  // Keep every column accessible without horizontal scrolling. Table headers
  // become labels on record cards at tablet/phone widths; no data is dropped.
  const table = (headers, rows) => {
    const layoutClass = headers.length >= 7 ? 'ga-table--wide' : headers.length >= 5 ? 'ga-table--medium' : 'ga-table--compact';
    const content = `<div class="ga-table-wrap"><table class="ga-table ${layoutClass}"><thead><tr>${headers.map(x=>`<th scope="col">${x}</th>`).join('')}</tr></thead><tbody>${rows || `<tr><td colspan="${headers.length}" class="ga-empty">No matching records yet.</td></tr>`}</tbody></table></div>`;
    const template = document.createElement('template');
    template.innerHTML = content;
    const labels = [...template.content.querySelectorAll('thead th')].map(cell => cell.textContent.trim());
    template.content.querySelectorAll('tbody tr').forEach(row => {
      [...row.children].forEach((cell, index) => {
        if (cell.tagName === 'TD' && !cell.hasAttribute('colspan')) cell.setAttribute('data-label', labels[index] || 'Detail');
      });
    });
    return template.innerHTML;
  };
  function orderRows(orders,limit=Infinity) {
    return orders.slice(0,limit).map(o=>`<tr><td><b class="ga-ref">${esc(ref(o))}</b></td>
      <td>${esc(o.customer?.name || '—')}<small>${esc(o.customer?.email||o._email||'')}</small></td>
      <td>${esc(dateText(o.created_at))}</td>
      <td>${esc(typeLabel(o))}</td><td>${itemCount(o)}</td><td class="ga-amount">${monetary(total(o))}</td><td>Cash at Pickup</td>
      <td>${pill(orderStatus(o))}</td><td><button class="ga-text-btn" data-admin-action="detail" data-id="${esc(o.id)}">View Details</button></td></tr>`).join('');
  }
  const orderHeaders = ['Order Reference No.','Customer Name','Date &amp; Time Ordered','Order Type','No. of Items','Total Amount','Payment Method','Order Status','Action'];
  function dashboard(orders) {
    const counts=Object.fromEntries(STATUSES.map(s=>[s,orders.filter(o=>orderStatus(o)===s).length]));
    const r=revenueMetrics(orders);
    const me=currentAdmin(); const today=new Date().toLocaleDateString('en-PH',{weekday:'long',month:'long',day:'numeric',year:'numeric',timeZone:'Asia/Manila'});
    return layout('dashboard',`Welcome back, ${esc((me?.name||'Admin').split(' ')[0])}`,`${today} · Order overview`,`
      <section class="ga-stats">${stat('Total Orders',orders.length,'All order types')}
      ${STATUSES.map(s=>stat(s,counts[s],s==='Ready for Pickup'?'Awaiting collection':s==='Pickup Issue'?'Requires follow-up':'Customer purchases')).join('')}
      ${stat('Picked Up Order Value',monetary(r.total),'Excludes pending / cancelled')}</section>
      ${counts['Pickup Issue'] ? `<section class="ga-panel ga-delivery-alert"><div class="ga-panelhead"><div><p class="ga-eyebrow">PICKUP FOLLOW-UP</p><h2>Pickup Issues <span class="ga-count">${counts['Pickup Issue']}</span></h2><p class="ga-panel-subtitle">Customers reported a problem collecting an order.</p></div><a class="ga-text-btn" href="${urlFor('orders')}">Review orders →</a></div>${table(orderHeaders,orderRows(orders.filter(o=>orderStatus(o)==='Pickup Issue'),5))}</section>` : ''}
      <section class="ga-panel ga-pending-orders"><div class="ga-panelhead"><div><p class="ga-eyebrow">ORDER REVIEW</p><h2>Awaiting Confirmation <span class="ga-count">${counts.Pending}</span></h2><p class="ga-panel-subtitle">New orders to review and confirm</p></div><a class="ga-text-btn" href="${urlFor('orders')}">Manage orders →</a></div>
      ${table(orderHeaders,orderRows(orders.filter(o=>orderStatus(o)==='Pending'),5))}</section>
      <section class="ga-panel"><div class="ga-panelhead"><div><p class="ga-eyebrow">LATEST ACTIVITY</p><h2>Recent Orders</h2></div><a class="ga-text-btn" href="${urlFor('orders')}">View all orders →</a></div>
      ${table(orderHeaders,orderRows(orders,7))}</section>`);
  }
  function orderScreen(orders) {
    const term=norm(state.q);
    let shown=orders.filter(o=>(state.status==='All'||orderStatus(o)===state.status)
      &&matchesType(o,state.kind)
      &&(!term || [o.id,ref(o),o.customer?.name,o.customer?.email,o.customer?.phone,typeLabel(o),orderStatus(o)].some(x=>norm(x).includes(term))));
    shown.sort(state.sort==='oldest'?(a,b)=>new Date(a.created_at)-new Date(b.created_at)
      :state.sort==='highest'?(a,b)=>total(b)-total(a)
      :state.sort==='lowest'?(a,b)=>total(a)-total(b)
      :(a,b)=>new Date(b.created_at)-new Date(a.created_at));
    return layout('orders','Order Management','Review orders, manage fulfillment, and update order statuses.',`
      <section class="ga-panel"><div class="ga-panelhead"><h2>Customer Orders <span class="ga-count">${shown.length}</span></h2></div>
      <div class="ga-order-status-summary"><span><b>${orders.filter(o=>orderStatus(o)==='Pending').length}</b> Awaiting confirmation</span><span><b>${orders.filter(o=>orderStatus(o)==='Confirmed').length}</b> Confirmed orders</span><span><b>${orders.filter(o=>orderStatus(o)==='Ready for Pickup').length}</b> Ready for customer collection</span><span><b>${orders.filter(o=>orderStatus(o)==='Pickup Issue').length}</b> Pickup issues</span><button type="button" class="ga-text-btn" data-admin-action="filter-pending">View Pending Orders</button></div>
      <div class="ga-filters"><label>Search<input id="ga-search" placeholder="Reference, name, email…" value="${esc(state.q)}"/></label>
      <label>Status<select id="ga-filter-status">${['All',...STATUSES].map(s=>`<option ${s===state.status?'selected':''}>${s}</option>`).join('')}</select></label>
      <label>Order type<select id="ga-filter-kind">${[['All','All types'],['meals','Individual Meals'],['bowl','Build Your Own Bowl'],['plan','Meal Plans'],['subscription','Subscriptions']].map(([v,t])=>`<option value="${v}" ${v===state.kind?'selected':''}>${t}</option>`).join('')}</select></label>
      <label>Sort<select id="ga-filter-sort">${[['newest','Newest first'],['oldest','Oldest first'],['highest','Highest total'],['lowest','Lowest total']].map(([v,t])=>`<option value="${v}" ${v===state.sort?'selected':''}>${t}</option>`).join('')}</select></label></div>
      ${table(orderHeaders,orderRows(shown))}</section>`);
  }
  const purchased = (orders) => orders.filter(o=>orderStatus(o)!=='Cancelled').reduce((n,o)=>n+total(o),0);
  const delivered$ = (orders) => orders.filter(o=>orderStatus(o)==='Picked Up').reduce((n,o)=>n+total(o),0);
  function customerScreen(orders) {
    const list=customers(orders);
    const rows=list.map(c=>{const items=topItems(c.orders.filter(o=>orderStatus(o)!=='Cancelled'));
      return `<tr><td><b>${esc(c.name)}</b>${c.orders.length>1?' <span class="ga-repeat">Repeat customer</span>':''}<small>${esc(c.email)}</small><small>${esc(c.phone)}</small></td><td>${c.orders.length}</td><td class="ga-amount">${monetary(purchased(c.orders))}</td><td class="ga-amount">${monetary(delivered$(c.orders))}</td><td>${esc(items.slice(0,2).map(x=>x[0]).join(', ') || '—')}</td><td><button class="ga-text-btn" data-admin-action="customer" data-email="${esc(c.email)}">View history</button></td></tr>`;}).join('');
    return layout('customers','Customer History','Customer profiles and purchase history.',`
      <section class="ga-panel"><div class="ga-panelhead"><h2>Customers <span class="ga-count">${list.length}</span></h2></div>
      ${table(['Customer','Total Orders','Total Purchases (excl. cancelled)','Picked Up Order Value','Most Ordered Meals','Action'],rows)}</section>`);
  }
  function revenueTables(orders) {
    const del=orders.filter(o=>orderStatus(o)==='Picked Up');
    const group=(keyFn)=>{const m=new Map();for(const o of del){const k=keyFn(deliveredDate(o));const e=m.get(k)||{n:0,t:0};e.n++;e.t+=total(o);m.set(k,e);}return m;};
    const days=[...Array(7)].map((_,i)=>dateCode(new Date(Date.now()-i*86400000)));
    const byDay=group(dateCode), byMonth=group(d=>dateCode(d).slice(0,7));
    const max=Math.max(1,...days.map(d=>byDay.get(d)?.t||0));
    const dayRows=days.map(d=>{const e=byDay.get(d)||{n:0,t:0};return `<tr><td>${d}</td><td>${e.n}</td><td class="ga-amount">${monetary(e.t)}</td></tr>`;}).join('');
    const monthRows=[...byMonth].sort((a,b)=>b[0].localeCompare(a[0])).map(([k,e])=>`<tr><td>${k}</td><td>${e.n}</td><td class="ga-amount">${monetary(e.t)}</td></tr>`).join('');
    const sum=(list)=>list.reduce((n,o)=>n+total(o),0);
    const open=orders.filter(o=>['Pending','Confirmed','Preparing','Ready for Pickup','Pickup Issue'].includes(orderStatus(o)));
    const canc=orders.filter(o=>orderStatus(o)==='Cancelled');
    const split=`<tr><td>Picked Up</td><td>${del.length}</td><td class="ga-amount">${monetary(sum(del))}</td><td>Picked up · cash collection unverified</td></tr>
      <tr><td>Pending / in progress</td><td>${open.length}</td><td class="ga-amount">${monetary(sum(open))}</td><td>Not yet counted</td></tr>
      <tr><td>Cancelled</td><td>${canc.length}</td><td class="ga-amount">${monetary(sum(canc))}</td><td>Excluded</td></tr>`;
    return `<section class="ga-panel"><div class="ga-panelhead"><h2>Order values by pickup status</h2></div>${table(['Group','Orders','Order value','Treatment'],split)}</section>
      <div class="ga-duo"><section class="ga-panel"><div class="ga-panelhead"><h2>Daily picked-up order value (last 7 days)</h2></div>${table(['Date','Orders','Sales'],dayRows)}</section>
      <section class="ga-panel"><div class="ga-panelhead"><h2>Monthly picked-up order value</h2></div>${table(['Month','Orders','Sales'],monthRows)}</section></div>`;
  }
  function reportScreen(orders) {
    const r=revenueMetrics(orders);
    const max=Math.max(1,...STATUSES.map(x=>orders.filter(o=>orderStatus(o)===x).length));
    const bars=STATUSES.map(s=>{const n=orders.filter(o=>orderStatus(o)===s).length;
      return `<div class="ga-bar-line"><span>${s}</span><div class="ga-bar-bg"><div style="width:${(n/max)*100}%"></div></div><strong>${n}</strong></div>`;}).join('');
    const best=topItems(orders.filter(o=>orderStatus(o)==='Picked Up'));
    return layout('reports','Order Value Reports','Order values by pickup status',`
      <section class="ga-stats ga-revenue">${stat('Today',monetary(r.day),'Picked Up today (PH time)')}${stat('Weekly (last 7 days)',monetary(r.week),'Picked Up in rolling 7 days')}${stat('Monthly (this month)',monetary(r.month),'Picked Up this month')}${stat('All-time picked up',monetary(r.total),`${r.delivered.length} picked-up order${r.delivered.length===1?'':'s'}`)}</section>
      ${revenueTables(orders)}
      <div class="ga-duo"><section class="ga-panel"><div class="ga-panelhead"><h2>Orders by status</h2></div>${bars}</section>
      <section class="ga-panel"><div class="ga-panelhead"><h2>Best-selling meals</h2></div><p class="ga-muted">Quantities from Picked Up orders</p>
      ${table(['Meal','Qty'],best.slice(0,10).map(([name,n])=>`<tr><td>${esc(name)}</td><td>${n}</td></tr>`).join(''))}</section></div>
      <section class="ga-panel ga-tax-settings"><div class="ga-panelhead"><h2>Tax Settings</h2></div>
        <div class="ga-tax-controls"><label for="ga-tax-treatment">Tax registration</label>
        <select id="ga-tax-treatment" aria-label="Tax registration">
          <option value="unconfigured" ${taxTreatment==='unconfigured'?'selected':''}>Not specified</option>
          <option value="vat-inclusive" ${taxTreatment==='vat-inclusive'?'selected':''}>VAT registered · 12% VAT included in menu prices</option>
          <option value="non-vat" ${taxTreatment==='non-vat'?'selected':''}>Non-VAT registered</option>
        </select>
        <button type="button" class="ga-btn ga-primary" data-admin-action="save-tax-treatment">Save</button></div>
        <p class="ga-tax-feedback" role="status">${esc(state.taxFeedback||'')}</p>
      </section>`);
  }
  const priceRows = (o) => {
    const p = o.pricing || {};
    const n = x => x != null && Number.isFinite(Number(x)) ? monetary(x) : '—';
    return `<div class="ga-price">
      <div>Meal subtotal <b>${n(p.itemSubtotal)}</b></div>
      ${Number(p.discount)>0 ? `<div>Package discount <b>−${n(p.discount)}</b></div>` : ''}
      <div>Pickup <b>Free</b></div>
      ${p.taxTreatment==='vat-inclusive' && p.taxAmount != null ? `<div>VATable sales (excl. VAT) <b>${n(p.vatableSales)}</b></div><div>12% VAT (included) <b>${n(p.taxAmount)}</b></div>` : ''}
      ${p.taxTreatment==='non-vat' ? '<div>VAT <b>Not charged</b></div>' : ''}
      <div class="ga-price-total">Total · Cash at Pickup <b>${monetary(total(o))}</b></div>
    </div>`;
  };
  // Customer customization details: readable kitchen instructions, not raw data fields.
  // Stored IDs remain untouched for pricing/history; only the presentation changes.
  const CUSTOMIZATION_LABELS = Object.freeze({
    portion: { regular:'Regular', hearty:'Hearty +25%' },
    protein: { 'as-is':'As prepared', 'extra-chicken':'Extra chicken', 'extra-tofu':'Extra tofu' },
    sauce: { house:'House dressing', citrus:'Citrus vinaigrette', sesame:'Creamy sesame' },
    toppings: { avocado:'Fresh avocado', egg:'Soft-boiled egg', edamame:'Extra edamame' },
    base: { 'brown-rice':'Brown rice', 'white-rice':'Steamed white rice', quinoa:'Quinoa', greens:'Fresh garden greens' },
    bowlProtein: { chicken:'Grilled chicken', tofu:'Golden tofu', beef:'Beef sirloin', salmon:'Seared salmon' },
    vegetables: { broccoli:'Roasted broccoli', kamote:'Roasted kamote', cabbage:'Crunchy slaw', cucumber:'Fresh cucumber', avocado:'Avocado' },
    bowlSauce: { none:'No dressing', calamansi:'Calamansi vinaigrette', peanut:'Peanut sauce', sesame:'Sesame glaze' },
    extras: { egg:'Soft-boiled egg', edamame:'Edamame', seeds:'Toasted sesame seeds' },
  });
  function friendlyIngredient(value, names={}) {
    const text=String(value??'').trim();
    if(!text)return '';
    const known=names[text.toLowerCase()]||names[text];
    if(known)return known;
    // Retain understandable descriptions of older, custom or renamed ingredients.
    const plain=text.replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim();
    return plain?plain.charAt(0).toUpperCase()+plain.slice(1):'';
  }
  function ingredientSelections(custom) {
    if(!custom||typeof custom!=='object')return '';
    const entries=[];
    const add=(label,value,choices={})=>{
      const values=(Array.isArray(value)?value:[value])
        .filter(x=>typeof x==='string'&&x.trim())
        .map(x=>friendlyIngredient(x,choices)).filter(Boolean);
      if(values.length)entries.push(`<div class="ga-custom-row"><dt>${esc(label)}</dt><dd>${esc(values.join(', '))}</dd></div>`);
    };
    const bowl=custom.builder;
    if(bowl&&typeof bowl==='object'&&Object.values(bowl).some(x=>Array.isArray(x)?x.length:Boolean(x))){
      add('Base',bowl.base,CUSTOMIZATION_LABELS.base);
      add('Protein',bowl.protein,CUSTOMIZATION_LABELS.bowlProtein);
      add('Vegetables',bowl.vegetables,CUSTOMIZATION_LABELS.vegetables);
      add('Sauce',bowl.sauce,CUSTOMIZATION_LABELS.bowlSauce);
      add('Extras',bowl.extras,CUSTOMIZATION_LABELS.extras);
    }else{
      add('Portion',custom.portion,CUSTOMIZATION_LABELS.portion);
      add('Protein',custom.protein,CUSTOMIZATION_LABELS.protein);
      add('Dressing',custom.sauce,CUSTOMIZATION_LABELS.sauce);
      add('Extra toppings',custom.toppings,CUSTOMIZATION_LABELS.toppings);
      add('Removed ingredients',custom.removed);
    }
    return entries.length?`<dl class="ga-ingredient-list">${entries.join('')}</dl>`:'';
  }
  function friendlyMealName(item) {
    const label=String(item?.label||'').trim();
    if(label)return label;
    return friendlyIngredient(item?.productId||'Meal');
  }
  function friendlyMealSlot(slot) {
    const text=String(slot||'').trim();
    const parts=text.match(/^(\d{4}-\d{2}-\d{2})\|(.+)$/);
    if(!parts)return friendlyIngredient(text);
    const date=new Date(parts[1]+'T12:00:00');
    const niceDate=Number.isFinite(date.getTime())?date.toLocaleDateString('en-PH',{year:'numeric',month:'short',day:'numeric'}):parts[1];
    return `${niceDate} · ${friendlyIngredient(parts[2])}`;
  }
  function orderModal(o) {
    const customer=o.customer||{}; const pickup=o.pickup||o.delivery||{}; const status=orderStatus(o);
    const history=Array.isArray(o.status_history)?o.status_history:[{ status, changedAt:o.created_at }];
    const rows=(o.items||[]).map(i=>{
      const q=Math.max(1,Number(i.quantity)||1); const line=Number(i.estimatedLineTotal);
      const hasPrice=Number.isFinite(line);
      return `<tr><td>${esc(friendlyMealName(i))}${i.slot?`<small>Meal schedule: ${esc(friendlyMealSlot(i.slot))}</small>`:''}
        ${ingredientSelections(i.custom) ? `<details class="ga-ingredient-details" open><summary>Ingredient selections</summary>${ingredientSelections(i.custom)}</details>`:''}</td>
        <td>${q}</td><td>${hasPrice?monetary(line/q):'—'}</td><td>${hasPrice?monetary(line):'—'}</td></tr>`;}).join('');
    const me=currentAdmin(); const changes=canManageOrders(me)?(NEXT[status]||[]):[];
    return `<div class="ga-modal-backdrop" data-admin-action="close-backdrop"><article class="ga-modal" role="dialog" aria-modal="true" aria-labelledby="ga-detail-title">
      <header class="ga-modal-head"><div><p class="ga-eyebrow">ORDER DETAILS · PICKUP</p><h2 id="ga-detail-title">${esc(ref(o))}</h2><p>${esc(typeLabel(o))} · ${esc(dateText(o.created_at))}</p></div><button type="button" class="ga-close" data-admin-action="close" aria-label="Close order details">×</button></header>
      <div class="ga-modal-scroll"><div class="ga-details-grid"><section><h3>Customer information</h3><p><b>${esc(customer.name||'—')}</b></p><p>${esc(customer.email||'—')}</p><p>${esc(customer.phone||'—')}</p></section>
        <section><h3>Pickup information</h3><p>${esc(pickup.locationName||"Taft Avenue Building, 2222 Taft Avenue, Malate, City of Manila, Metro Manila 1004, Philippines")}</p><p>Date: ${esc(pickup.date||'—')}</p><p>Time: ${esc(pickup.time||'—')}</p><p>Pickup contact: ${esc(pickup.contactName||customer.name||'—')} · ${esc(pickup.contactPhone||customer.phone||'—')}</p><p>Notes: ${esc(pickup.instructions||'None')}</p></section></div>
      <h3>Items ordered (${itemCount(o)})</h3>${table(['Meal / customizations','Qty','Unit price','Line total'],rows)}
      <h3>Payment breakdown</h3>${priceRows(o)}
      <div class="ga-details-grid"><section><h3>Order status</h3>${pill(status)}
      ${status==='Ready for Pickup' ? '<p class="ga-muted">The customer can confirm collection from My Orders.</p>' : ''}
      ${status==='Pickup Issue' ? '<p class="ga-muted">Customer reported a pickup issue. Resolve it before marking ready for pickup again.</p>' : ''}
      ${status==='Picked Up' && o.pickup_confirmation?.received ? '<p class="ga-muted">Customer confirmed order collection.</p>' : ''}
      ${changes.length?`<div class="ga-status-actions">${changes.map(s=>`<button class="ga-btn ${s==='Cancelled'?'ga-outline':'ga-primary'}" data-admin-action="status" data-id="${esc(o.id)}" data-status="${s}">${s==='Cancelled'?'Cancel order':s==='Confirmed'?'Confirm Order':s==='Ready for Pickup'?(status==='Pickup Issue'?'Mark Ready Again':'Mark Ready for Pickup'):'Mark as '+s}</button>`).join('')}</div>`:(status==='Ready for Pickup'||status==='Picked Up'?'':'<p class="ga-muted">No further status changes allowed.</p>')}</section>
      <section><h3>Status history</h3><ol class="ga-timeline">${history.map(h=>`<li><strong>${esc(h.status)}</strong><small>${esc(dateText(h.changedAt))}${h.changedBy?' · by '+esc(h.changedBy):''}</small></li>`).join('')}</ol></section></div>
      </div><footer class="ga-modal-footer"><button type="button" class="ga-btn ga-outline" data-admin-action="close">Close</button><button type="button" class="ga-btn ga-primary" data-admin-action="print" data-id="${esc(o.id)}">Print Order Summary</button></footer></article></div>`;
  }
  function customerModal(email,orders) {
    const c=customers(orders).find(x=>x.email===email);
    if(!c)return '';
    return `<div class="ga-modal-backdrop" data-admin-action="close-backdrop"><article class="ga-modal" role="dialog" aria-modal="true"><header class="ga-modal-head"><div><p class="ga-eyebrow">CUSTOMER HISTORY</p><h2>${esc(c.name)}</h2><p>${esc(c.email)} · ${esc(c.phone)}</p></div><button class="ga-close" data-admin-action="close">×</button></header><div class="ga-modal-scroll"><section class="ga-stats ga-revenue"><article class="ga-stat"><span>Total orders</span><strong>${c.orders.length}</strong><small>${c.orders.length>1?'Repeat customer':'First-time customer'}</small></article><article class="ga-stat"><span>Total purchases</span><strong>${monetary(purchased(c.orders))}</strong><small>Excludes cancelled</small></article><article class="ga-stat"><span>Picked Up Order Value</span><strong>${monetary(delivered$(c.orders))}</strong><small>Picked up only · payment not verified</small></article></section><h3>Order history</h3>
      ${table(['Order','Placed','Type','Items','Total','Status'],c.orders.map(o=>`<tr><td>${esc(ref(o))}</td><td>${esc(dateText(o.created_at))}</td><td>${esc(typeLabel(o))}</td><td>${itemCount(o)}</td><td>${monetary(total(o))}</td><td>${pill(orderStatus(o))}</td></tr>`).join(''))}
      <h3>Most ordered meals</h3>${table(['Meal','Quantity'],topItems(c.orders).slice(0,8).map(([n,q])=>`<tr><td>${esc(n)}</td><td>${q}</td></tr>`).join(''))}</div><footer class="ga-modal-footer"><button class="ga-btn ga-primary" data-admin-action="close">Close</button></footer></article></div>`;
  }
  function passwordToggle() {
    return `<button type="button" class="ga-password-toggle" data-admin-toggle-password aria-label="Show password" aria-pressed="false" title="Show password">
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2.4 12s3.4-5.5 9.6-5.5 9.6 5.5 9.6 5.5-3.4 5.5-9.6 5.5S2.4 12 2.4 12Z"/><circle cx="12" cy="12" r="2.7"/></svg>
      <span class="ga-password-toggle-text">Show</span>
    </button>`;
  }
  function loginPage() {
    const field = (label, name, type='text', extra='') => `<label class="ga-login-field"><span>${label}</span>${type==='password'
      ? `<span class="ga-password-wrap"><input name="${name}" type="password" ${extra} required />${passwordToggle()}</span>`
      : `<input name="${name}" type="${type}" ${extra} required />`}</label>`;
    return `<div class="ga-login-page"><a class="ga-login-back" href="${new URL('index.html',ROOT).href}">← Back to Gilly's website</a>
      <section class="ga-login-panel"><div class="ga-login-brand">${brand}<span class="ga-smallcap">MANAGEMENT PORTAL</span></div>
      <div class="ga-login-body"><p class="ga-eyebrow">ADMINISTRATOR ACCESS</p>
      <h1>Welcome back</h1>
      <p>Sign in to your administrator account.</p>
      <form data-admin-form="login" autocomplete="on">
      ${field('Username','username','text','autocomplete="username" maxlength="24" placeholder="Admin username"')}
      ${field('Password','password','password','autocomplete="current-password" placeholder="Your account password"')}
      <p id="ga-auth-error" class="ga-error" role="alert"></p><button class="ga-btn ga-primary ga-full" type="submit">Sign in to dashboard</button></form>
      <div class="ga-login-actions"><a href="${urlFor('recovery')}" data-admin-nav="recovery" class="ga-link-btn">Forgot password?</a></div>
      <p class="ga-muted ga-login-help">Authorized administrators only.</p>
      </div></section></div>`;
  }
  function recoveryPage() {
    return `<div class="ga-login-page"><a class="ga-login-back" href="${urlFor('login')}">← Back to Admin Login</a>
      <section class="ga-login-panel"><div class="ga-login-body"><h1>Administrator password recovery</h1>
      <p>Ask the Cloudflare project owner to update the administrator password in Pages settings.</p></div></section></div>`;
  }
  function accountsScreen(me) {
    return layout('accounts', 'Administrator Accounts', 'Cloudflare-managed access', `<section class="ga-panel"><div class="ga-panelhead">
      <h2>${esc(me.username)}</h2></div><p>The Cloudflare project owner manages this account through Pages secrets.</p></section>`);
  }
  function rootNode() { return document.getElementById('app') && FILE ? document.getElementById('app') : document.getElementById('ga-admin'); }
  function render() {
    const page=activePage(); if(!page) return;
    const host=rootNode();if(!host)return;
    document.body.classList.add('ga-mode');
    if (FILE) {
      host.textContent = 'Administrator sign-in requires Cloudflare Pages. Use Wrangler for local testing.';
      return;
    }
    const hasAuth=adminsSession();
    const orders=hasAuth?allOrders():[];
    if(page!=='login'&&page!=='recovery'&&!hasAuth){openPage('login');return;}
    if((page==='login'||page==='recovery')&&hasAuth){openPage('dashboard');return;}
    const me=currentAdmin();
    host.innerHTML=page==='login'?loginPage():page==='recovery'?recoveryPage():page==='dashboard'?dashboard(orders):page==='orders'?orderScreen(orders):page==='customers'?customerScreen(orders):page==='accounts'?accountsScreen(me):reportScreen(orders);
    if(page!=='login') {
      if(state.detailId){const o=orders.find(o=>o.id===state.detailId); if(o)host.querySelector('#ga-modal-root').innerHTML=orderModal(o); else state.detailId='';}
      if(state.customerEmail)host.querySelector('#ga-modal-root').innerHTML=customerModal(state.customerEmail,orders);
    }
  }
  function closeModal() {state.detailId='';state.customerEmail='';document.getElementById('ga-modal-root')?.replaceChildren();}
  function printOrder(o) {
    // Print a focused, locally generated order summary, not a BIR receipt.
    const sheet=document.createElement('section');sheet.className='ga-print-sheet';
    sheet.innerHTML=`<header class="ga-print-title">${brand}<div><h1>ORDER SUMMARY</h1><p>Cash at Pickup</p></div></header>
      <h2>${esc(ref(o))}</h2><p>${esc(dateText(o.created_at))} · ${esc(typeLabel(o))} · ${esc(orderStatus(o))}</p>
      <h3>Customer / Pickup</h3><p>${esc(o.customer?.name||'')} · ${esc(o.customer?.phone||'')} · ${esc(o.customer?.email||'')}</p>
      <p>${esc(o.pickup?.locationName||o.delivery?.locationName||"Taft Avenue Building, 2222 Taft Avenue, Malate, City of Manila, Metro Manila 1004, Philippines")} · ${esc(o.pickup?.date||o.delivery?.date||'')} ${esc(o.pickup?.time||o.delivery?.time||'')}</p>
      <p>Pickup instructions: ${esc(o.pickup?.instructions||o.delivery?.instructions||'None')}</p>
      <h3>Items</h3>${table(['Meal / ingredients','Qty','Amount'],(o.items||[]).map(i=>`<tr><td>${esc(friendlyMealName(i))}${ingredientSelections(i.custom)}</td><td>${Number(i.quantity)||1}</td><td>${monetary(i.estimatedLineTotal)}</td></tr>`).join(''))}
      <h3>Payment breakdown</h3>${priceRows(o)}<p>Payment method: Cash at Pickup</p>`;
    sheet.id='ga-print-report';
    document.body.append(sheet);
    // Keep the print sheet in the DOM until the print dialog finishes.
    const cleanup = () => sheet.remove();
    window.addEventListener('afterprint', cleanup, { once: true });
    window.print();
  }

  function askAdminConfirmation({ title, message, confirmLabel = 'Yes, Confirm' }) {
    return new Promise(resolve => {
      document.querySelector('.ga-confirm-overlay')?.remove();
      const previous = document.activeElement;
      const host = document.createElement('div');
      host.className = 'ga-confirm-overlay';
      host.innerHTML = `<section class="ga-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="ga-confirm-heading" aria-describedby="ga-confirm-description">
        <div class="ga-confirm-question" aria-hidden="true">
          <svg viewBox="0 0 48 48" width="50" height="50" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="24" cy="24" r="21"></circle><path d="M17.5 17.5a7 7 0 1 1 10.8 6c-2.5 1.8-4.3 2.8-4.3 6.1"></path><circle cx="24" cy="34.5" r="1.2" fill="currentColor" stroke="none"></circle>
          </svg>
        </div>
        <h2 id="ga-confirm-heading">${esc(title)}</h2>
        <p id="ga-confirm-description">${esc(message)}</p>
        <div class="ga-confirm-actions"><button type="button" class="ga-confirm-cancel" data-confirm-answer="cancel">Cancel</button><button type="button" class="ga-confirm-accept" data-confirm-answer="confirm">${esc(confirmLabel)}</button></div>
      </section>`;
      let settled = false;
      const finish = answer => {
        if (settled) return;
        settled = true;
        host.removeEventListener('keydown', onKeydown);
        host.remove();
        previous?.focus?.({ preventScroll: true });
        resolve(answer);
      };
      const onKeydown = e => {
        if (e.key==='Escape') {e.preventDefault();finish(false);}
        if (e.key!=='Tab')return;
        const buttons=[...host.querySelectorAll('button')];
        if (e.shiftKey && document.activeElement===buttons[0]) {e.preventDefault();buttons.at(-1).focus();}
        else if(!e.shiftKey && document.activeElement===buttons.at(-1)){e.preventDefault();buttons[0].focus();}
      };
      host.addEventListener('keydown',onKeydown);
      host.addEventListener('click',e=>{
        const answer=e.target.closest('[data-confirm-answer]')?.dataset.confirmAnswer;
        if(answer)finish(answer==='confirm'); else if(e.target===host)finish(false);
      });
      document.body.appendChild(host);
      host.querySelector('.ga-confirm-cancel').focus({preventScroll:true});
    });
  }

  document.addEventListener('click', async e=>{
    const toggle=e.target.closest('[data-admin-toggle-password]');
    if(toggle){
      e.preventDefault();
      const input=toggle.closest('.ga-password-wrap')?.querySelector('input');
      if(!input)return;
      const showing=input.type==='password';
      input.type=showing?'text':'password';
      toggle.setAttribute('aria-pressed',String(showing));
      toggle.setAttribute('aria-label',showing?'Hide password':'Show password');
      toggle.title=showing?'Hide password':'Show password';
      const text=toggle.querySelector('.ga-password-toggle-text');
      if(text)text.textContent=showing?'Hide':'Show';
      input.focus({preventScroll:true});
      return;
    }
    const link=e.target.closest('[data-admin-nav]');
    if(link&&FILE){e.preventDefault();openPage(link.dataset.adminNav);return;}
    const btn=e.target.closest('[data-admin-action]');if(!btn)return;
    if(!activePage())return;
    const act=btn.dataset.adminAction;
    if(act==='close-backdrop' && e.target!==btn)return;
    if(act==='close'||act==='close-backdrop'){closeModal();return;}
    if(act==='logout'){
      try { await auth('logout'); admin = null; openPage('login'); }
      catch (error) { alert(error.message); }
      return;
    }
    if(act==='refresh'){await refreshRecords();return;}
    if(act==='filter-pending'){state.status='Pending';render();return;}
    if(act==='save-tax-treatment'){
      if(!isAdmin(currentAdmin()))return;
      const selected=document.getElementById('ga-tax-treatment')?.value;
      if(!['unconfigured','vat-inclusive','non-vat'].includes(selected))return;
      if(!await askAdminConfirmation({title:'Save Tax Settings?',message:'Apply this tax treatment to newly saved summaries? Existing summaries will keep their original totals.',confirmLabel:'Save Settings'}))return;
      try { taxTreatment = (await auth('settings', { taxTreatment: selected })).taxTreatment; }
      catch (error) { alert(error.message); return; }
      state.taxFeedback='Tax settings saved.';
      render();return;
    }
    if(act==='detail'){if(!isAdmin(currentAdmin()))return;state.detailId=btn.dataset.id;state.customerEmail='';render();return;}
    if(act==='customer'){if(!isAdmin(currentAdmin()))return;state.customerEmail=btn.dataset.email;state.detailId='';render();return;}
    if(act==='print'){if(!isAdmin(currentAdmin()))return;const o=allOrders().find(o=>o.id===btn.dataset.id);if(o)printOrder(o);return;}
    if(act==='status'){
      if(!await askAdminConfirmation({title:"Update Order Status?",message:`Change the order status to ${btn.dataset.status}?`,confirmLabel:"Yes, Update"}))return;
      try { await updateStatus(btn.dataset.id, btn.dataset.status); }
      catch (error) {
        alert(error.message);
        if (error.status === 409) await refreshRecords();
      }
      render();return;
    }
  });
  document.addEventListener('submit', async event => {
    const form = event.target.closest('form[data-admin-form="login"]');
    if (!form) return;
    event.preventDefault();
    const error = form.querySelector('.ga-error');
    const button = form.querySelector('button[type=submit]');
    error.textContent = '';
    button.disabled = true;
    try {
      await auth('login', {
        username: form.elements.username.value.trim().toLowerCase(),
        password: form.elements.password.value,
      });
      openPage('dashboard');
    } catch (failure) {
      error.textContent = failure.message;
    } finally {
      button.disabled = false;
    }
  });
  document.addEventListener('input',e=>{
    if(e.target.id!=='ga-search')return;
    state.q=e.target.value;
    const focusStart=e.target.selectionStart;
    render();const input=document.getElementById('ga-search');input?.focus();input?.setSelectionRange(focusStart,focusStart);
  });
  document.addEventListener('change',e=>{
    const id=e.target.id;
    if(id==='ga-filter-status')state.status=e.target.value;
    else if(id==='ga-filter-kind')state.kind=e.target.value;
    else if(id==='ga-filter-sort')state.sort=e.target.value;
    else return;
    render();
  });
  if(FILE){
    window.addEventListener('hashchange',()=>queueMicrotask(()=>{
      if(activePage())render();else document.body.classList.remove('ga-mode');
    }));
    if(activePage())queueMicrotask(render);
  } else if (activePage()) {
    auth('session').then(account => {
      admin = account;
      if (account && !['login', 'recovery', 'accounts'].includes(activePage())) return refreshRecords();
      render();
    }).catch(error => {
      const host = rootNode();
      if (host) host.textContent = error.message;
    });
  }
})();

