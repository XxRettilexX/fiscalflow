import { Colors } from "@constants/colors";
import { useAuth } from "@context/AuthContext";
import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import React, { useState } from "react";
import { Dimensions, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import Modal from "react-native-modal";

const { width } = Dimensions.get("window");

export default function DashboardScreen({ navigation }: any) {
    const { email, logout } = useAuth();
    const [isProfileVisible, setProfileVisible] = useState(false);

    const grossBalance = 1200;
    const estimatedNet = 2340;
    const monthlyData = [
        { value: 20, label: "GEN" },
        { value: 25, label: "FEB" },
        { value: 32, label: "MAR" },
        { value: 37, label: "APR" },
        { value: 42, label: "MAG" },
    ];

    const invoices = [
        { id: "1", title: "Alta S.11", date: "30 mag 2025", status: "Pagata" },
        { id: "2", title: "Studio Bianchi", date: "7 mag 2025", status: "In attesa" },
    ];

    const handleLogout = async () => {
        setProfileVisible(false);
        await logout();
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    };

    const handleAddInvoice = () => navigation.navigate("NewInvoice");

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.appName}>FiscalFlow</Text>
                        <Text style={styles.greeting}>Gestisci il tuo flusso</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={() => setProfileVisible(true)}
                        activeOpacity={0.8}
                    >
                        <FontAwesome5 name="user-circle" size={26} color={Colors.white} />
                    </TouchableOpacity>
                </View>

                {/* CARD PRINCIPALE */}
                <View style={styles.summaryCard}>
                    <Text style={styles.balanceTitle}>Flusso del mese</Text>
                    <Text style={styles.balanceValue}>+{grossBalance.toLocaleString("it-IT")} €</Text>

                    {/* 📈 Grafico ottimizzato */}
                    <View style={styles.chartWrapper}>
                        <LineChart
                            data={monthlyData}
                            curved
                            color1={Colors.accent}
                            areaChart
                            height={120}
                            width={width - 80}
                            startOpacity={0.3}
                            endOpacity={0}
                            thickness={3}
                            yAxisThickness={0}
                            xAxisThickness={0}
                            hideDataPoints
                        />
                    </View>

                    <View style={styles.chartLabels}>
                        <Text style={styles.chartLabelText}>Entrate</Text>
                        <Text style={styles.chartLabelText}>Spese</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* CONTENUTO */}
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* 🧾 Nuova Fattura */}
                <TouchableOpacity style={styles.newInvoiceBtn} onPress={handleAddInvoice}>
                    <FontAwesome5 name="plus" size={14} color={Colors.white} />
                    <Text style={styles.newInvoiceText}>Nuova fattura</Text>
                </TouchableOpacity>

                {/* 📊 Previsioni fiscali */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Previsioni fiscali</Text>
                    <LineChart
                        data={monthlyData}
                        color1={Colors.primary}
                        color2={Colors.accent}
                        curved
                        height={150}
                        areaChart
                        startOpacity={0.25}
                        endOpacity={0}
                        hideDataPoints
                        spacing={60}
                        yAxisThickness={0}
                        xAxisThickness={0}
                    />
                    <Text style={styles.netEstimate}>
                        Netto stimato: <Text style={styles.netValue}>{estimatedNet.toLocaleString("it-IT")} €</Text>
                    </Text>
                </View>

                {/* 💰 Fatture */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.sectionTitle}>Fatture</Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Invoices")}>
                            <Text style={styles.link}>Vedi tutte</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Fix ScrollView / FlatList */}
                    <FlatList
                        data={invoices}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                        renderItem={({ item }) => (
                            <View style={styles.invoiceItem}>
                                <View>
                                    <Text style={styles.invoiceTitle}>{item.title}</Text>
                                    <Text style={styles.invoiceDate}>{item.date}</Text>
                                </View>
                                <Text
                                    style={[
                                        styles.invoiceStatus,
                                        item.status === "Pagata" ? styles.paid : styles.pending,
                                    ]}
                                >
                                    {item.status}
                                </Text>
                            </View>
                        )}
                    />
                </View>
            </ScrollView>

            {/* 🔘 MODALE PROFILO */}
            <Modal
                isVisible={isProfileVisible}
                animationIn="fadeInDown"
                animationOut="fadeOutUp"
                backdropOpacity={0.5}
                onBackdropPress={() => setProfileVisible(false)}
                useNativeDriver
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <FontAwesome5 name="user-circle" size={40} color={Colors.primary} />
                        <Text style={styles.modalTitle}>{email}</Text>
                    </View>

                    <TouchableOpacity style={styles.modalButton}>
                        <FontAwesome5 name="user-edit" size={16} color={Colors.text} />
                        <Text style={styles.modalText}>Modifica profilo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.modalButton}>
                        <FontAwesome5 name="cog" size={16} color={Colors.text} />
                        <Text style={styles.modalText}>Impostazioni</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.modalButton}>
                        <FontAwesome5 name="file-invoice" size={16} color={Colors.text} />
                        <Text style={styles.modalText}>Le mie fatture</Text>
                    </TouchableOpacity>

                    {/* 🔔 TEST NOTIFICA */}
                    <TouchableOpacity
                        style={[styles.modalButton, { marginTop: 15 }]}
                        onPress={async () => {
                            await Notifications.scheduleNotificationAsync({
                                content: {
                                    title: "🔔 Test Notifica FiscalFlow",
                                    body: "Se vedi questo messaggio, le notifiche funzionano perfettamente!",
                                    sound: "default",
                                },
                                trigger: {
                                    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                                    seconds: 5,
                                },
                            });
                        }}

                    >
                        <FontAwesome5 name="bell" size={16} color={Colors.primary} />
                        <Text style={[styles.modalText, { color: Colors.primary }]}>
                            Test Notifica
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity
                        style={[styles.modalButton, { marginTop: 10 }]}
                        onPress={handleLogout}
                    >
                        <FontAwesome5 name="sign-out-alt" size={16} color={Colors.danger} />
                        <Text style={[styles.modalText, { color: Colors.danger }]}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 25,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    appName: { color: Colors.white, fontSize: 26, fontWeight: "800" },
    greeting: { color: "#E9EDF4", fontSize: 14 },
    profileButton: { backgroundColor: "rgba(255,255,255,0.15)", padding: 8, borderRadius: 50 },
    summaryCard: {
        backgroundColor: Colors.white,
        borderRadius: 18,
        padding: 16,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
    },
    balanceTitle: { color: Colors.textMuted, fontSize: 14 },
    balanceValue: { color: Colors.text, fontSize: 28, fontWeight: "700", marginVertical: 4 },
    chartWrapper: { alignItems: "center", marginTop: 10 },
    chartLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 6,
        paddingHorizontal: 8,
    },
    chartLabelText: { fontSize: 12, color: Colors.textMuted },
    scroll: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 80 },
    newInvoiceBtn: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        marginBottom: 16,
    },
    newInvoiceText: { color: Colors.white, fontWeight: "700", marginLeft: 8 },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    sectionTitle: { fontWeight: "700", color: Colors.text, fontSize: 16 },
    link: { color: Colors.primary, fontWeight: "600" },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    invoiceItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    invoiceTitle: { color: Colors.text, fontWeight: "600" },
    invoiceDate: { color: Colors.textMuted, fontSize: 12 },
    invoiceStatus: { fontWeight: "600", fontSize: 13 },
    paid: { color: "green" },
    pending: { color: "orange" },
    netEstimate: { marginTop: 10, fontSize: 14, color: Colors.textMuted },
    netValue: { color: Colors.text, fontWeight: "700", fontSize: 18 },

    modalContainer: { backgroundColor: Colors.white, borderRadius: 18, padding: 20 },
    modalHeader: { alignItems: "center", marginBottom: 20 },
    modalTitle: { marginTop: 8, fontWeight: "700", color: Colors.text },
    modalButton: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
    modalText: { marginLeft: 10, fontSize: 15, color: Colors.text },
    divider: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },
});
