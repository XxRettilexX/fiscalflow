// App.tsx (root)
import React from "react";
import { AuthProvider } from "./src/context/AuthContext";
import { BudgetProvider } from "./src/context/BudgetContext";
import { SettingsProvider } from "./src/context/SettingsContext";
import AppNavigator from "./src/navigation/AppNavigator";
export default function App() {
    return (
        <AuthProvider>
            <SettingsProvider>
                <BudgetProvider>
                    <AppNavigator />
                </BudgetProvider>
            </SettingsProvider>
        </AuthProvider>
    );
}
