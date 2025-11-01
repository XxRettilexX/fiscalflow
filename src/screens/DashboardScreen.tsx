import { Colors } from "@constants/colors";
import { useAuth } from "@context/AuthContext";
import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import Modal from "react-native-modal";

const { width } = Dimensions.get("window");

export default function DashboardScreen({ navigation }: any) {
    const { email, logout } = useAuth();
    const [isProfileVisible, setProfileVisible] = useState(false);

    const grossBalance = 14250.75;
    const predictedYearlyCosts = 6100;
    const suggestedSavingPercent = 22;

    const monthlyData = [
        { value: 1200, label: "Mag" },
        { value: 1500, label: "Giu" },
        { value: 2000, label: "Lug" },
        { value: 1800, label: "Ago" },
        { value: 2400, label: "Set" },
        { value: 2600, label: "Ott" },
    ];

    const transactions = [
        { id: 1, type: "entrata", label: "Fattura #221 Rossi", amount: 820.5, date: "29 Ott" },
        { id: 2, type: "uscita", label: "Fornitore Gas SRL", amount: 340.2, date: "27 Ott" },
        { id: 3, type: "entrata", label: "Fattura #220 Bianchi", amount: 1250, date: "24 Ott" },
    ];

    const alerts = [
        { id: 1, message: "Pagamento INPS in scadenza il 12/11", type: "danger" },
        { id: 2, message: "Verifica liquidazione IVA trimestrale", type: "warning" },
    ];

    const handleLogout = async () => {
        setProfileVisible(false);
        await logout();
        navigation.replace("Login");
    };

    const handleAddInvoice = () => {
        Alert.alert(
            "Nuova Fattura",
            "Funzionalità in sviluppo: presto potrai creare e registrare fatture direttamente qui!"
        );
        // Esempio futuro: navigation.navigate("CreaFattura");
    };

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.header}>
                {/* 👤 Icona profilo (a destra) */}
                <TouchableOpacity
                    style={styles.profileIcon}
                    onPress={() => setProfileVisible(true)}
                    activeOpacity={0.8}
                >
                    <FontAwesome5 name="user-circle" size={26} color={Colors.white} />
                </TouchableOpacity>

                <View>
                    <Text style={styles.greeting}>Ciao,</Text>
                    <Text style={styles.username}>{email}</Text>
                </View>

                <View style={styles.balanceBox}>
                    <Text style={styles.balanceLabel}>Saldo lordo</Text>
                    <Text style={styles.balanceValue}>
                        € {grossBalance.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                    </Text>
                </View>
            </LinearGradient>

            {/* CONTENUTO */}
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* CARD PANORAMICHE */}
                <View style={styles.cardRow}>
                    <SummaryCard icon="arrow-down" title="Entrate" value="+€8.920" color={Colors.accent} />
                    <SummaryCard icon="arrow-up" title="Uscite" value="-€4.520" color={Colors.primary} />
                </View>

                <View style={styles.cardRow}>
                    <SummaryCard icon="chart-line" title="Media mensile" value="€1.820" color="#1ABC9C" />
                    <SummaryCard icon="percentage" title="IVA Stimata" value="22%" color="#F1C40F" />
                </View>

                {/* GRAFICO */}
                <View style={styles.chartCard}>
                    <Text style={styles.sectionTitle}>Andamento mensile</Text>
                    <LineChart
                        data={monthlyData}
                        curved
                        color1={Colors.accent}
                        thickness={3}
                        height={220}
                        areaChart
                        startOpacity={0.3}
                        endOpacity={0.05}
                        spacing={50}
                        yAxisTextStyle={{ color: Colors.textMuted }}
                        xAxisLabelTextStyle={{ color: Colors.textMuted }}
                        xAxisColor={Colors.border}
                        yAxisColor={Colors.border}
                    />
                </View>

                {/* ➕ NUOVA FATTURA */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.addInvoiceCard} onPress={handleAddInvoice} activeOpacity={0.9}>
                        <FontAwesome5 name="file-invoice" size={22} color={Colors.primaryDark} />
                        <View style={{ marginLeft: 12 }}>
                            <Text style={styles.addInvoiceTitle}>Aggiungi una nuova fattura</Text>
                            <Text style={styles.addInvoiceSubtitle}>
                                Registra velocemente un’entrata o un’uscita fiscale.
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* STIMA COSTI */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Previsioni fiscali</Text>
                    <View style={styles.forecastBox}>
                        <FontAwesome5 name="piggy-bank" size={20} color={Colors.primaryDark} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.forecastText}>
                                Stimiamo che la tua azienda dovrà sostenere circa{" "}
                                <Text style={{ fontWeight: "700", color: Colors.primaryDark }}>
                                    €{predictedYearlyCosts.toLocaleString("it-IT")}
                                </Text>{" "}
                                in costi annuali.
                            </Text>
                            <Text style={styles.forecastText}>
                                Ti consigliamo di risparmiare almeno{" "}
                                <Text style={{ fontWeight: "700", color: Colors.accent }}>
                                    {suggestedSavingPercent}% del tuo fatturato
                                </Text>{" "}
                                per evitare spese inaspettate.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* AVVISI */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Avvisi fiscali</Text>
                    {alerts.map((a) => (
                        <View
                            key={a.id}
                            style={[
                                styles.alertBox,
                                a.type === "danger" && { borderLeftColor: Colors.danger },
                                a.type === "warning" && { borderLeftColor: "#F1C40F" },
                            ]}
                        >
                            <FontAwesome5
                                name={a.type === "danger" ? "exclamation-triangle" : "info-circle"}
                                size={14}
                                color={a.type === "danger" ? Colors.danger : "#F1C40F"}
                                style={{ marginRight: 8 }}
                            />
                            <Text style={styles.alertText}>{a.message}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* 🔘 MODALE PROFILO */}
            <Modal
                isVisible={isProfileVisible}
                animationIn="fadeInDown"
                animationOut="fadeOutUp"
                backdropOpacity={0.45}
                onBackdropPress={() => setProfileVisible(false)}
                useNativeDriver
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <FontAwesome5 name="user-circle" size={42} color={Colors.primary} />
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

function SummaryCard({ icon, title, value, color }: any) {
    return (
        <View style={[styles.summaryCard, { borderColor: color }]}>
            <FontAwesome5 name={icon} size={18} color={color} />
            <Text style={styles.summaryTitle}>{title}</Text>
            <Text style={[styles.summaryValue, { color }]}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 30,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    profileIcon: {
        position: "absolute",
        top: 60,
        right: 20,
        zIndex: 5,
    },
    greeting: { color: "#E9EDF4", fontSize: 16, marginTop: 10 },
    username: { color: Colors.white, fontSize: 22, fontWeight: "700" },
    balanceBox: { marginTop: 20 },
    balanceLabel: { color: "#D0DAE8", fontSize: 14 },
    balanceValue: { color: Colors.white, fontSize: 30, fontWeight: "800" },
    scroll: { padding: 20, paddingBottom: 100 },

    // Card panoramiche
    cardRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
    summaryCard: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: 16,
        borderWidth: 1.5,
        padding: 14,
        marginHorizontal: 5,
        alignItems: "center",
    },
    summaryTitle: { color: Colors.textMuted, fontSize: 12, marginTop: 4 },
    summaryValue: { fontSize: 18, fontWeight: "700", marginTop: 2 },

    chartCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: Colors.primaryDark,
        shadowOpacity: 0.06,
        shadowRadius: 6,
        marginBottom: 20,
    },

    // Sezione aggiungi fattura
    addInvoiceCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.white,
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: Colors.primaryDark,
        shadowOpacity: 0.06,
        shadowRadius: 6,
    },
    addInvoiceTitle: { fontWeight: "700", color: Colors.text },
    addInvoiceSubtitle: { color: Colors.textMuted, fontSize: 13, marginTop: 2 },

    section: { marginTop: 16 },
    sectionTitle: { fontWeight: "700", color: Colors.text, marginBottom: 10, fontSize: 16 },

    forecastBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: Colors.white,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 12,
        marginBottom: 14,
        shadowColor: Colors.primaryDark,
        shadowOpacity: 0.06,
        shadowRadius: 6,
    },
    forecastText: { color: Colors.text, fontSize: 14, lineHeight: 20 },

    alertBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.white,
        borderRadius: 10,
        borderLeftWidth: 4,
        padding: 10,
        marginBottom: 8,
    },
    alertText: { color: Colors.text, flex: 1 },

    modalContainer: {
        backgroundColor: Colors.white,
        borderRadius: 18,
        padding: 20,
    },
    modalHeader: { alignItems: "center", marginBottom: 20 },
    modalTitle: { marginTop: 8, fontWeight: "700", color: Colors.text },
    modalButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
    },
    modalText: { marginLeft: 10, fontSize: 15, color: Colors.text },
    divider: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },
});
