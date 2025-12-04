import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fonts } from '../constants/fonts';
import { useSettings } from '../context/SettingsContext';

export default function SupportScreen() {
    const { colors, dynamicFontSize } = useSettings();

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Text style={[styles.title, { color: colors.text, fontSize: dynamicFontSize(22) }]}>Supporto</Text>
            <Text style={[styles.text, { color: colors.text, fontSize: dynamicFontSize(16) }]}>Per assistenza, contatta support@fiscalflow.com</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontFamily: fonts.bold, marginBottom: 10 },
    text: { fontFamily: fonts.regular, textAlign: 'center' },
});
