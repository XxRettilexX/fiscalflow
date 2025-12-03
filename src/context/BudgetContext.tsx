import * as SecureStore from "expo-secure-store";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";

const BUDGET_SETTINGS_KEY = (uid: number) => `budget_settings_${uid}`;

interface BudgetSettings {
    monthlyIncome: string;
    savingsGoal: string;
    rentOrMortgage: string;
    subscriptions: string;
    utilities: string;
    otherFixed: string;
    carInsurance: string;
    weeklyGroceries: string;
    weeklyEntertainment: string;
    monthlyShopping: string;
}

interface BudgetSummary {
    totalFixedMonthly: number;
    remainingAfterFixed: number;
    totalVariable: number;
    finalSavings: number;
}

interface BudgetContextType {
    settings: BudgetSettings;
    summary: BudgetSummary;
    loading: boolean;
    saveSettings: (newSettings: BudgetSettings) => Promise<void>;
    loadSettings: () => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function useBudget() {
    const context = useContext(BudgetContext);
    if (!context) {
        throw new Error("useBudget must be used within a BudgetProvider");
    }
    return context;
}

export const BudgetProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<BudgetSettings>({
        monthlyIncome: "0", savingsGoal: "0", rentOrMortgage: "0",
        subscriptions: "0", utilities: "0", otherFixed: "0",
        carInsurance: "0", weeklyGroceries: "0", weeklyEntertainment: "0",
        monthlyShopping: "0",
    });

    const loadSettings = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const raw = await SecureStore.getItemAsync(BUDGET_SETTINGS_KEY(user.id));
            if (raw) {
                const loadedSettings = JSON.parse(raw);
                // Assicura che tutte le chiavi siano presenti per evitare errori
                const fullSettings = { ...settings, ...loadedSettings };
                setSettings(fullSettings);
            }
        } catch (e) {
            console.warn("Impossibile caricare impostazioni budget:", e);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const saveSettings = async (newSettings: BudgetSettings) => {
        if (!user) return;
        try {
            await SecureStore.setItemAsync(BUDGET_SETTINGS_KEY(user.id), JSON.stringify(newSettings));
            setSettings(newSettings);
            alert("Impostazioni salvate!");
        } catch (e) {
            console.error("Errore salvataggio impostazioni budget:", e);
            alert("Errore nel salvataggio.");
        }
    };

    const summary = useMemo(() => {
        const p = (v: string) => parseFloat(v) || 0;
        const totalFixedMonthly =
            p(settings.rentOrMortgage) + p(settings.subscriptions) + p(settings.utilities) +
            p(settings.otherFixed) + p(settings.carInsurance) / 12;
        const remainingAfterFixed = p(settings.monthlyIncome) - totalFixedMonthly;
        const totalVariable = (p(settings.weeklyGroceries) * 4) + (p(settings.weeklyEntertainment) * 4) + p(settings.monthlyShopping);
        const finalSavings = remainingAfterFixed - totalVariable;
        return { totalFixedMonthly, remainingAfterFixed, totalVariable, finalSavings };
    }, [settings]);

    return (
        <BudgetContext.Provider value={{ settings, summary, loading, saveSettings, loadSettings }}>
            {children}
        </BudgetContext.Provider>
    );
};