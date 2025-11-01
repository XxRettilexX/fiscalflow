import { Colors } from "@constants/colors";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function SplashScreen() {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.text}>FiscalFlow si sta avviando…</Text>
        </View>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg, alignItems: "center", justifyContent: "center" },
    text: { marginTop: 14, color: Colors.textMuted },
});
