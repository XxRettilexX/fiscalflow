import { Colors } from "@constants/colors";
import { useAuth } from "@context/AuthContext";
import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
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
    const monthlyData = [
        { value: 1200, label: "Mag" },
        { value: 1500, label: "Giu" },
        { value: 2000, label: "Lug" },
        { value: 1800, label: "Ago" },
        { value: 2400, label: "Set" },
        { value: 2600, label: "Ott" },
    ];

    const handleLogout = async () => {
        setProfileVisible(false);
        await logout();
        navigation.replace("Login");
    };

    const handleAddInvoice = () => {
        navigation.navigate("NewInvoice");
    };

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.header}>
                {/* 👤 Icona profilo (in alto a destra) */}
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

            <ScrollView contentContainerStyle={styles.scroll}>
                {/* CARD: CREA NUOVA FATTURA */}
                <TouchableOpacity style={styles.addInvoiceCard} onPress={handleAddInvoice}>
                    <FontAwesome5 name="file-invoice-dollar" size={20} color={Colors.white} />
                    <Text style={styles.addInvoiceText}>Crea una nuova fattura</Text>
                </TouchableOpacity>

                {/* CARD: PREVISIONI FISCALI */}
                <View style={styles.taxForecastCard}>
                    <Text style={styles.sectionTitle}>Previsioni fiscali</Text>
                    <Text style={styles.forecastText}>
                        Stima costi aziendali annuali: <Text style={styles.forecastValue}>€ 3.240</Text>
                    </Text>
                    <Text style={styles.forecastSub}>
                        💡 Risparmia almeno il <Text style={{ fontWeight: "700" }}>25%</Text> del tuo
                        fatturato mensile per evitare spese impreviste.
                    </Text>
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

                {/* CARD: AVVISI FISCALI */}
                <View style={styles.alertCard}>
                    <Text style={styles.sectionTitle}>Avvisi fiscali</Text>
                    <View style={styles.alertItem}>
                        <FontAwesome5 name="exclamation-circle" size={14} color={Colors.danger} />
                        <Text style={styles.alertText}>
                            Scadenza versamento IVA: <Text style={{ fontWeight: "700" }}>16 Novembre</Text>
                        </Text>
                    </View>
                    <View style={styles.alertItem}>
                        <FontAwesome5 name="calendar-check" size={14} color={Colors.danger} />
                        <Text style={styles.alertText}>
                            Acconto IRPEF previsto: <Text style={{ fontWeight: "700" }}>30 Novembre</Text>
                        </Text>
                    </View>
                    <View style={styles.alertItem}>
                        <FontAwesome5 name="info-circle" size={14} color={Colors.primaryDark} />
                        <Text style={styles.alertText}>Aggiorna la situazione fatture per un calcolo preciso.</Text>
                    </View>
                </View>
            </ScrollView>

            {/* MODALE PROFILO */}
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

/* STILI */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 30,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        position: "relative",
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

    addInvoiceCard: {
        backgroundColor: Colors.accent,
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        marginBottom: 18,
    },
    addInvoiceText: { color: Colors.white, fontWeight: "700", marginLeft: 10, fontSize: 15 },

    taxForecastCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 18,
    },
    sectionTitle: { fontWeight: "700", color: Colors.text, marginBottom: 10, fontSize: 16 },
    forecastText: { color: Colors.text },
    forecastValue: { color: Colors.primaryDark, fontWeight: "700" },
    forecastSub: { color: Colors.textMuted, marginTop: 6 },

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

    alertCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 20,
    },
    alertItem: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    alertText: { marginLeft: 8, color: Colors.text, fontSize: 13 },

    modalContainer: { backgroundColor: Colors.white, borderRadius: 18, padding: 20 },
    modalHeader: { alignItems: "center", marginBottom: 20 },
    modalTitle: { marginTop: 8, fontWeight: "700", color: Colors.text },
    modalButton: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
    modalText: { marginLeft: 10, fontSize: 15, color: Colors.text },
    divider: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },
});
