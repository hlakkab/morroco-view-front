import React from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, StatusBar, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenHeader from "../components/ScreenHeader";
import ContactItem from '../components/ContactItem';


const EmergencyContactsScreen = () => {
  const contacts = [
    {
      title: 'Senegal - Ambassador',
      phone: '05 22 30 00 43',
      email: 'info@consulsenecasa.gov.ma',
      address: '34 Avenue Idriss Slaoui, Quartier Anfa 20050 Casablanca, Maroc',
      logo: require('../assets/img/senegal-emblem.jpg'),
    },
    {
      title: 'National Police',
      phone: '19',
      logo: require('../assets/img/police-emblem.jpg'),
    },
    {
      title: 'Firefighters',
      phone: '15',
      logo: require('../assets/img/firefighters-emblem.jpg'),
    },
    {
      title: 'Royal Gendarmerie',
      phone: '177',
      logo: require('../assets/img/gendarmerie-emblem.png'),
    },
  ];

  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      {/*   <StatusBar barStyle="dark-content" backgroundColor="#FFF" />  */}
      <View style={styles.headerContainer}>
        <ScreenHeader title={'Emergency Contacts'} />
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F7',
  },
  contactsContainer: {
    flex: 1,
    backgroundColor: '#FFF7F7',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});

export default EmergencyContactsScreen;