import {Image, Linking, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import React from "react";

const ContactItem = ({ title, phone, email, address, logo }: { title: string, phone: string, email: string, address: string, logo: any }) => {
    const handleCall = () => {
        Linking.openURL(`tel:${phone}`);
    };

    return (
        <View style={styles.contactContainer}>
            <Image source={logo} style={styles.logo} />
            <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>{title}</Text>
                {phone && (
                    <TouchableOpacity onPress={handleCall} style={styles.infoRow}>
                        <Ionicons name="call-outline" size={16} color="#555" />
                        <Text style={styles.infoText}>{phone}</Text>
                    </TouchableOpacity>
                )}
                {email && (
                    <View style={styles.infoRow}>
                        <Ionicons name="mail-outline" size={16} color="#555" />
                        <Text style={styles.infoText}>{email}</Text>
                    </View>
                )}
                {address && (
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={16} color="#555" />
                        <Text style={styles.infoText}>{address}</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({


contactContainer: {
    flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
},
    logo: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
        marginRight: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    infoText: {
        fontSize: 14,
        color: '#555',
        marginLeft: 6,
    },
    contactInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    contactTitle: {
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 6,
        },
    });

export default ContactItem;