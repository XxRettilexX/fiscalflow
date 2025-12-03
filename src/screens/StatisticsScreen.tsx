import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { expensesApi } from "../api";
import { Header } from "../components/Header";
import { fonts } from "../constants/fonts";
import { useSettings } from "../context/SettingsContext";
import { formatCurrency } from "../utils/formatCurrency";

// Interfaccia per i dati normalizzati usati dalla UI
interface Transaction {
    id: string;
    category: string;
    amount: number;
    date: string;
}

const TransactionItem = ({ item }: { item: Transaction }) => {
    const { colors, dynamicFontSize } = useSettings();
    return (
        <View style={[styles.transactionItem, { backgroundColor: colors.surface }]}>
            <View>
                <Text style={[styles.transactionCategory, { color: colors.text, fontSize: dynamicFontSize(16) }]}>{item.category}</Text>
                <Text style={[styles.transactionDate, { color: colors.text, fontSize: dynamicFontSize(14) }]}>{new Date(item.date).toLocaleDateString()}</Text>
            </View>
            <Text style={[styles.transactionAmount, { fontSize: dynamicFontSize(16) }, item.amount < 0 ? { color: colors.danger } : { color: colors.accent }]}>
                {formatCurrency(item.amount)}
            </Text>
        </View>
    );
};

export default function StatisticsScreen() {
    const { colors, dynamicFontSize } = useSettings();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await expensesApi.list();

            // Normalizza i dati ricevuti dall'API
            const mappedData: Transaction[] = (Array.isArray(data) ? data : []).map((tx: any) => ({
                id: String(tx.id),
                category: tx.customer_name || tx.category || "Sconosciuto",
                amount: Number(tx.total_amount || tx.amount || 0),
                date: tx.issue_date || tx.date,
            }));

            setTransactions(mappedData);
        } catch (error: any) {
            setError(error.message || "Impossibile caricare le transazioni.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    const chartData = useMemo(() => {
        if (transactions.length === 0) return null;

        const monthlyExpenses: { [key: string]: number } = {};
        const monthLabels: string[] = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const month = date.toLocaleString('it-IT', { month: 'short' });
            const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthLabels.push(month.charAt(0).toUpperCase() + month.slice(1));
            monthlyExpenses[yearMonth] = 0;
        }

        transactions.forEach(tx => {
            if (tx.amount < 0) {
                const txDate = new Date(tx.date);
                const yearMonth = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
                if (monthlyExpenses[yearMonth] !== undefined) {
                    monthlyExpenses[yearMonth] += Math.abs(tx.amount);
                }
            }
        });

        const dataValues = Object.values(monthlyExpenses);
        if (dataValues.every(val => val === 0)) return null;

        return { labels: monthLabels, datasets: [{ data: dataValues }] };
    }, [transactions]);

    const renderEmptyList = () => (
        <View style={styles.centered}>
            <Text style={[styles.emptyText, { color: colors.text, fontSize: dynamicFontSize(18) }]}>Nessuna transazione trovata</Text>
            <Text style={[styles.emptySubtext, { color: colors.text, fontSize: dynamicFontSize(14) }]}>Aggiungi una nuova spesa per iniziare a monitorare!</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.bg }]}>
                <Header title="Statistiche" />
                <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { backgroundColor: colors.bg }]}>
                <Header title="Statistiche" />
                <View style={styles.centered}>
                    <Text style={[styles.errorText, { color: colors.danger, fontSize: dynamicFontSize(16) }]}>{error}</Text>
                </View>
            </View>
        );
    }

    const renderListHeader = () => (
        <>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: dynamicFontSize(20) }]}>Spese Mensili</Text>
            {chartData ? (
                <BarChart
                    data={chartData}
                    width={Dimensions.get("window").width - 40}
                    height={220}
                    yAxisLabel="€"
                    chartConfig={{
                        backgroundColor: colors.surface,
                        backgroundGradientFrom: colors.surface,
                        backgroundGradientTo: colors.surface,
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(235, 87, 87, ${opacity})`, // Danger color
                        labelColor: (opacity = 1) => colors.text,
                    }}
                    style={{ marginVertical: 8, borderRadius: 16 }}
                    fromZero
                />
            ) : (
                <View style={[styles.chartPlaceholder, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.emptySubtext, { color: colors.text, fontSize: dynamicFontSize(14) }]}>Dati insufficienti per visualizzare il grafico.</Text>
                </View>
            )}
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: dynamicFontSize(20) }]}>Dettaglio Transazioni</Text>
        </>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Header title="Statistiche" />
            <FlatList
                data={transactions}
                renderItem={({ item }) => <TransactionItem item={item} />}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 20 }}
                ListHeaderComponent={renderListHeader}
                ListEmptyComponent={renderEmptyList}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    transactionItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    transactionCategory: {
        fontFamily: fonts.medium,
    },
    transactionDate: {
        fontFamily: fonts.regular,
        opacity: 0.6,
    },
    transactionAmount: {
        fontFamily: fonts.bold,
    },
    income: { /* color driven by context */ },
    expense: { /* color driven by context */ },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        height: '80%' // Occupa più spazio per centrare meglio
    },
    emptyText: {
        fontFamily: fonts.bold,
    },
    emptySubtext: {
        fontFamily: fonts.regular,
        opacity: 0.7,
        marginTop: 8,
        textAlign: 'center',
    },
    errorText: {
        fontFamily: fonts.medium,
        textAlign: 'center',
    },
    sectionTitle: {
        fontFamily: fonts.bold,
        marginTop: 10,
        marginBottom: 10,
    },
    chartPlaceholder: {
        height: 220,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        marginVertical: 8,
    }
});
