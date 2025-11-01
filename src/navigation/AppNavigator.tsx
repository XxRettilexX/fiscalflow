import { AuthProvider, useAuth } from "@context/AuthContext";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DashboardScreen from "@screens/DashboardScreen";
import LoginScreen from "@screens/LoginScreen";
import RegisterScreen from "@screens/RegisterScreen";
import SplashScreen from "@screens/SplashScreen";
import React from "react";
import { RootStackParamList } from "./types"; // 👈 usa il file nuovo



const Stack = createNativeStackNavigator<RootStackParamList>();

function RootStack() {
    const { isLoading, token } = useAuth();
    return (
        <NavigationContainer>
            <Stack.Navigator
                id={undefined}
                screenOptions={{ headerShown: false }}
            >
                {isLoading ? (
                    <Stack.Screen name="Splash" component={SplashScreen} />
                ) : token ? (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Dashboard" component={DashboardScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                        <Stack.Screen name="Dashboard" component={DashboardScreen} />
                    </>
                )}
            </Stack.Navigator>

        </NavigationContainer>
    );
}

export default function AppNavigator() {
    return (
        <AuthProvider>
            <RootStack />
        </AuthProvider>
    );
}
