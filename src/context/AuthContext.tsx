import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api";

const TOKEN_KEYS = {
    ACCESS: "jwt_token",
    REFRESH: "refresh_token",
};

const SETTINGS_KEYS = {
    AUTO_LOGIN: "settings_auto_login",
    BIOMETRIC_LOGIN: "settings_biometric_login",
};

interface User {
    id: number;
    name: string;
    email: string;
}

interface AuthContextType {
    token: string | null;
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginWithBiometrics: () => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const bootstrapAsync = async () => {
            setLoading(true);
            try {
                const autoLoginEnabled = (await SecureStore.getItemAsync(SETTINGS_KEYS.AUTO_LOGIN)) === "true";
                const refreshToken = await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH);

                if (autoLoginEnabled && refreshToken) {
                    const biometricEnabled = (await SecureStore.getItemAsync(SETTINGS_KEYS.BIOMETRIC_LOGIN)) === "true";
                    if (biometricEnabled) {
                        // L'accesso biometrico verrà richiesto dalla schermata di Login
                        // Qui ci limitiamo a non fare nulla, lasciando che l'utente scelga
                        setLoading(false);
                        return;
                    }
                    // Procede con il refresh automatico
                    await handleRefreshToken(refreshToken);
                }
            } catch (e) {
                console.error("Bootstrap error:", e);
            } finally {
                setLoading(false);
            }
        };

        bootstrapAsync();
    }, []);

    const handleLoginSuccess = async (accessToken: string, refreshToken?: string) => {
        setToken(accessToken);
        await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS, accessToken);
        if (refreshToken) {
            await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH, refreshToken);
        }
        // Fetch user data
        const userData = await authApi.me();
        setUser(userData);
    };

    const handleRefreshToken = async (refreshToken: string) => {
        try {
            const { token: accessToken, refresh_token: newRefreshToken } = await authApi.refresh(refreshToken);
            await handleLoginSuccess(accessToken, newRefreshToken);
        } catch (error) {
            console.error("Refresh token failed, logging out.", error);
            await logout();
        }
    };

    const login = async (email: string, password: string) => {
        const { token: accessToken, refresh_token: refreshToken } = await authApi.login(email, password);
        await handleLoginSuccess(accessToken, refreshToken);
    };

    const loginWithBiometrics = async (): Promise<boolean> => {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (!hasHardware || !isEnrolled) {
            throw new Error("Biometria non disponibile o non configurata.");
        }

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: "Accedi con la tua biometria",
        });

        if (result.success) {
            const refreshToken = await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH);
            if (refreshToken) {
                setLoading(true);
                await handleRefreshToken(refreshToken);
                setLoading(false);
                return true;
            }
        }
        return false;
    };

    const logout = async () => {
        setToken(null);
        setUser(null);
        await SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS);

        // Non cancellare il refresh token se l'utente vuole usare ancora l'accesso automatico
        const autoLogin = await SecureStore.getItemAsync(SETTINGS_KEYS.AUTO_LOGIN);
        if (autoLogin !== 'true') {
            await SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH);
        }
    };

    return (
        <AuthContext.Provider value={{ token, user, loading, login, loginWithBiometrics, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
