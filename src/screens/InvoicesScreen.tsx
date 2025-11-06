import { Colors } from "@constants/colors";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { invoiceApi } from "../api"; // ✅ usa il backend reale

interface Invoice {
    id: number;
    number: string;
    customer_name: string;
    total: number;
    date: string;
    due_date: string;
    status: "paid" | "pending" | "overdue";
}

export default function InvoicesScreen() {
    const navigation = useNavigation<any>();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"tutte" | "pagate" | "attesa" | "scadute">("tutte");

    useEffect(() => {
        const loadInvoices = async () => {
            try {
                setLoading(true);

                // forza i tipi per evitare il "never"
                const res: any = await invoiceApi.list();
                const data: Invoice[] = Array.isArray(res) ? res : (res as any)?.data || [];

                setInvoices(data);
            } catch (err) {
                console.error("Errore caricamento fatture:", err);
            } finally {
                setLoading(false);
            }
        };
        loadInvoices();
    }, []);


    const filteredInvoices = invoices.filter((inv) => {
        const matchSearch =
            inv.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
            inv.number?.includes(search);

        const matchFilter =
            filter === "tutte" ||
            (filter === "pagate" && inv.status === "paid") ||
            (filter === "attesa" && inv.status === "pending") ||
            (filter === "scadute" && inv.status === "overdue");

        return matchSearch && matchFilter;
    });

    const renderStatusBadge = (status: Invoice["status"]) => {
        const color =
            status === "paid"
                ? Colors.accent
                : status === "overdue"
                    ? Colors.danger
                    : Colors.primary;
        const label =
            status === "paid"
                ? "PAGATA"
                : status === "pending"
                    ? "IN ATTESA"
                    : "SCADUTA";
        return (
            <View style={[styles.badge, { backgroundColor: color + "22", borderColor: color }]}>
                <Text style={[styles.badgeText, { color }]}>{label}</Text>
            </View>
        );
    };

    const renderInvoice = ({ item }: { item: Invoice }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Fattura {item.number}</Text>
                {renderStatusBadge(item.status)}
            </View>

            <Text style={styles.cardClient}>{item.customer_name}</Text>

            <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Importo:</Text>
                <Text style={styles.cardValue}>€ {item.total?.toFixed(2)}</Text>
            </View>
            <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Emissione:</Text>
                <Text style={styles.cardValue}>
                    {new Date(item.date).toLocaleDateString("it-IT")}
                </Text>
            </View>
            <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Scadenza:</Text>
                <Text style={styles.cardValue}>
                    {new Date(item.due_date).toLocaleDateString("it-IT")}
                </Text>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: Colors.primary }]}
                    onPress={() => navigation.navigate("InvoiceDetail", { id: item.id })}
                >
                    <FontAwesome5 name="file-alt" size={14} color={Colors.white} />
                    <Text style={styles.actionText}>Visualizza</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: Colors.accent }]}
                    onPress={() => (navigation as any).navigate("EditInvoice", { id: item.id })}  // ✅ Passaggio corretto dell’ID
                >
                    <FontAwesome5 name="edit" size={14} color={Colors.white} />
                    <Text style={styles.actionText}>Modifica</Text>
                </TouchableOpacity>

            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.header}>
                <Text style={styles.headerTitle}>Le mie Fatture</Text>
                <Text style={styles.headerSubtitle}>Gestisci le tue operazioni contabili</Text>
            </LinearGradient>

            {/* FILTRI E RICERCA */}
            <View style={styles.searchSection}>
                <TextInput
                    placeholder="Cerca per cliente o numero"
                    placeholderTextColor={Colors.textMuted}
                    value={search}
                    onChangeText={setSearch}
                    style={styles.searchInput}
                />

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterScroll}
                >
                    {["tutte", "pagate", "attesa", "scadute"].map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[
                                styles.filterBtn,
                                filter === f && { backgroundColor: Colors.primary },
                            ]}
                            onPress={() => setFilter(f as any)}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    filter === f && { color: Colors.white },
                                ]}
                            >
                                {f.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* LISTA FATTURE */}
            {loading ? (
                <Text style={{ textAlign: "center", marginTop: 30, color: Colors.textMuted }}>
                    Caricamento...
                </Text>
            ) : filteredInvoices.length === 0 ? (
                <Text style={{ textAlign: "center", marginTop: 30, color: Colors.textMuted }}>
                    Nessuna fattura trovata.
                </Text>
            ) : (
                <FlatList
                    data={filteredInvoices}
                    renderItem={renderInvoice}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120 }}
                />
            )}

            {/* FLOATING BUTTON */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate("NewInvoice")}
            >
                <FontAwesome5 name="plus" size={22} color={Colors.white} />
            </TouchableOpacity>
        </View>
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
    },
    headerTitle: { color: Colors.white, fontSize: 24, fontWeight: "800" },
    headerSubtitle: { color: "#E6EDF7", marginTop: 4, fontSize: 14 },
    searchSection: { padding: 16 },
    searchInput: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        color: Colors.text,
        marginBottom: 12,
    },
    filterScroll: { flexDirection: "row" },
    filterBtn: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.white,
        marginRight: 8,
    },
    filterText: { color: Colors.text, fontSize: 12, fontWeight: "600" },
    card: {
        backgroundColor: Colors.white,
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 16,
        shadowColor: Colors.primaryDark,
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    cardTitle: { fontWeight: "700", fontSize: 16, color: Colors.text },
    cardClient: { color: Colors.textMuted, marginVertical: 6, fontSize: 13 },
    cardRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 2 },
    cardLabel: { color: Colors.textMuted, fontSize: 12 },
    cardValue: { color: Colors.text, fontSize: 13, fontWeight: "600" },
    badge: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    badgeText: { fontSize: 11, fontWeight: "700" },
    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 12,
    },
    actionBtn: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 6,
    },
    actionText: { color: Colors.white, fontSize: 13, fontWeight: "600" },
    fab: {
        position: "absolute",
        bottom: 30,
        right: 25,
        backgroundColor: Colors.primary,
        borderRadius: 50,
        padding: 18,
        shadowColor: Colors.primaryDark,
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
});
