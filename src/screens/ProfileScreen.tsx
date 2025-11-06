import { Colors } from "@constants/colors";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const navigation = useNavigation();

    const handleLogout = async () => {
        await logout();
        navigation.reset({
            index: 0,
            routes: [{ name: "Login" as never }],
        });
    };

    return (
        <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.container}>
            <View style={styles.inner}>
                <Text style={styles.title}>Profilo Utente</Text>

                <View style={styles.card}>
                    <Text style={styles.label}>Nome</Text>
                    <Text style={styles.value}>{user?.name || "—"}</Text>

                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{user?.email || "—"}</Text>
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Esci</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.navigate("Dashboard" as never)}
                >
                    <Text style={styles.backText}>Torna alla Dashboard</Text>
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
        fontSize: 28,
        fontWeight: "800",
        textAlign: "center",
        marginBottom: 40,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 30,
    },
    label: { color: Colors.textMuted, fontSize: 14 },
    value: { color: Colors.text, fontWeight: "700", fontSize: 16, marginBottom: 10 },
    logoutBtn: {
        backgroundColor: Colors.accent,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    logoutText: { color: Colors.white, fontWeight: "700", fontSize: 16 },
    backBtn: { marginTop: 20, alignItems: "center" },
    backText: {
        color: Colors.white,
        fontSize: 14,
        textDecorationLine: "underline",
    },
});
