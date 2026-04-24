/**
 * Financial Core Engine V9.0 (Full-Stack / MongoDB Edition)
 */

const FinanceCore = {
    data: { transactions: [], loans: [], cards: [] },
    API_URL: '/api',

    async init() {
        try {
            const res = await fetch(`${this.API_URL}/sync`);
            const remoteData = await res.json();
            if (remoteData) {
                this.data.transactions = remoteData.transactions || [];
                this.data.loans = remoteData.loans || [];
                this.data.cards = remoteData.cards || [];
            }
            console.log('✅ Data synced from MongoDB');
        } catch (e) {
            console.warn('⚠️ Offline: Loading from local backup');
            const saved = localStorage.getItem('mohafazati_backup');
            if (saved) this.data = JSON.parse(saved);
        }
        // Initial render trigger through UI
        if (window.UIManager) window.UIManager.switchTab('dashboard');
    },

    saveLocal() {
        localStorage.setItem('mohafazati_backup', JSON.stringify(this.data));
    },

    async addTransaction(type, amount, desc, cat) {
        const txn = { type, amount: parseFloat(amount), desc, cat, date: new Date().toISOString() };
        try {
            const res = await fetch(`${this.API_URL}/transactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(txn)
            });
            const saved = await res.json();
            this.data.transactions.unshift(saved);
            this.saveLocal();
        } catch (e) { console.error('Failed to save transaction', e); }
    },

    async addCardPro(p) {
        const card = {
            name: p.name, bank: p.bank, last4: p.last4, type: p.type,
            limit: parseFloat(p.limit), used: 0, statementDay: parseInt(p.statementDay),
            dueDay: parseInt(p.dueDay), interestRate: parseFloat(p.interestRate) || 0,
            minPayPercent: parseFloat(p.minPayPercent) || 5, lateFee: parseFloat(p.lateFee) || 0,
            status: 'active', statements: [], installments: []
        };
        try {
            const res = await fetch(`${this.API_URL}/cards`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(card)
            });
            const saved = await res.json();
            this.data.cards.push(saved);
            this.saveLocal();
        } catch (e) { console.error('Failed to save card', e); }
    },

    async addLoan(p) {
        const inst = parseFloat(p.monthlyInstallment);
        const months = parseInt(p.durationMonths);
        const total = inst * months;
        const loan = { 
            name: p.name, principal: parseFloat(p.principal), totalPayback: total, 
            remaining: total, status: 'active', installments: [] 
        };
        for (let i = 1; i <= months; i++) {
            let d = new Date(); d.setMonth(d.getMonth() + (i - 1));
            loan.installments.push({ dueDate: d.toISOString().split('T')[0], amount: inst, status: 'unpaid', paidAmount: 0 });
        }
        try {
            const res = await fetch(`${this.API_URL}/loans`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loan)
            });
            const saved = await res.json();
            this.data.loans.push(saved);
            this.saveLocal();
        } catch (e) { console.error('Failed to save loan', e); }
    },

    getStats() {
        let inc = 0, exp = 0;
        this.data.transactions.forEach(t => { t.type === 'income' ? inc += t.amount : exp += t.amount; });
        return { income: inc, expense: exp, balance: inc - exp };
    },

    getCardsSummary() {
        const s = { totalLimit: 0, totalUsed: 0, dueThisMonth: 0, activeCards: 0, nextDue: null };
        this.data.cards.forEach(c => {
            if (c.status === 'active') s.activeCards++;
            s.totalLimit += c.limit; s.totalUsed += c.used;
            (c.statements || []).forEach(st => {
                if (st.status !== 'paid' && st.month === (new Date().getMonth() + 1)) {
                    s.dueThisMonth += (st.amountDue - st.paidAmount);
                    if (!s.nextDue || new Date(st.dueDate) < new Date(s.nextDue)) s.nextDue = st.dueDate;
                }
            });
        });
        return s;
    },

    getLoanSummary() {
        let remaining = 0, thisMonth = 0;
        this.data.loans.forEach(l => {
            remaining += l.remaining;
            (l.installments || []).forEach(i => {
                if (i.status !== 'paid' && new Date(i.dueDate).getMonth() === new Date().getMonth()) thisMonth += i.amount;
            });
        });
        return { totalRemaining: remaining, thisMonth, active: this.data.loans.filter(l => l.status === 'active').length };
    },

    calculateDTI() {
        const s = this.getLoanSummary(); const c = this.getCardsSummary();
        const inc = this.getStats().income || 1;
        const ratio = ((s.thisMonth + c.dueThisMonth) / inc) * 100;
        return { ratio: ratio.toFixed(1), status: ratio > 45 ? 'danger' : (ratio > 30 ? 'medium' : 'safe') };
    },

    formatCurrency(v) { return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(v || 0); },
    resetAll() { if(confirm('⚠️ سيتم مسح البيانات المحلية فقط، هل أنت متأكد؟')) { localStorage.removeItem('mohafazati_backup'); location.reload(); } }
};

FinanceCore.init();
window.FinanceCore = FinanceCore;
