import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DashboardScreen from "@screens/DashboardScreen";
import EditInvoiceScreen from "@screens/EditInvoiceScreen";
import InvoiceDetailScreen from "@screens/InvoiceDetailScreen";
import InvoicesScreen from "@screens/InvoicesScreen";
import LoginScreen from "@screens/LoginScreen";
import NewInvoiceScreen from "@screens/NewInvoiceScreen";
import ProfileScreen from "@screens/ProfileScreen";
import RegisterScreen from "@screens/RegisterScreen";
import SplashScreen from "@screens/SplashScreen";
import React from "react";

export type RootStackParamList = {
    Splash: undefined;
    Login: undefined;
    Register: undefined;
    Dashboard: undefined;
    Invoices: undefined;
    NewInvoice: undefined;
    InvoiceDetail: { id: string };
    EditInvoice: { id: string };
    Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                id={undefined}
                initialRouteName="Splash"
                screenOptions={{
                    headerShown: false,
                    animation: "fade",
                }}
            >
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Dashboard" component={DashboardScreen} />
                <Stack.Screen name="Invoices" component={InvoicesScreen} />
                <Stack.Screen name="NewInvoice" component={NewInvoiceScreen} />
                <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
                <Stack.Screen name="EditInvoice" component={EditInvoiceScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
