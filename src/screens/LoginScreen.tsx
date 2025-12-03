// src/screens/LoginScreen.tsx
import { Colors } from "@constants/colors";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";

export default function LoginScreen() {
    const { login, loginWithBiometrics } = useAuth();
    const { colors, dynamicFontSize } = useSettings();
    const navigation = useNavigation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

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
            setServerError("Inserisci email e password.");
            return;
        }

        setServerError(null);
        try {
            setIsLoading(true);
            await login(email, password);
            // accesso riuscito: AppNavigator reagisce al cambio di stato
        } catch (err: any) {
            const msg = err?.message || "Accesso non riuscito. Verifica le credenziali o riprova.";
            setServerError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBiometricLogin = async () => {
        setServerError(null);
        try {
            setIsLoading(true);
            const success = await loginWithBiometrics();
            if (!success) {
                setServerError("Accesso biometrico non riconosciuto.");
            }
        } catch (error: any) {
            setServerError(error?.message || "Errore durante l'accesso biometrico.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.container}>
            <View style={styles.inner}>
                <Text style={[styles.title, { fontSize: dynamicFontSize(32) }]}>FiscalFlow</Text>
                <Text style={[styles.subtitle, { fontSize: dynamicFontSize(16), color: colors.white }]}>Accedi al tuo account</Text>

                <TextInput
                    placeholder="Email"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.input, { backgroundColor: 'rgba(255, 255, 255, 0.2)', color: colors.white, fontSize: dynamicFontSize(16) }]}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TextInput
                    placeholder="Password"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.input, { backgroundColor: 'rgba(255, 255, 255, 0.2)', color: colors.white, fontSize: dynamicFontSize(16) }]}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity style={[styles.loginBtn, { backgroundColor: colors.accent }]} onPress={handleLogin} disabled={isLoading}>
                    {isLoading ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <Text style={[styles.loginText, { fontSize: dynamicFontSize(16) }]}>Accedi</Text>
                    )}
                </TouchableOpacity>

                {serverError ? <Text style={[styles.errorText, { color: colors.danger, fontSize: dynamicFontSize(14) }]}>{serverError}</Text> : null}

                {biometricAvailable && (
                    <TouchableOpacity onPress={handleBiometricLogin} style={styles.biometricBtn}>
                        <FontAwesome5 name="fingerprint" size={22} color={colors.white} />
                        <Text style={[styles.biometricText, { color: colors.white, fontSize: dynamicFontSize(14) }]}>Accedi con biometria</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity onPress={() => navigation.navigate("Register" as never)} style={{ marginTop: 15 }}>
                    <Text style={[styles.registerText, { color: colors.white, fontSize: dynamicFontSize(14) }]}>Non hai un account? Registrati</Text>
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
        fontWeight: "800",
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        textAlign: "center",
        marginBottom: 40,
        opacity: 0.9,
    },
    input: {
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    loginBtn: {
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
    },
    loginText: { color: Colors.white, fontWeight: "700" },
    biometricBtn: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 24,
        gap: 12,
    },
    biometricText: { color: Colors.white, fontWeight: "500" },
    registerText: {
        textAlign: "center",
        marginTop: 24,
        textDecorationLine: "underline",
    },
    errorText: {
        textAlign: "center",
        marginTop: 12,
    },
});
