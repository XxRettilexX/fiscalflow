import { Colors } from "@constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NewInvoiceScreen() {
    const insets = useSafeAreaInsets();

    const [invoiceData, setInvoiceData] = useState({
        cedente: "",
        indirizzoCedente: "",
        pivaCedente: "",
        cfCedente: "",
        cliente: "",
        indirizzoCliente: "",
        pivaCliente: "",
        cfCliente: "",
        descrizione: "",
        imponibile: "",
        iva: "",
        totale: "",
    });

    const handleChange = (field: string, value: string) => {
        setInvoiceData({ ...invoiceData, [field]: value });
    };

    const handleSubmit = async () => {
        // 🚀 Invio dati al backend (senza numero o data, li genera il DB)
        try {
            const res = await fetch("https://tuo-server.com/api/invoices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(invoiceData),
            });

            if (!res.ok) throw new Error("Errore nel salvataggio della fattura");
            const json = await res.json();
            Alert.alert("Fattura creata", `Numero fattura: ${json.numero}\nData: ${json.data_emissione}`);
        } catch (e: any) {
            Alert.alert("Errore", e.message || "Impossibile creare la fattura");
        }
    };

    return (
        <View style={styles.container}>
            {/* 🟦 HEADER */}
            <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={[styles.banner, { paddingTop: insets.top + 20 }]}
            >
                <Text style={styles.bannerTitle}>Crea una nuova fattura</Text>
            </LinearGradient>

            {/* 🧾 FORM */}
            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.sectionTitle}>Dati del Cedente / Prestatore</Text>
                <TextInput
                    placeholder="Ragione Sociale o Nome"
                    placeholderTextColor="#000"
                    value={invoiceData.cedente}
                    onChangeText={(t) => handleChange("cedente", t)}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Indirizzo completo"
                    placeholderTextColor="#000"
                    value={invoiceData.indirizzoCedente}
                    onChangeText={(t) => handleChange("indirizzoCedente", t)}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Partita IVA"
                    placeholderTextColor="#000"
                    keyboardType="numeric"
                    value={invoiceData.pivaCedente}
                    onChangeText={(t) => handleChange("pivaCedente", t)}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Codice Fiscale"
                    placeholderTextColor="#000"
                    value={invoiceData.cfCedente}
                    onChangeText={(t) => handleChange("cfCedente", t)}
                    style={styles.input}
                />

                <Text style={styles.sectionTitle}>Dati del Cliente</Text>
                <TextInput
                    placeholder="Ragione Sociale o Nome"
                    placeholderTextColor="#000"
                    value={invoiceData.cliente}
                    onChangeText={(t) => handleChange("cliente", t)}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Indirizzo completo"
                    placeholderTextColor="#000"
                    value={invoiceData.indirizzoCliente}
                    onChangeText={(t) => handleChange("indirizzoCliente", t)}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Partita IVA o CF"
                    placeholderTextColor="#000"
                    value={invoiceData.pivaCliente}
                    onChangeText={(t) => handleChange("pivaCliente", t)}
                    style={styles.input}
                />

                <Text style={styles.sectionTitle}>Dettagli Fattura</Text>
                <TextInput
                    placeholder="Descrizione operazione"
                    placeholderTextColor="#000"
                    value={invoiceData.descrizione}
                    onChangeText={(t) => handleChange("descrizione", t)}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Imponibile (€)"
                    placeholderTextColor="#000"
                    keyboardType="numeric"
                    value={invoiceData.imponibile}
                    onChangeText={(t) => handleChange("imponibile", t)}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Aliquota IVA (%)"
                    placeholderTextColor="#000"
                    keyboardType="numeric"
                    value={invoiceData.iva}
                    onChangeText={(t) => handleChange("iva", t)}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Totale (€)"
                    placeholderTextColor="#000"
                    keyboardType="numeric"
                    value={invoiceData.totale}
                    onChangeText={(t) => handleChange("totale", t)}
                    style={styles.input}
                />

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitText}>Salva e genera fattura</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

/* 🎨 STILI */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    banner: {
        width: "100%",
        paddingBottom: 22,
        alignItems: "center",
        justifyContent: "center",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    bannerTitle: {
        color: Colors.white,
        fontWeight: "800",
        fontSize: 18,
        marginTop: Platform.OS === "ios" ? 0 : 10,
    },
    scroll: { padding: 20, paddingBottom: 100 },
    sectionTitle: {
        fontWeight: "700",
        color: Colors.primaryDark,
        marginBottom: 8,
        marginTop: 18,
        fontSize: 16,
    },
    input: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
        color: Colors.text,
    },
    submitButton: {
        backgroundColor: Colors.primary,
        borderRadius: 14,
        alignItems: "center",
        paddingVertical: 14,
        marginTop: 20,
    },
    submitText: { color: Colors.white, fontWeight: "700" },
    infoText: {
        textAlign: "center",
        color: Colors.textMuted,
        fontSize: 12,
        marginTop: 10,
    },
});
