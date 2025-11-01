import { Colors } from "@constants/colors";
import { useAuth } from "@context/AuthContext";
import { FontAwesome5 } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { performBiometricAuth } from "@services/biometric";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { RootStackParamList } from "../navigation/types";


type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
    const { token, email: storedEmail, setAuth } = useAuth();
    const [email, setEmail] = useState(storedEmail ?? "");
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (storedEmail) setEmail(storedEmail);
    }, [storedEmail]);

    const handleManualLogin = async () => {
        if (!email || !password) {
            Alert.alert("Errore", "Inserisci email e password");
            return;
        }
        // TODO: sostituisci con chiamata reale al backend
        await setAuth("fake_jwt_token_for_testing", email);
        navigation.replace("Dashboard");
    };

    const handleBiometricLogin = async () => {
        const t = await SecureStore.getItemAsync("fiscalflow_token");
        if (!t) {
            Alert.alert("Attenzione", "Nessun token salvato. Effettua il login manuale almeno una volta.");
            return;
        }
        const res = await performBiometricAuth();
        if (res.success) navigation.replace("Dashboard");
        else Alert.alert("Autenticazione", res.message);
    };

    const showBiometric = !!token && !!storedEmail; // token presente → consenti login rapido
    const title = token ? "Bentornato 👋" : "Accedi a FiscalFlow";

    return (
        <View style={styles.container}>
            <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.header}>
                <Text style={styles.headerTitle}>FiscalFlow</Text>
                <Text style={styles.headerSubtitle}>{title}</Text>
            </LinearGradient>

            <View style={styles.card}>
                {/* Se non c'è token → mostra form completo + link Registrati */}
                {!token && (
                    <>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            placeholder="name@email.com"
                            placeholderTextColor={Colors.textMuted}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            style={styles.input}
                        />

                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            placeholder="••••••••"
                            placeholderTextColor={Colors.textMuted}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            style={styles.input}
                        />

                        <TouchableOpacity style={styles.primaryButton} onPress={handleManualLogin}>
                            <Text style={styles.primaryButtonText}>Accedi</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate("Register")} style={styles.linkWrap}>
                            <Text style={styles.linkText}>Non hai un account? <Text style={{ color: Colors.primary }}>Registrati</Text></Text>
                        </TouchableOpacity>
                    </>
                )}

                {/* Se c’è token/email → consenti login classico (per cambiare user) + login biometrico */}
                {token && (
                    <>
                        <View style={{ marginBottom: 10 }}>
                            <Text style={styles.label}>Accesso rapido per</Text>
                            <Text style={styles.chip}>{storedEmail}</Text>
                        </View>

                        {showBiometric && (
                            <TouchableOpacity style={styles.bioButton} onPress={handleBiometricLogin}>
                                <FontAwesome5 name={Platform.OS === "ios" ? "user-circle" : "fingerprint"} size={18} color={Colors.white} />
                                <Text style={styles.bioButtonText}>
                                    {Platform.OS === "ios" ? "Accedi con Face ID (Expo Go → passcode)" : "Accedi con impronta"}
                                </Text>
                            </TouchableOpacity>
                        )}

                        <View style={styles.dividerWrap}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>oppure</Text>
                            <View style={styles.divider} />
                        </View>

                        {/* Accesso con credenziali per cambiare utente */}
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            placeholder="name@email.com"
                            placeholderTextColor={Colors.textMuted}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            style={styles.input}
                        />
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            placeholder="••••••••"
                            placeholderTextColor={Colors.textMuted}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            style={styles.input}
                        />
                        <TouchableOpacity style={styles.primaryButtonOutline} onPress={handleManualLogin}>
                            <Text style={styles.primaryButtonOutlineText}>Accedi con email</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    header: { height: 200, paddingHorizontal: 22, paddingTop: 56, justifyContent: "center" },
    headerTitle: { color: Colors.white, fontSize: 28, fontWeight: "800" },
    headerSubtitle: { color: "#E6EDF7", marginTop: 6 },
    card: {
        backgroundColor: Colors.white,
        marginTop: -40,
        marginHorizontal: 16,
        padding: 18,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: Colors.primaryDark,
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    label: { color: Colors.textMuted, marginBottom: 6, marginTop: 8 },
    input: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 12,
        borderRadius: 12,
        color: Colors.text,
        marginBottom: 8,
    },
    primaryButton: {
        backgroundColor: Colors.primary,
        padding: 14,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 12,
    },
    primaryButtonText: { color: Colors.white, fontWeight: "700" },
    linkWrap: { marginTop: 14, alignItems: "center" },
    linkText: { color: Colors.textMuted },
    chip: {
        alignSelf: "flex-start",
        backgroundColor: "#EEF4FF",
        color: Colors.primaryDark,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        overflow: "hidden",
        fontWeight: "600",
    },
    bioButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.accent,
        padding: 12,
        borderRadius: 12,
        marginTop: 8,
    },
    bioButtonText: { color: Colors.white, marginLeft: 10, fontWeight: "700" },
    dividerWrap: { flexDirection: "row", alignItems: "center", marginVertical: 14 },
    divider: { flex: 1, height: 1, backgroundColor: Colors.border },
    dividerText: { marginHorizontal: 8, color: Colors.textMuted, fontSize: 12 },
    primaryButtonOutline: {
        borderWidth: 1.5,
        borderColor: Colors.primary,
        padding: 14,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 8,
    },
    primaryButtonOutlineText: { color: Colors.primary, fontWeight: "700" },
});
