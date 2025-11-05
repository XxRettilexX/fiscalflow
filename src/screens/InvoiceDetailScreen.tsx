import { Colors } from "@constants/colors";
import { FontAwesome5 } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { api } from "../api";
import { RootStackParamList } from "../navigation/AppNavigator";

type InvoiceDetailRoute = RouteProp<RootStackParamList, "InvoiceDetail">;
type InvoiceDetailNav = NativeStackNavigationProp<RootStackParamList, "InvoiceDetail">;

export default function InvoiceDetailScreen() {
    const route = useRoute<InvoiceDetailRoute>();
    const navigation = useNavigation<InvoiceDetailNav>();
    const { id } = route.params;

    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInvoice = async () => {
            try {
                const data = await api.getInvoice(id);
                setInvoice(data);
            } catch (err) {
                Alert.alert("Errore", "Impossibile caricare la fattura.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadInvoice();
    }, [id]);

    if (loading) return <Text style={{ textAlign: "center", marginTop: 40 }}>Caricamento...</Text>;
    if (!invoice) return <Text style={{ textAlign: "center", marginTop: 40 }}>Fattura non trovata.</Text>;

    return (
        <View style={styles.container}>
            <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <FontAwesome5 name="arrow-left" size={18} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Dettaglio Fattura</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Fattura n° {invoice.number}</Text>

                <Text style={styles.label}>Cliente:</Text>
                <Text style={styles.value}>{invoice.client}</Text>

                <Text style={styles.label}>Importo:</Text>
                <Text style={styles.value}>€ {invoice.amount}</Text>

                <Text style={styles.label}>Data Emissione:</Text>
                <Text style={styles.value}>{invoice.date}</Text>

                <Text style={styles.label}>Data Scadenza:</Text>
                <Text style={styles.value}>{invoice.due_date}</Text>

                <Text style={styles.label}>Stato:</Text>
                <Text style={[styles.value, { color: Colors.primary }]}>{invoice.status.toUpperCase()}</Text>

                <Text style={styles.label}>Descrizione:</Text>
                <Text style={styles.value}>{invoice.description}</Text>
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
    title: { fontSize: 22, fontWeight: "800", color: Colors.text, marginBottom: 10 },
    label: { color: Colors.textMuted, marginTop: 14, fontSize: 13 },
    value: { fontSize: 15, color: Colors.text, fontWeight: "600", marginTop: 4 },
});
