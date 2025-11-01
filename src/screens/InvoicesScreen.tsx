import { Colors } from "@constants/colors";
import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Invoice = {
    id: number;
    type: "entrata" | "uscita";
    label: string;
    date: string;
    amount: number;
    paid: boolean;
};

export default function InvoicesScreen({ navigation }: any) {
    const [filter, setFilter] = useState<"tutte" | "entrate" | "uscite" | "nonPagate">("tutte");

    const invoices: Invoice[] = [
        { id: 1, type: "entrata", label: "Fattura #324 Rossi Srl", date: "01/11/25", amount: 1250, paid: true },
        { id: 2, type: "uscita", label: "Fornitore energia S.p.A", date: "29/10/25", amount: 310.75, paid: false },
        { id: 3, type: "entrata", label: "Fattura #322 Bianchi SRL", date: "25/10/25", amount: 890, paid: true },
        { id: 4, type: "uscita", label: "Commercialista", date: "20/10/25", amount: 250, paid: true },
    ];

    const filtered = useMemo(() => {
        switch (filter) {
            case "entrate":
                return invoices.filter(i => i.type === "entrata");
            case "uscite":
                return invoices.filter(i => i.type === "uscita");
            case "nonPagate":
                return invoices.filter(i => !i.paid);
            default:
                return invoices;
        }
    }, [filter]);

    const total = useMemo(() => {
        const entrate = invoices.filter(i => i.type === "entrata").reduce((a, b) => a + b.amount, 0);
        const uscite = invoices.filter(i => i.type === "uscita").reduce((a, b) => a + b.amount, 0);
        return entrate - uscite;
    }, [invoices]);

    return (
        <SafeAreaView style={styles.container}>
            {/* HEADER */}
            <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.header}>
                <Text style={styles.headerTitle}>Le tue fatture</Text>
                <Text style={styles.headerSubtitle}>
                    Saldo netto:{" "}
                    <Text style={{ fontWeight: "800" }}>
                        € {total.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                    </Text>
                </Text>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate("NewInvoice")}
                >
                    <FontAwesome5 name="plus" color={Colors.white} size={16} />
                </TouchableOpacity>
            </LinearGradient>

            {/* FILTRI */}
            <View style={styles.filters}>
                {["tutte", "entrate", "uscite", "nonPagate"].map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterButton, filter === f && styles.filterActive]}
                        onPress={() => setFilter(f as any)}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                filter === f && { color: Colors.white, fontWeight: "700" },
                            ]}
                        >
                            {f === "tutte"
                                ? "Tutte"
                                : f === "entrate"
                                    ? "Entrate"
                                    : f === "uscite"
                                        ? "Uscite"
                                        : "Da pagare"}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* LISTA FATTURE */}
            <FlatList
                data={filtered}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardLeft}>
                            <FontAwesome5
                                name={item.type === "entrata" ? "arrow-down" : "arrow-up"}
                                size={18}
                                color={item.type === "entrata" ? Colors.accent : Colors.danger}
                                style={{ marginRight: 10 }}
                            />
                            <View>
                                <Text style={styles.cardTitle}>{item.label}</Text>
                                <Text style={styles.cardSubtitle}>{item.date}</Text>
                            </View>
                        </View>
                        <View style={styles.cardRight}>
                            <Text
                                style={[
                                    styles.amount,
                                    item.type === "entrata" && { color: Colors.accent },
                                    item.type === "uscita" && { color: Colors.danger },
                                ]}
                            >
                                {item.type === "entrata" ? "+" : "-"}€{item.amount.toFixed(2)}
                            </Text>
                            <Text
                                style={[
                                    styles.status,
                                    item.paid ? { color: "#16A34A" } : { color: "#F59E0B" },
                                ]}
                            >
                                {item.paid ? "Pagata" : "Da pagare"}
                            </Text>
                        </View>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        position: "relative",
    },
    headerTitle: { color: Colors.white, fontSize: 24, fontWeight: "800" },
    headerSubtitle: { color: "#E6EDF7", marginTop: 4 },
    addButton: {
        position: "absolute",
        right: 20,
        top: 65,
        backgroundColor: Colors.accent,
        padding: 10,
        borderRadius: 10,
    },
    filters: {
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: Colors.white,
        margin: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingVertical: 8,
    },
    filterButton: { paddingVertical: 6, paddingHorizontal: 10 },
    filterActive: { backgroundColor: Colors.primary, borderRadius: 8 },
    filterText: { color: Colors.text, fontSize: 14 },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: Colors.primaryDark,
        shadowOpacity: 0.06,
        shadowRadius: 6,
    },
    cardLeft: { flexDirection: "row", alignItems: "center" },
    cardTitle: { color: Colors.text, fontWeight: "700" },
    cardSubtitle: { color: Colors.textMuted, fontSize: 12 },
    cardRight: { alignItems: "flex-end" },
    amount: { fontSize: 16, fontWeight: "700" },
    status: { fontSize: 12, marginTop: 4 },
});
