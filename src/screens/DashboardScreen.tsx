import { Colors } from "@constants/colors";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { alertApi, invoiceApi } from "../api";
import { useAuth } from "../context/AuthContext";

const screenWidth = Dimensions.get("window").width - 40;

export default function DashboardScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<{ month: string; total: number }[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [statsRes, invoicesRes, alertsRes] = await Promise.all([
                    invoiceApi.stats(),
                    invoiceApi.list(),
                    alertApi.list(),
                ]);

                setStats(statsRes?.data || []);
                setInvoices(Array.isArray(invoicesRes) ? invoicesRes.slice(0, 3) : []);
                setAlerts(Array.isArray(alertsRes) ? alertsRes : []);
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
            <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.white} />
                <Text style={styles.loadingText}>Caricamento dati...</Text>
            </LinearGradient>
        );
    }

    const chartData = {
        labels: stats.map((s) => s.month),
        datasets: [{ data: stats.map((s) => s.total) }],
    };

    return (
        <View style={styles.container}>
            {/* HEADER HERO */}
            <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.hero}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.title}>Ciao, {user?.name || "Utente"} 👋</Text>
                        <Text style={styles.subtitle}>Bentornato su FiscalFlow</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate("Profile" as never)}>
                        <FontAwesome5 name="user-circle" size={28} color={Colors.white} />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* CONTENUTO */}
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.contentWrapper}>
                    {/* GRAFICO */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Andamento Fatturato</Text>
                        {stats.length > 0 ? (
                            <LineChart
                                data={chartData}
                                width={screenWidth}
                                height={220}
                                chartConfig={{
                                    backgroundGradientFrom: Colors.primary,
                                    backgroundGradientTo: Colors.primaryDark,
                                    decimalPlaces: 2,
                                    color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
                                    labelColor: () => "#fff",
                                }}
                                bezier
                                style={styles.chart}
                            />
                        ) : (
                            <Text style={styles.emptyText}>Nessun dato disponibile</Text>
                        )}
                    </View>

                    {/* ULTIME FATTURE */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Ultime Fatture</Text>
                        {invoices.length === 0 ? (
                            <Text style={styles.emptyText}>Nessuna fattura trovata.</Text>
                        ) : (
                            <FlatList
                                data={invoices}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <View style={styles.card}>
                                        <View style={styles.cardHeader}>
                                            <Text style={styles.cardTitle}>Fattura {item.number}</Text>
                                            <Text
                                                style={[
                                                    styles.badge,
                                                    { color: item.status === "paid" ? Colors.accent : Colors.warning },
                                                ]}
                                            >
                                                {item.status.toUpperCase()}
                                            </Text>
                                        </View>
                                        <Text style={styles.cardClient}>{item.customer_name}</Text>
                                        <Text style={styles.cardAmount}>€ {(item.total_amount || 0).toFixed(2)}</Text>
                                    </View>
                                )}
                            />
                        )}
                        <TouchableOpacity
                            style={styles.viewAllBtn}
                            onPress={() => navigation.navigate("Invoices" as never)}
                        >
                            <Text style={styles.viewAllText}>Vedi tutte</Text>
                        </TouchableOpacity>
                    </View>

                    {/* AVVISI */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Avvisi Fiscali</Text>
                        {alerts.length === 0 ? (
                            <Text style={styles.emptyText}>Nessun avviso programmato.</Text>
                        ) : (
                            alerts.map((alert) => (
                                <View key={alert.id} style={styles.alertCard}>
                                    <Text style={styles.alertTitle}>{alert.title}</Text>
                                    <Text style={styles.alertDesc}>{alert.message}</Text>
                                </View>
                            ))
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* FLOATING BUTTON */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate("NewInvoice" as never)}
            >
                <FontAwesome5 name="plus" size={22} color={Colors.white} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText: { color: Colors.white, marginTop: 10 },
    hero: {
        height: 180,
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,
        paddingHorizontal: 24,
        paddingTop: 60,
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    headerTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: { color: Colors.white, fontSize: 26, fontWeight: "800" },
    subtitle: { color: "#E6EDF7", marginTop: 4, fontSize: 14 },
    scroll: { paddingBottom: 120 },
    contentWrapper: {
        backgroundColor: Colors.bg,
        marginTop: 10, // ✅ più spazio sotto l’header
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 30, // ✅ più respiro visivo
        paddingHorizontal: 16,
    },
    section: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        shadowColor: Colors.primaryDark,
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: { fontSize: 18, fontWeight: "700", color: Colors.primary, marginBottom: 10 },
    chart: { borderRadius: 16 },
    emptyText: { color: Colors.textMuted, textAlign: "center", paddingVertical: 10 },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 12,
        marginBottom: 10,
    },
    cardHeader: { flexDirection: "row", justifyContent: "space-between" },
    cardTitle: { fontWeight: "700", color: Colors.text },
    badge: { fontWeight: "600" },
    cardClient: { color: Colors.textMuted, marginTop: 6 },
    cardAmount: { fontWeight: "700", fontSize: 15, color: Colors.primary, marginTop: 4 },
    viewAllBtn: { alignSelf: "flex-end", marginTop: 4 },
    viewAllText: { color: Colors.primary, fontWeight: "600" },
    alertCard: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
    },
    alertTitle: { fontWeight: "700", color: Colors.text },
    alertDesc: { color: Colors.text, marginTop: 6, fontSize: 13 },
    fab: {
        position: "absolute",
        bottom: 30,
        right: 25,
        backgroundColor: Colors.accent,
        borderRadius: 50,
        padding: 18,
        shadowColor: Colors.primaryDark,
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
});
