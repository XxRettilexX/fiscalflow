import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/colors';
import { fonts } from '../constants/fonts';

export default function AboutScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Informazioni su FiscalFlow</Text>
            <Text style={styles.text}>Versione 1.0.0</Text>
            <Text style={styles.text}>© 2024 FiscalFlow Inc.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: Colors.bg },
    title: { fontSize: 22, fontFamily: fonts.bold, color: Colors.text, marginBottom: 10 },
    text: { fontSize: 16, fontFamily: fonts.regular, color: Colors.text, textAlign: 'center' },
});
