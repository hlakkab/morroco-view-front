import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, Linking, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ContactItem from '../components/ContactItem';
import ScreenHeader from "../components/ScreenHeader";
import i18n from '../translations/i18n';


const EmergencyContactsScreen = () => {
  const contacts = [
    {
      title: i18n.t('emergency.senegalAmbassador'),
      phone: '05 22 30 00 43',
      email: 'info@consulsenecasa.gov.ma',
      address: '34 Avenue Idriss Slaoui, Quartier Anfa 20050 Casablanca, Maroc',
      logo: require('../assets/img/senegal-emblem.jpg'),
    },
    {
      title: i18n.t('emergency.nationalPolice'),
      phone: '19',
      logo: require('../assets/img/police-emblem.jpg'),
    },
    {
      title: i18n.t('emergency.firefighters'),
      phone: '15',
      logo: require('../assets/img/firefighters-emblem.jpg'),
    },
    {
      title: i18n.t('emergency.royalGendarmerie'),
      phone: '177',
      logo: require('../assets/img/gendarmerie-emblem.png'),
    },
  ];

  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      {/*   <StatusBar barStyle="dark-content" backgroundColor="#FFF" />  */}
      <View style={styles.headerContainer}>
        <ScreenHeader title={i18n.t('emergency.title')} />
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
    paddingTop: Platform.OS === 'ios' ? 0 : 40,
  },
});

export default EmergencyContactsScreen;