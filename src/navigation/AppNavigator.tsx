import { AuthProvider } from "@context/AuthContext";
import { NavigationContainer, NavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useRef, useState } from "react";

// Screens
import DashboardScreen from "@screens/DashboardScreen";
import InvoicesScreen from "@screens/InvoicesScreen";
import LoginScreen from "@screens/LoginScreen";
import NewInvoiceScreen from "@screens/NewInvoiceScreen";
import RegisterScreen from "@screens/RegisterScreen";
import SplashScreen from "@screens/SplashScreen";

export type RootStackParamList = {
    Splash: undefined;
    Login: undefined;
    Register: undefined;
    Dashboard: undefined;
    Invoices: undefined;
    NewInvoice: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
    const [splashDone, setSplashDone] = useState(false);

    const handleSplashFinish = (next: "login" | "dashboard") => {
        setSplashDone(true);
        const route = next === "dashboard" ? "Dashboard" : "Login";

        navigationRef.current?.reset({
            index: 0,
            routes: [{ name: route }],
        });
    };

    return (
        <AuthProvider>
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator
                    id={undefined} // ✅ fix definitivo per il bug di tipizzazione
                    initialRouteName="Splash"
                    screenOptions={{ headerShown: false }}
                >
                    {!splashDone && (
                        <Stack.Screen name="Splash">
                            {() => <SplashScreen onFinish={handleSplashFinish} />}
                        </Stack.Screen>
                    )}

                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                    <Stack.Screen name="Dashboard" component={DashboardScreen} />
                    <Stack.Screen name="Invoices" component={InvoicesScreen} />
                    <Stack.Screen name="NewInvoice" component={NewInvoiceScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </AuthProvider>
    );
}
