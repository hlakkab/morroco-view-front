import React from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, StatusBar, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

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

const EmergencyContactsScreen = () => {
  const contacts = [
    {
      title: 'Senegal - Ambassador',
      phone: '05 22 30 00 43',
      email: 'info@consulsenecasa.gov.ma',
      address: '34 Avenue Idriss Slaoui, Quartier Anfa 20050 Casablanca, Maroc',
      logo: require('../assets/senegal-emblem.png'),
    },
    {
      title: 'National Police',
      phone: '19',
      logo: require('../assets/police-emblem.png'),
    },
    {
      title: 'Firefighters',
      phone: '15',
      logo: require('../assets/firefighters-emblem.png'),
    },
    {
      title: 'Royal Gendarmerie',
      phone: '177',
      logo: require('../assets/gendarmerie-emblem.png'),
    },
  ];

  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Contacts</Text>
      </View>
      <ScrollView style={styles.contactsContainer}>
        {contacts.map((contact, index) => (
          <ContactItem
            key={index}
            title={contact.title}
            phone={contact.phone}
            email={contact.email || ''}
            address={contact.address || ''}
            logo={contact.logo}
          />
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.indicator} />
        <Text style={styles.footerText}>iPhone 14</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
  },
  contactsContainer: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
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
  contactInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
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
  footer: {
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#F8F8F8',
  },
  indicator: {
    width: 40,
    height: 5,
    backgroundColor: '#DDD',
    borderRadius: 3,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#888',
  },
});

export default EmergencyContactsScreen;