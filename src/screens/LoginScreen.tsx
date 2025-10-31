import { FontAwesome5 } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
    checkBiometricAvailability,
    getBiometricType,
    getToken,
    requestBiometricPermission,
    saveToken
} from "@services/biometric";
import * as LocalAuthentication from "expo-local-authentication"; // ✅ aggiungi questa riga
import React, { useEffect, useState } from "react";
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { RootStackParamList } from "../navigation/AppNavigator";


type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [biometricType, setBiometricType] = useState<"fingerprint" | "face" | "iris" | "none">("none");

    useEffect(() => {
        const initBio = async () => {
            const available = await checkBiometricAvailability();
            const type = await getBiometricType();
            setBiometricEnabled(available);
            setBiometricType(type);
        };
        initBio();
    }, []);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Errore", "Inserisci email e password");
            return;
        }
        await saveToken("fake_jwt_token_for_testing");
        Alert.alert("Login completato", "Token salvato in SecureStore ✅");
        navigation.replace("Dashboard");
    };

    const handleBiometricLogin = async () => {
        const token = await getToken();
        if (!token) {
            Alert.alert("Attenzione", "Esegui almeno un login manuale prima.");
            return;
        }

        const granted = await requestBiometricPermission();
        if (!granted) {
            Alert.alert(
                "Face ID disattivato",
                "Per usare il Face ID, vai in Impostazioni → Privacy → Face ID → Expo Go e abilita l'accesso."
            );
            return;
        }

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: "Accedi con Face ID",
            fallbackLabel: "Usa codice di sblocco",
            disableDeviceFallback: true,
            requireConfirmation: false,
        }) as any;

        if (result.success) {
            navigation.replace("Dashboard");
        } else {
            switch (result.error) {
                case "lockout":
                    Alert.alert(
                        "Face ID bloccato",
                        "Troppi tentativi falliti. Sblocca il dispositivo con il codice, poi riprova."
                    );
                    break;
                case "user_cancel":
                    // utente ha annullato manualmente
                    break;
                default:
                    Alert.alert(
                        "Autenticazione fallita",
                        "Il Face ID non è riuscito a riconoscerti. Riprova o accedi manualmente."
                    );
            }
        }
    };

    const label =
        biometricType === "fingerprint"
            ? "Accedi con impronta"
            : biometricType === "face"
                ? Platform.OS === "ios"
                    ? "Accedi con Face ID"
                    : "Accedi con riconoscimento facciale"
                : "Accedi con biometria";

    return (
        <View style={styles.container}>
            <Text style={styles.title}>FiscalFlow</Text>

            <TextInput
                placeholder="Email"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />
            <TextInput
                placeholder="Password"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
                <Text style={styles.primaryButtonText}>Accedi</Text>
            </TouchableOpacity>

            {biometricEnabled && (
                <TouchableOpacity style={styles.bioButton} onPress={handleBiometricLogin}>
                    <FontAwesome5
                        name={biometricType === "face" ? "user-circle" : "fingerprint"}
                        size={20}
                        color="#fff"
                    />
                    <Text style={styles.bioButtonText}>{label}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, justifyContent: "center", backgroundColor: "#F8FAFC" },
    title: { fontSize: 34, fontWeight: "700", color: "#1A4C8B", marginBottom: 28, textAlign: "center" },
    input: { backgroundColor: "#fff", padding: 12, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: "#E0E6ED" },
    primaryButton: { backgroundColor: "#1A4C8B", padding: 14, borderRadius: 12, alignItems: "center", marginTop: 8 },
    primaryButtonText: { color: "#fff", fontWeight: "600" },
    bioButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 16, backgroundColor: "#2ECC71", padding: 12, borderRadius: 12 },
    bioButtonText: { color: "#fff", marginLeft: 10, fontWeight: "600" },
});
