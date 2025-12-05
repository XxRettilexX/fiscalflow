// App.tsx (root)
import { StripeProvider } from "@stripe/stripe-react-native";
import React from "react";
import { AuthProvider } from "./src/context/AuthContext";
import { BudgetProvider } from "./src/context/BudgetContext";
import { SettingsProvider } from "./src/context/SettingsContext";
import { SubscriptionProvider } from "./src/context/SubscriptionContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
    // 🔑 IMPORTANTE: Usa la tua chiave PUBBLICABILE di TEST di Stripe qui
    // La chiave deve iniziare con "pk_test_..."
    const STRIPE_PUBLISHABLE_KEY = "pk_live_51SVVhiJmbCmJUlLv8pgVQUOOCcrJbgl3qF3CHoGDkYqwNjalmOuVOhEvtJAQDFf6Z0ha5k41Ng60itCKao6YfJJD00VLnJV0A3"; // Usa una chiave di test valida

    return (
        <StripeProvider
            publishableKey={STRIPE_PUBLISHABLE_KEY}
        >
            <AuthProvider>
                <SettingsProvider>
                    <SubscriptionProvider>
                        <BudgetProvider>
                            <AppNavigator />
                        </BudgetProvider>
                    </SubscriptionProvider>
                </SettingsProvider>
            </AuthProvider>
        </StripeProvider>
    );
}
