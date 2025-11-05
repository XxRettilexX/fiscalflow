import { Colors } from "@constants/colors";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { api } from "../api";

const screenWidth = Dimensions.get("window").width - 32;

interface Invoice {
    id: number;
    number: string;
    client: string;
    amount: number;
    date: string;
    status: string;
}

interface Stat {
    month: string;
    total: number;
}

export default function DashboardScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Stat[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [statsRes, invoicesRes, alertsRes] = await Promise.all([
                    api.getInvoiceStats(),
                    api.getInvoices(),
                    api.getAlerts(),
                ]);
                setStats(statsRes);
                setInvoices(invoicesRes.slice(0, 3)); // mostriamo solo le ultime 3
                setAlerts(alertsRes);
            } catch (err) {
                console.error("Errore caricamento dashboard:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={{ marginTop: 10 }}>Caricamento dati...</Text>
            </View>
        );
    }

    const chartData = {
        labels: stats.map((s) => s.month),
        datasets: [{ data: stats.map((s) => s.total) }],
    };

    return (
        <ScrollView style={styles.container}>
            {/* HEADER */}
            <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.header}>
                <Text style={styles.headerTitle}>Dashboard</Text>
                <Text style={styles.headerSubtitle}>Andamento e riepilogo contabile</Text>
            </LinearGradient>

            {/* GRAFICO */}
            <View style={styles.chartContainer}>
                <Text style={styles.sectionTitle}>Andamento Fatturato</Text>
                <LineChart
                    data={chartData}
                    width={screenWidth}
                    height={220}
                    chartConfig={{
                        backgroundColor: Colors.bg,
                        backgroundGradientFrom: Colors.primary,
                        backgroundGradientTo: Colors.primaryDark,
                        decimalPlaces: 2,
                        color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
                        labelColor: () => "#fff",
                        propsForDots: { r: "5", strokeWidth: "2", stroke: "#fff" },
                    }}
                    bezier
                    style={styles.chart}
                />
            </View>

            {/* ULTIME FATTURE */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ultime Fatture</Text>
                <FlatList
                    data={invoices}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>Fattura {item.number}</Text>
                                <Text style={[styles.badge, { color: item.status === "pagata" ? Colors.accent : Colors.primary }]}>
                                    {item.status.toUpperCase()}
                                </Text>
                            </View>
                            <Text style={styles.cardClient}>{item.client}</Text>
                            <Text style={styles.cardAmount}>€ {item.amount.toFixed(2)}</Text>
                        </View>
                    )}
                />
                <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate("Invoices" as never)}>
                    <Text style={styles.linkText}>Vedi tutte</Text>
                </TouchableOpacity>
            </View>

            {/* AVVISI FISCALI */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Avvisi Fiscali</Text>
                {alerts.length === 0 ? (
                    <Text style={styles.emptyText}>Nessun avviso programmato.</Text>
                ) : (
                    alerts.map((alert) => (
                        <View key={alert.id} style={styles.alertCard}>
                            <Text style={styles.alertTitle}>{alert.title}</Text>
                            <Text style={styles.alertDate}>Scadenza: {alert.date}</Text>
                            <Text style={styles.alertDesc}>{alert.description}</Text>
                        </View>
                    ))
                )}
            </View>

            {/* FLOATING BUTTON */}
            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("NewInvoice" as never)}>
                <FontAwesome5 name="plus" size={22} color={Colors.white} />
            </TouchableOpacity>
        </ScrollView>
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
    chartContainer: { padding: 16 },
    chart: { borderRadius: 16, marginTop: 10 },
    section: { padding: 16 },
    sectionTitle: { fontSize: 18, fontWeight: "700", color: Colors.text, marginBottom: 10 },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 12,
        marginBottom: 10,
    },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    cardTitle: { fontWeight: "700", color: Colors.text },
    badge: { fontWeight: "600" },
    cardClient: { color: Colors.textMuted, marginTop: 6 },
    cardAmount: { fontWeight: "700", fontSize: 15, color: Colors.primary, marginTop: 4 },
    linkBtn: { alignSelf: "flex-end", marginTop: 4 },
    linkText: { color: Colors.primary, fontWeight: "600" },
    alertCard: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
    },
    alertTitle: { fontWeight: "700", color: Colors.text },
    alertDate: { color: Colors.textMuted, fontSize: 12, marginTop: 4 },
    alertDesc: { color: Colors.text, marginTop: 6, fontSize: 13 },
    emptyText: { color: Colors.textMuted, textAlign: "center", marginVertical: 20 },
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
