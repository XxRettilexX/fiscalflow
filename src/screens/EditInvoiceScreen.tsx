import { Colors } from "@constants/colors";
import { FontAwesome5 } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { invoiceApi } from "../api";
import { RootStackParamList } from "../navigation/AppNavigator";

type EditInvoiceRoute = RouteProp<RootStackParamList, "EditInvoice">;
type EditInvoiceNav = NativeStackNavigationProp<RootStackParamList, "EditInvoice">;

function safeDate(value: any): Date {
    if (!value || value === "0000-00-00") return new Date();
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
}


export default function EditInvoiceScreen() {
    const [loading, setLoading] = useState(true);
    const [number, setNumber] = useState("");
    const [client, setClient] = useState("");
    const [issueDate, setIssueDate] = useState<Date>(new Date());
    const [dueDate, setDueDate] = useState<Date>(new Date());
    const [status, setStatus] = useState<"draft" | "sent" | "paid" | "overdue" | "cancelled">("draft");
    const [netAmount, setNetAmount] = useState("");
    const [notes, setNotes] = useState("");
    const [showIssuePicker, setShowIssuePicker] = useState(false);
    const [showDuePicker, setShowDuePicker] = useState(false);
    const route = useRoute<EditInvoiceRoute>();
    const navigation = useNavigation<EditInvoiceNav>();
    const invoiceId = Number(route.params?.id); // ✅ conversione sicura

    useEffect(() => {
        if (!invoiceId || isNaN(invoiceId)) {
            Alert.alert("Errore", "ID fattura non valido.");
            navigation.goBack();
            return;
        }

        const loadInvoice = async () => {
            try {
                const data: any = await invoiceApi.get(invoiceId);
                setNumber(data.number || "");
                setClient(data.customer_name || "");
                setIssueDate(safeDate(data.issue_date));
                setDueDate(safeDate(data.due_date));
                setStatus(data.status || "draft");
                setNetAmount(String(data.net_amount || data.total_amount || 0));
                setNotes(data.notes || "");
            } catch (err) {
                Alert.alert("Errore", "Impossibile caricare la fattura.");
                console.error(err);
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        };

        loadInvoice();
    }, [invoiceId]);

    const handleSave = async () => {
        try {
            await invoiceApi.update(invoiceId, {
                number,
                customer_name: client,
                issue_date: issueDate.toISOString().split("T")[0],
                due_date: dueDate.toISOString().split("T")[0],
                net_amount: parseFloat(netAmount),
                total_amount: parseFloat(netAmount),
                status,
                // @ts-ignore
                notes,
            });
            Alert.alert("✅ Successo", "Fattura aggiornata correttamente!");
            navigation.goBack();
        } catch (err) {
            Alert.alert("Errore", "Impossibile salvare le modifiche.");
            console.error(err);
        }
    };


    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <FontAwesome5 name="spinner" size={28} color={Colors.primary} />
                <Text style={{ color: Colors.textMuted, marginTop: 8 }}>Caricamento dati...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <FontAwesome5 name="arrow-left" size={18} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Modifica Fattura</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.label}>Numero Fattura</Text>
                <TextInput
                    style={styles.input}
                    value={number}
                    onChangeText={setNumber}
                    placeholder="Esempio: FF-2025-01"
                />

                <Text style={styles.label}>Cliente *</Text>
                <TextInput
                    style={styles.input}
                    value={client}
                    onChangeText={setClient}
                    placeholder="Nome del cliente"
                />

                <Text style={styles.label}>Data Emissione *</Text>
                <TouchableOpacity style={styles.input} onPress={() => setShowIssuePicker(true)}>
                    <Text>{issueDate.toISOString().split("T")[0]}</Text>
                </TouchableOpacity>
                {showIssuePicker && (
                    <DateTimePicker
                        value={issueDate}
                        mode="date"
                        display="default"
                        onChange={(e, selectedDate) => {
                            setShowIssuePicker(false);
                            if (selectedDate) setIssueDate(selectedDate);
                        }}
                    />
                )}

                <Text style={styles.label}>Data Scadenza *</Text>
                <TouchableOpacity style={styles.input} onPress={() => setShowDuePicker(true)}>
                    <Text>{dueDate.toISOString().split("T")[0]}</Text>
                </TouchableOpacity>
                {showDuePicker && (
                    <DateTimePicker
                        value={dueDate}
                        mode="date"
                        display="default"
                        onChange={(e, selectedDate) => {
                            setShowDuePicker(false);
                            if (selectedDate) setDueDate(selectedDate);
                        }}
                    />
                )}

                <Text style={styles.label}>Importo (€) *</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={netAmount}
                    onChangeText={setNetAmount}
                />

                <Text style={styles.label}>Stato</Text>
                <View style={styles.statusContainer}>
                    {[
                        { key: "draft", label: "Bozza" },
                        { key: "sent", label: "Inviata" },
                        { key: "paid", label: "Pagata" },
                        { key: "overdue", label: "Scaduta" },
                    ].map((s) => (
                        <TouchableOpacity
                            key={s.key}
                            style={[
                                styles.statusBtn,
                                status === s.key && { backgroundColor: Colors.primary },
                            ]}
                            onPress={() => setStatus(s.key as any)}
                        >
                            <Text
                                style={[
                                    styles.statusText,
                                    status === s.key && { color: Colors.white },
                                ]}
                            >
                                {s.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>Note</Text>
                <TextInput
                    style={[styles.input, { height: 100, textAlignVertical: "top" }]}
                    multiline
                    value={notes}
                    onChangeText={setNotes}
                />

                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    <FontAwesome5 name="save" size={16} color={Colors.white} />
                    <Text style={styles.saveText}>Salva Modifiche</Text>
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
    label: { color: Colors.textMuted, fontSize: 13, marginTop: 16 },
    input: {
        backgroundColor: Colors.white,
        borderColor: Colors.border,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: Colors.text,
    },
    statusContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
    statusBtn: {
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.white,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 14,
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
    },
    saveText: { color: Colors.white, fontWeight: "600", fontSize: 15 },
});
