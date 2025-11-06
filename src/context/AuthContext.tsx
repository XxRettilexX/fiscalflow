import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api";

interface AuthContextType {
    user: any;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    biometricLogin: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // 🔹 Recupera il token salvato all'avvio (se presente)
    useEffect(() => {
        const loadToken = async () => {
            const savedToken = await SecureStore.getItemAsync("jwt_token");
            console.log("🔑 Token salvato trovato:", savedToken);

            if (savedToken) {
                setToken(savedToken);
                try {
                    const u = await authApi.me();
                    console.log("✅ Dati utente caricati da /api/me:", u);
                    setUser(u);
                } catch (err) {
                    console.log("❌ Errore caricamento /api/me:", err);
                    await SecureStore.deleteItemAsync("jwt_token");
                    setToken(null);
                }
            } else {
                console.log("⚠️ Nessun token trovato in SecureStore");
            }

            setLoading(false);
        };
        loadToken();
    }, []);

    const login = async (email: string, password: string) => {
        console.log("📩 Tentativo di login con:", email);
        const data = await authApi.login(email, password);
        console.log("✅ Risposta login:", data);

        const jwt = data.token;
        await SecureStore.setItemAsync("jwt_token", jwt);
        setToken(jwt);

        const u = await authApi.me();
        console.log("✅ Utente dopo login:", u);
        setUser(u);
    };


    // 🔹 Login biometrico (FaceID / impronta)
    const biometricLogin = async () => {
        const savedToken = await SecureStore.getItemAsync("jwt_token");
        if (!savedToken) return false;

        const compatible = await LocalAuthentication.hasHardwareAsync();
        if (!compatible) return false;

        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (!enrolled) return false;

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: "Accedi a FiscalFlow",
        });

        if (result.success) {
            setToken(savedToken);
            try {
                const u = await authApi.me(); // ✅ carica l'utente
                setUser(u);
                return true;
            } catch {
                return false;
            }
        }
        return false;
    };

    // 🔹 Logout manuale
    const logout = async () => {
        setToken(null);
        setUser(null);
        await SecureStore.deleteItemAsync("jwt_token");
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, biometricLogin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
