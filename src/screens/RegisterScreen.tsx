import { Colors } from "@constants/colors";
import { useAuth } from "@context/AuthContext";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function RegisterScreen({ navigation }: any) {
    const { setAuth } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async () => {
        if (!email || !password) {
            Alert.alert("Errore", "Inserisci email e password");
            return;
        }
        // TODO: chiamata reale al backend per creare utente
        await setAuth("fake_jwt_token_after_register", email);
        Alert.alert("Registrazione completata", "Benvenuto su FiscalFlow!");
        navigation.replace("Dashboard");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Crea il tuo account</Text>
            <Text style={styles.label}>Email</Text>
            <TextInput
                placeholder="name@email.com"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                style={styles.input}
            />
            <Text style={styles.label}>Password</Text>
            <TextInput placeholder="••••••••" placeholderTextColor={Colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
            <TouchableOpacity style={styles.primaryButton} onPress={handleRegister}>
                <Text style={styles.primaryButtonText}>Registrati</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 12, alignItems: "center" }}>
                <Text style={{ color: Colors.textMuted }}>Hai già un account? <Text style={{ color: Colors.primary }}>Accedi</Text></Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg, padding: 18, paddingTop: 48 },
    title: { fontSize: 24, fontWeight: "800", color: Colors.primary, marginBottom: 18 },
    label: { color: Colors.textMuted, marginBottom: 6, marginTop: 8 },
    input: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, padding: 12, borderRadius: 12, color: Colors.text, marginBottom: 8 },
    primaryButton: { backgroundColor: Colors.primary, padding: 14, borderRadius: 12, alignItems: "center", marginTop: 12 },
    primaryButtonText: { color: Colors.white, fontWeight: "700" },
});
