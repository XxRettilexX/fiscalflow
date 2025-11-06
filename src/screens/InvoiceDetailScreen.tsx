// src/screens/InvoiceDetailScreen.tsx
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { invoiceApi } from '../api';
import { Colors } from '../constants/colors';

export default function InvoiceDetailScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { id } = route.params;
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchInvoice = async () => {
        try {
            setLoading(true);
            const data = await invoiceApi.get(id);
            setInvoice(data);
        } catch (err: any) {
            console.error('Errore caricamento fattura:', err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoice();
    }, [id]);

    const handleDelete = async () => {
        Alert.alert('Conferma eliminazione', 'Vuoi davvero eliminare questa fattura?', [
            { text: 'Annulla', style: 'cancel' },
            {
                text: 'Elimina',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await invoiceApi.delete(id);
                        Alert.alert('Eliminata', 'La fattura è stata eliminata');
                        navigation.goBack();
                    } catch (err: any) {
                        Alert.alert('Errore', err.message || 'Impossibile eliminare la fattura');
                    }
                },
            },
        ]);
    };

    if (loading)
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );

    if (!invoice)
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg }}>
                <Text style={{ color: Colors.textMuted }}>Fattura non trovata</Text>
            </View>
        );

    return (
        <ScrollView style={{ flex: 1, backgroundColor: Colors.bg, padding: 16 }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: Colors.primary, marginBottom: 8 }}>
                {invoice.number}
            </Text>
            <Text style={{ color: Colors.textMuted, marginBottom: 4 }}>
                Cliente: {invoice.customer_name}
            </Text>
            <Text style={{ color: Colors.textMuted, marginBottom: 4 }}>Data: {invoice.date}</Text>
            <Text style={{ color: Colors.textMuted, marginBottom: 8 }}>Totale: € {invoice.total}</Text>

            <Text style={{ color: Colors.primaryDark, fontWeight: '600', marginBottom: 8 }}>
                Dettagli articoli:
            </Text>
            {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((item: any, index: number) => (
                    <View
                        key={index}
                        style={{
                            backgroundColor: Colors.surface,
                            borderRadius: 8,
                            padding: 12,
                            marginBottom: 8,
                            borderWidth: 1,
                            borderColor: Colors.border,
                        }}
                    >
                        <Text style={{ fontWeight: '600', color: Colors.text }}>{item.description}</Text>
                        <Text style={{ color: Colors.textMuted }}>
                            {item.qty} × € {item.price.toFixed(2)}
                        </Text>
                    </View>
                ))
            ) : (
                <Text style={{ color: Colors.textMuted }}>Nessuna voce registrata</Text>
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('EditInvoice', { id })}
                    style={{
                        backgroundColor: Colors.primaryLight,
                        paddingVertical: 12,
                        borderRadius: 8,
                        flex: 0.48,
                        alignItems: 'center',
                    }}
                >
                    <Text style={{ color: Colors.white, fontWeight: '600' }}>Modifica</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleDelete}
                    style={{
                        backgroundColor: Colors.danger,
                        paddingVertical: 12,
                        borderRadius: 8,
                        flex: 0.48,
                        alignItems: 'center',
                    }}
                >
                    <Text style={{ color: Colors.white, fontWeight: '600' }}>Elimina</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
