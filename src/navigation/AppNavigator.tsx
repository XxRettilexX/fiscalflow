import { AuthProvider, useAuth } from "@context/AuthContext";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator, NativeStackNavigationOptions } from "@react-navigation/native-stack";
import React from "react";

import DashboardScreen from "@screens/DashboardScreen";
import InvoicesScreen from "@screens/InvoicesScreen";
import LoginScreen from "@screens/LoginScreen";
import RegisterScreen from "@screens/RegisterScreen";
import SplashScreen from "@screens/SplashScreen";
import { StyleSheet, Text, View } from "react-native";

// ✅ Placeholder temporaneo per “Nuova Fattura”
function NewInvoiceScreen() {
    return (
        <View style={styles.centered}>
            <Text style={styles.title}>Nuova Fattura</Text>
            <Text style={styles.subtitle}>
                Qui potrai creare una nuova fattura (form in sviluppo).
            </Text>
        </View>
    );
}

// ✅ Tipi di rotte
export type RootStackParamList = {
    Splash: undefined;
    Login: undefined;
    Register: undefined;
    Dashboard: undefined;
    Invoices: undefined;
    NewInvoice: undefined;
};

// ✅ Stack configurato
const Stack = createNativeStackNavigator<RootStackParamList>();

function RootStack() {
    const { isLoading, token } = useAuth();
    const screenOptions: NativeStackNavigationOptions = { headerShown: false };

    return (
        <NavigationContainer>
            <Stack.Navigator {...({ screenOptions } as any)}>
                {isLoading ? (
                    <Stack.Screen name="Splash" component={SplashScreen} />
                ) : token ? (
                    <>
                        <Stack.Screen name="Dashboard" component={DashboardScreen} />
                        <Stack.Screen name="Invoices" component={InvoicesScreen} />
                        <Stack.Screen name="NewInvoice" component={NewInvoiceScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                        <Stack.Screen name="Dashboard" component={DashboardScreen} />
                        <Stack.Screen name="Invoices" component={InvoicesScreen} />
                        <Stack.Screen name="NewInvoice" component={NewInvoiceScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

// ✅ Export principale
export default function AppNavigator() {
    return (
        <AuthProvider>
            <RootStack />
        </AuthProvider>
    );
}

// ✅ Stili minimi
const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    title: { fontSize: 22, fontWeight: "700" },
    subtitle: { marginTop: 8, color: "#555", textAlign: "center" },
});
