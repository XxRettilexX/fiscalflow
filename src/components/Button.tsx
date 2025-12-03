
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import { fonts } from '../constants/fonts';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary';
    isLoading?: boolean;
}

export function Button({ title, onPress, variant = 'primary', isLoading = false }: ButtonProps) {
    const buttonStyle = [
        styles.button,
        variant === 'primary' ? styles.primary : styles.secondary,
    ];
    const textStyle = [
        styles.text,
        variant === 'primary' ? styles.textPrimary : styles.textSecondary,
    ];

    return (
        <TouchableOpacity style={buttonStyle} onPress={onPress} disabled={isLoading}>
            {isLoading ? (
                <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : Colors.primary} />
            ) : (
                <Text style={textStyle}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    primary: {
        backgroundColor: Colors.primary,
    },
    secondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    text: {
        fontSize: 16,
        fontFamily: fonts.bold,
    },
    textPrimary: {
        color: '#FFFFFF',
    },
    textSecondary: {
        color: Colors.primary,
    },
});
