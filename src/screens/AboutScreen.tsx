import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fonts } from '../constants/fonts';
import { useSettings } from '../context/SettingsContext';

export default function AboutScreen() {
    const { colors, dynamicFontSize } = useSettings();

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Text style={[styles.title, { color: colors.text, fontSize: dynamicFontSize(22) }]}>Informazioni su FiscalFlow</Text>
            <Text style={[styles.text, { color: colors.text, fontSize: dynamicFontSize(16) }]}>Versione 1.0.0</Text>
            <Text style={[styles.text, { color: colors.text, fontSize: dynamicFontSize(16) }]}>© 2024 FiscalFlow Inc.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontFamily: fonts.bold, marginBottom: 10 },
    text: { fontFamily: fonts.regular, textAlign: 'center' },
});
