import { BottomTabNavigationOptions, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { NativeStackNavigationOptions, createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
// Icone
import { Ionicons } from "@expo/vector-icons";
// Screens
import AddExpenseScreen from "@screens/AddExpenseScreen";
import DashboardScreen from "@screens/DashboardScreen";
import LoginScreen from "@screens/LoginScreen";
import ProfileScreen from "@screens/ProfileScreen";
import RegisterScreen from "@screens/RegisterScreen";
import SplashScreen from "@screens/SplashScreen";
import StatisticsScreen from "@screens/StatisticsScreen";
import AboutScreen from "../screens/AboutScreen"; // Importa la nuova schermata
import SupportScreen from "../screens/SupportScreen"; // Importa la nuova schermata
// Hooks
import { Colors } from "../constants/colors";
import { useAuth } from "../context/AuthContext";
import { AuthStackParamList, MainTabParamList, RootStackParamList } from "./types"; // Importa i tipi definiti

// --- Definizione dei tipi per le rotte ---

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const Auth = createNativeStackNavigator<AuthStackParamList>();

// --- Aree dell'app ---

const tabScreenOptions: BottomTabNavigationOptions = {
    headerShown: false,
    tabBarStyle: { backgroundColor: Colors.surface, borderTopColor: Colors.bg },
    tabBarActiveTintColor: Colors.primary,
    tabBarInactiveTintColor: Colors.text,
};

// 🔒 Navigatore principale quando l'utente è autenticato
function MainAppTabs() {
    return (
        <Tab.Navigator
            id="MainTabNavigator" // Aggiunto `id` con valore esplicito
            screenOptions={tabScreenOptions}
        >
            <Tab.Screen
                name="Home"
                component={DashboardScreen}
                options={{
                    tabBarLabel: "Home",
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Statistics"
                component={StatisticsScreen}
                options={{
                    tabBarLabel: "Statistiche",
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons name={focused ? "stats-chart" : "stats-chart-outline"} size={size} color={color} />
                    ),
                }}
            />
            {/* Pulsante centrale "Scan" */}
            <Tab.Screen
                name="AddExpense"
                component={AddExpenseScreen}
                options={{
                    tabBarLabel: "",
                    tabBarIcon: () => (
                        <View style={styles.scanButton}>
                            <Text style={styles.scanButtonText}>+</Text>
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: "Profilo",
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

const stackScreenOptions: NativeStackNavigationOptions = {
    headerShown: false,
};

// 🚪 Navigatore per il flusso di autenticazione
function AuthFlowStack() {
    return (
        <Auth.Navigator
            id={undefined}
            screenOptions={stackScreenOptions}
        >
            <Auth.Screen name="Login" component={LoginScreen} />
            <Auth.Screen name="Register" component={RegisterScreen} />
        </Auth.Navigator>
    );
}

// --- Navigatore Principale ---
export default function AppNavigator() {
    const { token, loading } = useAuth();

    return (
        <NavigationContainer>
            <RootStack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
                {loading ? (
                    <RootStack.Screen name="Splash" component={SplashScreen} />
                ) : token ? (
                    <RootStack.Group>
                        <RootStack.Screen name="MainApp" component={MainAppTabs} />
                    </RootStack.Group>
                ) : (
                    <RootStack.Screen name="AuthFlow" component={AuthFlowStack} />
                )}
                <RootStack.Group screenOptions={{ presentation: 'modal', headerShown: true }}>
                    <RootStack.Screen name="Support" component={SupportScreen} />
                    <RootStack.Screen name="About" component={AboutScreen} />
                </RootStack.Group>
            </RootStack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    scanButton: {
        backgroundColor: Colors.primary,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        bottom: 20, // Sposta il pulsante verso l'alto
        borderWidth: 4,
        borderColor: Colors.surface,
    },
    scanButtonText: {
        color: "white",
        fontSize: 30,
        fontWeight: "bold",
    },
});
