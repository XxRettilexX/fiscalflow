import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/colors';
import { fonts } from '../constants/fonts';

export default function SplashScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>FiscalFlow</Text>
            <ActivityIndicator size="large" color={Colors.white} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontFamily: fonts.bold,
        color: Colors.white,
        marginBottom: 20,
    },
});
