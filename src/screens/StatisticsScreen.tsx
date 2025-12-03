import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { expensesApi } from "../api";
import { Header } from "../components/Header";
import { Colors } from "../constants/colors";
import { fonts } from "../constants/fonts";
import { formatCurrency } from "../utils/formatCurrency";

interface Transaction {
    id: number;
    customer_name: string;
    total_amount: number;
    issue_date: string;
}

const TransactionItem = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
        <View>
            <Text style={styles.transactionCategory}>{item.customer_name}</Text>
            <Text style={styles.transactionDate}>{new Date(item.issue_date).toLocaleDateString()}</Text>
        </View>
        <Text
            style={[styles.transactionAmount, item.total_amount > 0 ? styles.income : styles.expense]}
            children={formatCurrency(item.total_amount)}
        />
    </View>
);

export default function StatisticsScreen() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await expensesApi.list();
            setTransactions(data);
        } catch (error) {
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

    return (
        <View style={styles.container}>
            <Header title="Statistiche" />
            {loading ? (
                <ActivityIndicator size="large" color={Colors.primary} />
            ) : (
                <FlatList
                    data={transactions}
                    renderItem={({ item }) => <TransactionItem item={item} />}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ padding: 20 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    transactionItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15,
        backgroundColor: Colors.surface,
        borderRadius: 10,
        marginBottom: 10,
    },
    transactionCategory: {
        fontSize: 16,
        fontFamily: fonts.medium,
        color: Colors.text,
    },
    transactionDate: {
        fontSize: 14,
        fontFamily: fonts.regular,
        color: Colors.text,
        opacity: 0.6,
    },
    transactionAmount: {
        fontSize: 16,
        fontFamily: fonts.bold,
    },
    income: { color: Colors.accent },
    expense: { color: Colors.danger },
});
