export const API_BASE_URL = "http://172.31.4.179/fiscalflow-api/api";

export const api = {
    // 🔐 Login
    login: async (email: string, password: string) => {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) throw new Error("Errore login");
        return response.json();
    },

    logout: async () => {
        await fetch(`${API_BASE_URL}/logout`, { method: "POST" });
    },

    // 🧾 Fatture
    getInvoices: async () => {
        const res = await fetch(`${API_BASE_URL}/invoices`);
        if (!res.ok) throw new Error("Errore nel caricamento fatture");
        return res.json();
    },

    getInvoice: async (id: string | number) => {
        const res = await fetch(`${API_BASE_URL}/invoices/${id}`);
        if (!res.ok) throw new Error("Errore nel caricamento della fattura");
        return res.json();
    },

    createInvoice: async (data: any) => {
        const res = await fetch(`${API_BASE_URL}/invoices`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Errore creazione fattura");
        return res.json();
    },

    updateInvoice: async (id: string | number, data: any) => {
        const res = await fetch(`${API_BASE_URL}/invoices/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Errore aggiornamento fattura");
        return res.json();
    },

    deleteInvoice: async (id: string | number) => {
        const res = await fetch(`${API_BASE_URL}/invoices/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Errore eliminazione fattura");
        return res.json();
    },

    // 📊 Statistiche per Dashboard
    getInvoiceStats: async () => {
        const res = await fetch(`${API_BASE_URL}/invoices/stats`);
        if (!res.ok) throw new Error("Errore caricamento statistiche");
        return res.json();
    },

    // ⚠️ Avvisi fiscali
    getAlerts: async () => {
        const res = await fetch(`${API_BASE_URL}/alerts`);
        if (!res.ok) throw new Error("Errore caricamento avvisi");
        return res.json();
    },
};
