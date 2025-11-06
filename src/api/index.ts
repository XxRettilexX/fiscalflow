// src/api/index.ts
import * as SecureStore from "expo-secure-store";

const API_URL = "http://13.50.101.252/api";

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
        return apiFetch<{ token: string }>("/login", {
            method: "POST",
            body: JSON.stringify({ email, password }), // ✅ JSON.stringify!
        });
    },

    async register(name: string, email: string, password: string) {
        console.log("🆕 Registrazione utente:", email);
        return apiFetch<{ message: string }>("/register", {
            method: "POST",
            body: JSON.stringify({ name, email, password }), // ✅ JSON.stringify!
        });
    },

    async me() {
        console.log("👤 Richiesta /me");
        return apiFetch<{ id: number; name: string; email: string }>("/me", {
            method: "GET",
        });
    },
};

//
// 📊 FATTURE
//
export const invoiceApi = {
    async list() {
        return apiFetch<Invoice[]>("/invoices", { method: "GET" });
    },

    async get(id: number) {
        return apiFetch<Invoice>(`/invoices/${id}`, { method: "GET" });
    },

    async create(payload: Partial<Invoice>) {
        console.log("➕ Creazione fattura:", payload);
        return apiFetch<Invoice>("/invoices", {
            method: "POST",
            body: JSON.stringify(payload), // ✅
        });
    },

    async update(id: number, payload: Partial<Invoice>) {
        console.log("✏️ Aggiornamento fattura:", id, payload);
        return apiFetch<Invoice>(`/invoices/${id}`, {
            method: "PUT",
            body: JSON.stringify(payload), // ✅
        });
    },

    async delete(id: number) {
        console.log("🗑️ Eliminazione fattura:", id);
        return apiFetch<{ message: string }>(`/invoices/${id}`, { method: "DELETE" });
    },

    async stats() {
        return apiFetch<{ data: { month: string; total: number }[] }>("/invoices/stats", {
            method: "GET",
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
