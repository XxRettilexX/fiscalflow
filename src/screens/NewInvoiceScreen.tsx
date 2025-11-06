import { Colors } from "@constants/colors";
import { FontAwesome5 } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { invoiceApi } from "../api";

export default function NewInvoiceScreen() {
    const navigation = useNavigation();
    const [client, setClient] = useState("");
    const [amount, setAmount] = useState("");
    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [status, setStatus] = useState<"draft" | "sent" | "paid" | "overdue" | "cancelled">("draft");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    // 🔧 Traduzione degli stati in italiano
    const statusLabels: Record<typeof status, string> = {
        draft: "Bozza",
        sent: "Inviata",
        paid: "Pagata",
        overdue: "Scaduta",
        cancelled: "Annullata",
    };

    // 📅 Helper: formatta la data per il backend
    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    const handleSubmit = async () => {
        if (!client || !amount || !dueDate) {
            Alert.alert("Attenzione", "Compila tutti i campi obbligatori.");
            return;
        }

        try {
            setLoading(true);

            const now = new Date();
            const issueDate = formatDate(now);
            const invoiceNumber = `FF-${now.getFullYear()}${String(
                now.getMonth() + 1
            ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.floor(
                Math.random() * 1000
            )}`;

            const payload = {
                number: invoiceNumber,
                issue_date: issueDate,
                due_date: formatDate(dueDate),
                status,
                currency: "EUR",
                net_amount: parseFloat(amount),
                tax_amount: 0,
                total_amount: parseFloat(amount),
                notes: description,
                customer_name: client,
            };

            await invoiceApi.create(payload);

            Alert.alert("✅ Successo", "Fattura creata correttamente!", [
                { text: "OK", onPress: () => navigation.navigate("Dashboard" as never) },
            ]);
        } catch (err: any) {
            console.error("Errore creazione fattura:", err);
            Alert.alert("Errore", err.message || "Impossibile creare la fattura.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <FontAwesome5 name="arrow-left" size={18} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Nuova Fattura</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.label}>Cliente *</Text>
                <TextInput style={styles.input} value={client} onChangeText={setClient} />

                <Text style={styles.label}>Importo (€) *</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                />

                <Text style={styles.label}>Data di scadenza *</Text>
                <TouchableOpacity
                    style={[styles.input, styles.dateInput]}
                    onPress={() => setShowDatePicker(true)}
                    activeOpacity={0.8}
                >
                    <FontAwesome5
                        name="calendar-alt"
                        size={16}
                        color={Colors.primaryLight}
                        style={{ marginRight: 8 }}
                    />
                    <Text style={{ color: dueDate ? Colors.text : Colors.textMuted }}>
                        {dueDate ? formatDate(dueDate) : "Seleziona data"}
                    </Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={dueDate || new Date()}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(Platform.OS === "ios");
                            if (selectedDate) setDueDate(selectedDate);
                        }}
                    />
                )}

                <Text style={styles.label}>Stato *</Text>
                <View style={styles.statusContainer}>
                    {Object.entries(statusLabels).map(([key, label]) => (
                        <TouchableOpacity
                            key={key}
                            style={[
                                styles.statusBtn,
                                status === key && { backgroundColor: Colors.primary },
                            ]}
                            onPress={() => setStatus(key as any)}
                        >
                            <Text
                                style={[
                                    styles.statusText,
                                    status === key && { color: Colors.white },
                                ]}
                            >
                                {label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>Descrizione</Text>
                <TextInput
                    style={[styles.input, { height: 100, textAlignVertical: "top" }]}
                    multiline
                    value={description}
                    onChangeText={setDescription}
                />

                <TouchableOpacity
                    style={[styles.saveBtn, loading && { opacity: 0.6 }]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <>
                            <FontAwesome5 name="save" size={16} color={Colors.white} />
                            <Text style={styles.saveText}>Crea Fattura</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        gap: 12,
    },
    headerTitle: { color: Colors.white, fontSize: 20, fontWeight: "700" },
    content: { padding: 20 },
    label: { color: Colors.textMuted, fontSize: 13, marginTop: 16, marginBottom: 4 },
    input: {
        backgroundColor: Colors.white,
        borderColor: Colors.border,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: Colors.text,
        shadowColor: Colors.primaryDark,
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    dateInput: {
        flexDirection: "row",
        alignItems: "center",
    },
    statusContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
    statusBtn: {
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.white,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 14,
        shadowColor: Colors.primaryDark,
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    statusText: { color: Colors.text, fontWeight: "600", fontSize: 13 },
    saveBtn: {
        flexDirection: "row",
        backgroundColor: Colors.primary,
        marginTop: 30,
        paddingVertical: 12,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        shadowColor: Colors.primaryDark,
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3,
    },
    saveText: { color: Colors.white, fontWeight: "600", fontSize: 15 },
});
