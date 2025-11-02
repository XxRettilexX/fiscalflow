// App.tsx (root)
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import NotificationsGate from "./src/notification/NotificationsGate";
export default function App() {
    return (
        <SafeAreaProvider>
            <NotificationsGate />
            <AppNavigator />
        </SafeAreaProvider>
    );
}
