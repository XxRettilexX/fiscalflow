import { Colors } from "@constants/colors";
import { FontAwesome5 } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function NewInvoiceScreen() {
    const [issuer, setIssuer] = useState({
        name: "",
        address: "",
        vat: "",
        taxCode: "",
    });

    const [client, setClient] = useState({
        name: "",
        address: "",
        vat: "",
        taxCode: "",
    });

    const [details, setDetails] = useState({
        dateIssued: new Date(),
        number: "",
        description: "",
        quantity: "",
        price: "",
        operationDate: new Date(),
    });

    const [showIssuedPicker, setShowIssuedPicker] = useState(false);
    const [showOpPicker, setShowOpPicker] = useState(false);
    const [tax, setTax] = useState("22");
    const [totals, setTotals] = useState({ imponibile: 0, iva: 0, totale: 0 });

    // Calcolo IVA e totale
    const calculateTotals = () => {
        const qty = parseFloat(details.quantity) || 0;
        const price = parseFloat(details.price) || 0;
        const imponibile = qty * price;
        const iva = (imponibile * parseFloat(tax)) / 100;
        const totale = imponibile + iva;
        setTotals({ imponibile, iva, totale });
    };

    const handleSave = () => {
        if (!issuer.name || !client.name || !details.number) {
            Alert.alert("Campi obbligatori", "Compila almeno i campi principali.");
            return;
        }
        Alert.alert("✅ Fattura salvata", "La fattura è stata registrata con successo!");
    };

    const handlePrint = async () => {
        try {
            const html = `
      <html>
      <head>
        <style>
          body { font-family: Arial; padding: 24px; }
          h1 { color: #2C3E50; }
          .section { margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #ddd; padding: 8px; }
          th { background-color: #f4f6f8; text-align: left; }
          .total { font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Fattura N° ${details.number}</h1>
        <p>Data emissione: ${details.dateIssued.toLocaleDateString("it-IT")}</p>
        
        <div class="section">
          <h3>Cedente / Prestatore</h3>
          <p>${issuer.name}<br>${issuer.address}<br>P.IVA: ${issuer.vat} - CF: ${issuer.taxCode}</p>
        </div>

        <div class="section">
          <h3>Cessionario / Committente</h3>
          <p>${client.name}<br>${client.address}<br>P.IVA: ${client.vat} - CF: ${client.taxCode}</p>
        </div>

        <div class="section">
          <h3>Dettagli Operazione</h3>
          <table>
            <tr>
              <th>Descrizione</th>
              <th>Quantità</th>
              <th>Prezzo (€)</th>
              <th>Imponibile (€)</th>
            </tr>
            <tr>
              <td>${details.description}</td>
              <td>${details.quantity}</td>
              <td>${details.price}</td>
              <td>${totals.imponibile.toFixed(2)}</td>
            </tr>
          </table>
          <p>Aliquota IVA: ${tax}%</p>
          <p>IVA: € ${totals.iva.toFixed(2)}</p>
          <p class="total">Totale: € ${totals.totale.toFixed(2)}</p>
        </div>
      </body>
      </html>`;

            const { uri } = await Print.printToFileAsync({ html });
            await Sharing.shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
        } catch (err) {
            Alert.alert("Errore", "Impossibile generare la fattura in PDF");
            console.error(err);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
            <Text style={styles.title}>Crea una nuova fattura</Text>

            {/* Cedente */}
            <Section title="Cedente / Prestatore">
                <CustomInput label="Ragione Sociale / Nome" value={issuer.name} onChangeText={(v) => setIssuer({ ...issuer, name: v })} />
                <CustomInput label="Indirizzo" value={issuer.address} onChangeText={(v) => setIssuer({ ...issuer, address: v })} />
                <CustomInput label="Partita IVA" value={issuer.vat} onChangeText={(v) => setIssuer({ ...issuer, vat: v })} keyboardType="numeric" />
                <CustomInput label="Codice Fiscale" value={issuer.taxCode} onChangeText={(v) => setIssuer({ ...issuer, taxCode: v })} />
            </Section>

            {/* Cliente */}
            <Section title="Cessionario / Committente">
                <CustomInput label="Ragione Sociale / Nome" value={client.name} onChangeText={(v) => setClient({ ...client, name: v })} />
                <CustomInput label="Indirizzo" value={client.address} onChangeText={(v) => setClient({ ...client, address: v })} />
                <CustomInput label="Partita IVA" value={client.vat} onChangeText={(v) => setClient({ ...client, vat: v })} keyboardType="numeric" />
                <CustomInput label="Codice Fiscale" value={client.taxCode} onChangeText={(v) => setClient({ ...client, taxCode: v })} />
            </Section>

            {/* Dati documento */}
            <Section title="Dati Documento">
                <TouchableOpacity onPress={() => setShowIssuedPicker(true)} style={styles.dateButton}>
                    <FontAwesome5 name="calendar-alt" size={14} color={Colors.text} />
                    <Text style={styles.dateText}>
                        Data emissione: {details.dateIssued.toLocaleDateString("it-IT")}
                    </Text>
                </TouchableOpacity>
                {showIssuedPicker && (
                    <DateTimePicker
                        value={details.dateIssued}
                        mode="date"
                        onChange={(e, date) => {
                            setShowIssuedPicker(false);
                            if (date) setDetails({ ...details, dateIssued: date });
                        }}
                    />
                )}

                <CustomInput label="Numero Fattura" value={details.number} onChangeText={(v) => setDetails({ ...details, number: v })} />
                <CustomInput label="Descrizione" value={details.description} onChangeText={(v) => setDetails({ ...details, description: v })} />
                <CustomInput label="Quantità" value={details.quantity} onChangeText={(v) => setDetails({ ...details, quantity: v })} keyboardType="numeric" />
                <CustomInput label="Prezzo Unitario (€)" value={details.price} onChangeText={(v) => setDetails({ ...details, price: v })} keyboardType="numeric" />
            </Section>

            {/* Dati fiscali */}
            <Section title="Dati Fiscali">
                <CustomInput label="Aliquota IVA (%)" value={tax} onChangeText={setTax} keyboardType="numeric" />
                <TouchableOpacity style={styles.calcButton} onPress={calculateTotals}>
                    <FontAwesome5 name="calculator" color={Colors.white} size={14} />
                    <Text style={styles.calcText}>Calcola Totali</Text>
                </TouchableOpacity>
                <View style={styles.resultBox}>
                    <Text>Imponibile: € {totals.imponibile.toFixed(2)}</Text>
                    <Text>IVA: € {totals.iva.toFixed(2)}</Text>
                    <Text style={{ fontWeight: "700" }}>Totale: € {totals.totale.toFixed(2)}</Text>
                </View>
            </Section>

            <View style={styles.actions}>
                <TouchableOpacity style={[styles.button, { backgroundColor: Colors.primary }]} onPress={handleSave}>
                    <FontAwesome5 name="save" color={Colors.white} size={14} />
                    <Text style={styles.buttonText}>Salva</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, { backgroundColor: Colors.accent }]} onPress={handlePrint}>
                    <FontAwesome5 name="file-pdf" color={Colors.white} size={14} />
                    <Text style={styles.buttonText}>PDF</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

/* Componenti UI */
const Section = ({ title, children }: any) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

const CustomInput = ({ label, ...props }: any) => (
    <View style={{ marginBottom: 10 }}>
        <Text style={styles.label}>{label}</Text>
        <TextInput {...props} style={styles.input} placeholderTextColor={Colors.textMuted} />
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg, padding: 20 },
    title: { fontSize: 22, fontWeight: "700", marginBottom: 16, color: Colors.text },
    section: {
        backgroundColor: Colors.white,
        padding: 14,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    sectionTitle: { fontWeight: "700", marginBottom: 10, fontSize: 15, color: Colors.text },
    label: { color: Colors.textMuted, fontSize: 13, marginBottom: 4 },
    input: {
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 10,
        padding: 10,
        color: Colors.text,
    },
    dateButton: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
    dateText: { marginLeft: 8, color: Colors.text },
    calcButton: {
        flexDirection: "row",
        backgroundColor: Colors.primaryDark,
        padding: 10,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
    },
    calcText: { color: Colors.white, marginLeft: 8, fontWeight: "600" },
    resultBox: { backgroundColor: "#F6F8FA", padding: 10, borderRadius: 8, borderWidth: 1, borderColor: Colors.border },
    actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
    button: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 14,
    },
    buttonText: { color: Colors.white, fontWeight: "700", marginLeft: 8 },
});
