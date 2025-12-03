// src/screens/LoginScreen.tsx
import { Colors } from "@constants/colors";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
    const { login, loginWithBiometrics } = useAuth();
    const navigation = useNavigation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const checkBiometric = async () => {
            const enabled = await SecureStore.getItemAsync("settings_biometric_login");
            if (enabled === "true") {
                setBiometricAvailable(true);
            }
        };
        checkBiometric();
    }, []);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Errore", "Inserisci email e password");
            return;
        }

        try {
            setIsLoading(true);
            await login(email, password);
            Alert.alert("✅ Accesso riuscito", "Benvenuto in FiscalFlow!");
            // Correzione: naviga a 'MainApp' che contiene i tab
            navigation.reset({
                index: 0,
                routes: [{ name: "MainApp" as never }],
            });
        } catch (err: any) {
            Alert.alert("Errore", err.message || "Accesso non riuscito");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBiometricLogin = async () => {
        try {
            const success = await loginWithBiometrics();
            if (!success) {
                Alert.alert("Accesso Fallito", "La biometria non è stata riconosciuta.");
            } else {
                Alert.alert("✅ Accesso biometrico riuscito", "Bentornato!");
                // Correzione: naviga a 'MainApp' che contiene i tab
                navigation.reset({
                    index: 0,
                    routes: [{ name: "MainApp" as never }],
                });
            }
        } catch (error) {
            Alert.alert("Errore Biometrico", error.message);
        }
    };

    return (
        <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.container}>
            <View style={styles.inner}>
                <Text style={styles.title}>FiscalFlow</Text>
                <Text style={styles.subtitle}>Accedi al tuo account</Text>

                <TextInput
                    placeholder="Email"
                    placeholderTextColor={Colors.textMuted}
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TextInput
                    placeholder="Password"
                    placeholderTextColor={Colors.textMuted}
                    style={styles.input}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={isLoading}>
                    {isLoading ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <Text style={styles.loginText}>Accedi</Text>
                    )}
                </TouchableOpacity>

                {biometricAvailable && (
                    <TouchableOpacity onPress={handleBiometricLogin} style={styles.biometricBtn}>
                        <FontAwesome5 name="fingerprint" size={22} color={Colors.white} />
                        <Text style={styles.biometricText}>Accedi con biometria</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity onPress={() => navigation.navigate("Register" as never)} style={{ marginTop: 15 }}>
                    <Text style={styles.registerText}>Non hai un account? Registrati</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center" },
    inner: { padding: 24 },
    title: {
        color: Colors.white,
        fontSize: 32,
        fontWeight: "800",
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        color: Colors.white,
        textAlign: "center",
        marginBottom: 40,
        fontSize: 16,
        opacity: 0.9,
    },
    input: {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginBottom: 12,
        fontSize: 16,
        color: Colors.white,
    },
    loginBtn: {
        backgroundColor: Colors.accent,
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
    },
    loginText: { color: Colors.white, fontWeight: "700", fontSize: 16 },
    biometricBtn: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 24,
        gap: 12,
    },
    biometricText: { color: Colors.white, fontSize: 14, fontWeight: "500" },
    registerText: {
        color: Colors.white,
        textAlign: "center",
        marginTop: 24,
        fontSize: 14,
        textDecorationLine: "underline",
    },
});
