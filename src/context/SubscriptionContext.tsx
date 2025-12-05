import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { subscriptionApi } from "../api";
import { useAuth } from "./AuthContext";

type Plan = "free" | "premium";

interface SubscriptionContextType {
    plan: Plan;
    loading: boolean;
    hasFeature: (feature: string) => boolean;
    confirmUpgrade: () => Promise<boolean>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (!context) throw new Error("useSubscription must be used within a SubscriptionProvider");
    return context;
}

const FEATURES: Record<Plan, string[]> = {
    free: ["dashboard", "budget_basic", "ads"],
    premium: ["dashboard", "budget_advanced", "ocr_receipt", "no_ads", "export_data"],
};

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
    const { token } = useAuth();
    const [plan, setPlan] = useState<Plan>("free");
    const [loading, setLoading] = useState(true);

    const refreshSubscription = useCallback(async () => {
        // Logica per caricare lo stato dell'abbonamento dal backend
        setLoading(false);
    }, [token]);

    useEffect(() => {
        if (token) refreshSubscription();
    }, [token, refreshSubscription]);

    const hasFeature = (feature: string): boolean => FEATURES[plan]?.includes(feature) ?? false;

    const confirmUpgrade = async (): Promise<boolean> => {
        try {
            const upgradeResponse = await subscriptionApi.upgradeSubscription();
            if (upgradeResponse.success) {
                setPlan("premium");
                return true;
            } else {
                Alert.alert("Errore", "Pagamento riuscito, ma aggiornamento fallito. Contatta il supporto.");
                return false;
            }
        } catch (error: any) {
            Alert.alert("Errore", error.message || "Qualcosa è andato storto durante la finalizzazione.");
            console.error("Errore durante confirmUpgrade:", error);
            return false;
        }
    };

    return (
        <SubscriptionContext.Provider value={{ plan, loading, hasFeature, confirmUpgrade }}>
            {children}
        </SubscriptionContext.Provider>
    );
};
