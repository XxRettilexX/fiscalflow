// src/api/index.ts
import * as SecureStore from "expo-secure-store";

const API_URL = "http://13.50.101.252/fiscalflow/api";

interface Invoice {
    id: number;
    number: string;
    customer_name: string;
    total_amount: number;
    status: string;
    issue_date: string;
    due_date: string;
}

// 🧩 Funzione base per tutte le chiamate API
export async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = await SecureStore.getItemAsync("jwt_token");

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    console.log("🌍 API CALL →", endpoint);
    console.log("📦 Header inviato:", headers);

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json().catch(() => ({}));
    console.log("📤 Risposta da", endpoint, "→", data);

    if (!response.ok) {
        throw new Error(data?.error || data?.message || `Errore ${response.status}`);
    }

    return data as T;
}

//
// 🔐 AUTENTICAZIONE
//
export const authApi = {
    async login(email: string, password: string) {
        console.log("📩 Tentativo login:", email);
        return apiFetch<{ token: string; refresh_token: string }>("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({ email, password }).toString(),
        });
    },

    async register({ name, email, password }: { name: string; email: string; password: string; }) {
        console.log("🆕 Registrazione utente:", email);
        return apiFetch<{ message: string }>("/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({ name, email, password }).toString(),
        });
    },

    async me() {
        console.log("👤 Richiesta /me");
        return apiFetch<{ id: number; name: string; email: string }>("/me", {
            method: "GET",
        });
    },

    async refresh(refreshToken: string) {
        console.log("🔄 Tentativo di refresh token");
        return apiFetch<{ token: string; refresh_token: string }>("/refresh", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({ refreshToken }).toString(),
        });
    },
};

//
// 📊 TRANSAZIONI E SPESE
//
export const expensesApi = {
    async list() {
        return apiFetch<Invoice[]>("/invoices", { method: "GET" });
    },

    async getDashboardSummary() {
        return apiFetch<{
            availableBalance: number;
            monthlyBudget: number;
            usedBudget: number;
            recentTransactions: any[];
        }>("/invoices/stats", { method: "GET" });
    },

    async create(payload: { amount: number; category: string; date: string; notes?: string; }) {
        const formData = {
            amount: String(payload.amount),
            category: payload.category,
            date: payload.date,
            ...(payload.notes && { notes: payload.notes }),
        };

        return apiFetch<any>("/invoices", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(formData).toString(),
        });
    },
};

//
// 🔔 AVVISI
//
export const alertApi = {
    async list() {
        return apiFetch<{ id: number; title: string; message: string }[]>("/alerts", {
            method: "GET",
        });
    },

    async create(title: string, message: string) {
        return apiFetch<{ message: string }>("/alerts", {
            method: "POST",
            body: JSON.stringify({ title, message }), // ✅
        });
    },
};
