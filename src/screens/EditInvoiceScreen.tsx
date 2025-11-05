import { Colors } from "@constants/colors";
import { FontAwesome5 } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { api } from "../api";
import { RootStackParamList } from "../navigation/AppNavigator";

type EditInvoiceRoute = RouteProp<RootStackParamList, "EditInvoice">;
type EditInvoiceNav = NativeStackNavigationProp<RootStackParamList, "EditInvoice">;

export default function EditInvoiceScreen() {
    const route = useRoute<EditInvoiceRoute>();
    const navigation = useNavigation<EditInvoiceNav>();
    const { id } = route.params;

    const [client, setClient] = useState("");
    const [amount, setAmount] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [status, setStatus] = useState<"attesa" | "da pagare" | "pagata">("attesa");
    const [description, setDescription] = useState("");

    useEffect(() => {
        const loadInvoice = async () => {
            try {
                const data = await api.getInvoice(id);
                setClient(data.client);
                setAmount(String(data.amount));
                setDueDate(data.due_date);
                setStatus(data.status);
                setDescription(data.description);
            } catch (err) {
                Alert.alert("Errore", "Impossibile caricare la fattura.");
                console.error(err);
            }
        };
        loadInvoice();
    }, [id]);

    const handleSave = async () => {
        try {
            await api.updateInvoice(id, {
                client,
                amount: parseFloat(amount),
                due_date: dueDate,
                status,
                description,
            });
            Alert.alert("✅ Successo", "Fattura aggiornata correttamente!");
            navigation.goBack();
        } catch (err) {
            Alert.alert("Errore", "Impossibile salvare le modifiche.");
            console.error(err);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <FontAwesome5 name="arrow-left" size={18} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Modifica Fattura</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.label}>Cliente</Text>
                <TextInput style={styles.input} value={client} onChangeText={setClient} />

                <Text style={styles.label}>Importo (€)</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                />

                <Text style={styles.label}>Scadenza</Text>
                <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    value={dueDate}
                    onChangeText={setDueDate}
                />

                <Text style={styles.label}>Stato</Text>
                <View style={styles.statusContainer}>
                    {["attesa", "da pagare", "pagata"].map((s) => (
                        <TouchableOpacity
                            key={s}
                            style={[
                                styles.statusBtn,
                                status === s && { backgroundColor: Colors.primary },
                            ]}
                            onPress={() => setStatus(s as any)}
                        >
                            <Text
                                style={[
                                    styles.statusText,
                                    status === s && { color: Colors.white },
                                ]}
                            >
                                {s.toUpperCase()}
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
    statusContainer: { flexDirection: "row", gap: 8, marginTop: 8 },
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

