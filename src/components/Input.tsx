
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '../constants/colors';
import { fonts } from '../constants/fonts';
// Ipotizzando che tu abbia icone come componente o libreria
// import Icon from 'react-native-vector-icons/Ionicons';

interface InputProps {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    keyboardType?: 'default' | 'numeric' | 'email-address';
    secureTextEntry?: boolean;
    icon?: string;
}

export function Input({ label, placeholder, value, onChangeText, keyboardType = 'default', secureTextEntry = false, icon }: InputProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputContainer}>
                {/* {icon && <Icon name={icon} size={20} color={Colors.primary} style={styles.icon} />} */}
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    secureTextEntry={secureTextEntry}
                    placeholderTextColor={Colors.text}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontFamily: fonts.medium,
        color: Colors.text,
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.bg,
        paddingHorizontal: 15,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        fontFamily: fonts.regular,
        color: Colors.text,
    },
});
