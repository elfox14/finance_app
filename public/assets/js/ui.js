/**
 * UI Manager V9.0 (Async/Full-Stack Edition)
 */

const UIManager = {
    currentTab: 'dashboard',

    init() {
        this.initEvents();
        // FinanceCore.init() handles the first tab switch
    },

    initEvents() {
        document.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = e.target.id;
            try {
                if (id === 'card-pro-form') {
                    await FinanceCore.addCardPro({
                        name: document.getElementById('c-name').value, bank: document.getElementById('c-bank').value,
                        last4: document.getElementById('c-last4').value, type: document.getElementById('c-type').value,
                        limit: document.getElementById('c-limit').value, statementDay: document.getElementById('c-sday').value,
                        dueDay: document.getElementById('c-dday').value, interestRate: document.getElementById('c-rate').value,
                        minPayPercent: document.getElementById('c-minp').value, lateFee: document.getElementById('c-fee').value
                    });
                    hideModal('card-pro'); this.renderCardsPro();
                }
                
                if (id === 'card-txn-form') {
                    await FinanceCore.addCardTransaction(window.cid, {
                        merchant: document.getElementById('txn-merchant').value,
                        amount: document.getElementById('txn-amount').value,
                        date: document.getElementById('txn-date').value,
                        cat: document.getElementById('txn-cat').value,
                        isInstallment: document.getElementById('txn-is-inst').checked,
                        months: document.getElementById('txn-months').value,
                        rate: document.getElementById('txn-rate').value,
                        type: document.getElementById('txn-type').value
                    });
                    hideModal('card-txn'); this.renderCardsPro();
                }

                if (id === 'expense-form' || id === 'income-form') {
                    const type = id.split('-')[0];
                    await FinanceCore.addTransaction(
                        type, 
                        e.target.querySelector('input[type="number"]').value, 
                        e.target.querySelector('input[type="text"]').value, 
                        'عام'
                    );
                    hideModal(type); this.switchTab('dashboard');
                }
            } catch (err) { console.error('UI Action Error:', err); }
        });
    },

    switchTab(tab) {
        this.currentTab = tab;
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        const link = document.querySelector(`.nav-link[onclick*="${tab}"]`);
        if (link) link.classList.add('active');

        const vp = document.getElementById('app-viewport');
        if (!vp) return;
        vp.innerHTML = '<div style="text-align:center; padding:5rem; opacity:0.5;">جاري المزامنة مع MongoDB...</div>';

        setTimeout(() => {
            if (tab === 'dashboard') this.renderDashboard();
            else if (tab === 'cards') this.renderCardsPro();
            else if (tab === 'expenses') this.renderTable('expense');
            else if (tab === 'incomes') this.renderTable('income');
        }, 50);
    },

    renderDashboard() {
        const stats = FinanceCore.getStats();
        const loans = FinanceCore.getLoanSummary();
        const cards = FinanceCore.getCardsSummary();
        const dti = FinanceCore.calculateDTI();
        const vp = document.getElementById('app-viewport');
        vp.innerHTML = `
            <div class="fade-in">
                <div class="section-header"><h1>الرئيسية (SaaS Mode)</h1><div style="display:flex; gap:1rem;"><button class="btn btn-primary" style="background:var(--danger);" onclick="showModal('expense')">مصروف</button><button class="btn btn-primary" style="background:var(--success);" onclick="showModal('income')">دخل</button></div></div>
                <div class="grid-3">
                    <div class="glass stat-card"><small>الرصيد</small><div class="stat-value">${FinanceCore.formatCurrency(stats.balance)}</div></div>
                    <div class="glass stat-card"><small>الديون</small><div class="stat-value" style="color:var(--danger);">${FinanceCore.formatCurrency(loans.totalRemaining + cards.totalUsed)}</div></div>
                    <div class="glass stat-card"><small>DTI</small><div class="stat-value" style="color:${this.dtiColor(dti.status)};">${dti.ratio}%</div></div>
                </div>
                <div class="grid-3" style="grid-template-columns: 2fr 1fr;">
                    <div class="glass chart-box"><canvas id="mainChart"></canvas></div>
                    <div class="glass" style="padding:1.5rem;"><h3>النشاط</h3><div id="recent-list"></div></div>
                </div>
            </div>`;
        this.renderCharts(stats); this.renderRecent();
    },

    renderCardsPro() {
        const s = FinanceCore.getCardsSummary();
        const vp = document.getElementById('app-viewport');
        vp.innerHTML = `
            <div class="fade-in">
                <div class="section-header"><h1>إدارة البطاقات Cloud</h1><button class="btn btn-primary" onclick="showModal('card-pro')">إضافة بطاقة</button></div>
                <div class="grid-2" style="gap:1.5rem;">${FinanceCore.data.cards.map(c => `
                    <div class="glass" style="padding:1.5rem; border-top:4px solid var(--primary);">
                        <h2>${c.name} <small>(${c.bank})</small></h2>
                        <div style="margin:1rem 0;"><small>المتاح: ${FinanceCore.formatCurrency(c.limit - c.used)}</small></div>
                        <div style="display:flex; gap:0.5rem;">
                            <button class="btn btn-primary btn-sm" onclick="UIManager.openCardTxn('${c._id || c.id}')">شراء</button>
                            <button class="btn btn-ghost btn-sm" onclick="UIManager.renderCardDetails('${c._id || c.id}')">الكشوفات</button>
                        </div>
                    </div>
                `).join('') || '<p>لا توجد بطاقات.</p>'}</div>
            </div>`;
    },

    renderCardDetails(id) {
        const c = FinanceCore.data.cards.find(x => (x._id || x.id) == id);
        const vp = document.getElementById('app-viewport');
        vp.innerHTML = `
            <div class="fade-in">
                <div class="section-header"><button class="btn btn-ghost" onclick="UIManager.switchTab('cards')">عودة</button><h1>${c.name}</h1></div>
                ${(c.statements || []).reverse().map(st => `
                    <div class="glass" style="padding:1.2rem; margin-bottom:1rem;">
                        <strong>${st.month}/${st.year}</strong> - مطلوب: ${FinanceCore.formatCurrency(st.amountDue)}
                    </div>
                `).join('') || '<p>لا توجد كشوف.</p>'}
            </div>`;
    },

    openCardTxn(id) { window.cid = id; showModal('card-txn'); },
    renderCharts(s) { if (typeof Chart === 'undefined') return; const ctx = document.getElementById('mainChart'); if (!ctx) return; new Chart(ctx, { type: 'doughnut', data: { labels: ['دخل','صرف'], datasets: [{ data: [s.income, s.expense], backgroundColor: ['#10b981', '#ef4444'] }] }, options: { cutout: '80%' } }); },
    renderRecent() { const list = document.getElementById('recent-list'); if (list) list.innerHTML = FinanceCore.data.transactions.slice(0,5).map(t => `<div style="padding:0.5rem 0; border-bottom:1px solid rgba(255,255,255,0.05);">${t.desc} - ${FinanceCore.formatCurrency(t.amount)}</div>`).join(''); },
    dtiColor: (s) => s === 'safe' ? 'var(--success)' : (s === 'medium' ? 'var(--warning)' : 'var(--danger)')
};

window.switchTab = (t) => UIManager.switchTab(t);
window.showModal = (id) => { const m = document.getElementById(`modal-${id}`); if (m) m.style.display = 'flex'; };
window.hideModal = (id) => { const m = document.getElementById(`modal-${id}`); if (m) m.style.display = 'none'; };
document.addEventListener('DOMContentLoaded', () => UIManager.init());
