import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";

type AuthState = {
    isLoading: boolean;
    token: string | null;
    email: string | null;
    setAuth: (t: string | null, e: string | null) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
    isLoading: true,
    token: null,
    email: null,
    setAuth: async () => { },
    logout: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setLoading] = useState(true);
    const [token, setToken] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const t = await SecureStore.getItemAsync("fiscalflow_token");
            const e = await SecureStore.getItemAsync("fiscalflow_email");
            setToken(t ?? null);
            setEmail(e ?? null);
            setLoading(false);
        })();
    }, []);

    const setAuth = async (t: string | null, e: string | null) => {
        if (t) await SecureStore.setItemAsync("fiscalflow_token", t);
        else await SecureStore.deleteItemAsync("fiscalflow_token");
        if (e) await SecureStore.setItemAsync("fiscalflow_email", e);
        else await SecureStore.deleteItemAsync("fiscalflow_email");
        setToken(t);
        setEmail(e);
    };

    const logout = async () => {
        await SecureStore.deleteItemAsync("fiscalflow_token");
        await SecureStore.deleteItemAsync("fiscalflow_email");
        setToken(null);
        setEmail(null);
    };

    return (
        <AuthContext.Provider value={{ isLoading, token, email, setAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
