// src/screens/DashboardScreen.tsx
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { clearToken } from "@services/biometric";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Dashboard">;

export default function DashboardScreen({ navigation }: Props) {
    const handleLogout = async () => {
        await clearToken();
        navigation.replace("Login");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Benvenuto su FiscalFlow</Text>
            <Text style={styles.subtitle}>Questa è una home di test — il login funziona ✅</Text>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Saldo attuale</Text>
                <Text style={styles.amount}>€ 2.340</Text>
            </View>

            <TouchableOpacity style={styles.logout} onPress={handleLogout}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>Logout (cancella token)</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: "#F8FAFC" },
    title: { fontSize: 28, fontWeight: "700", color: "#1A4C8B", marginTop: 20 },
    subtitle: { color: "#5D6D7E", marginTop: 10 },
    card: { backgroundColor: "#fff", padding: 18, borderRadius: 12, marginTop: 24, borderWidth: 1, borderColor: "#E0E6ED" },
    cardTitle: { color: "#5D6D7E" },
    amount: { fontSize: 32, fontWeight: "700", color: "#163E70", marginTop: 8 },
    logout: { marginTop: 30, backgroundColor: "#E74C3C", padding: 12, borderRadius: 10, alignItems: "center" },
});
