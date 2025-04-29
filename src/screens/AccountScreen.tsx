import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Button from '../components/Button';
import BottomNavBar from '../containers/BottomNavBar';
import { clearTokens, getUserInfo } from '../service/KeycloakService';
import i18n from '../translations/i18n';
import { RootStackParamList } from '../types/navigation';
import { User } from '../types/user';

const AccountScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  
  // Temporary editable values
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhoneNumber, setEditPhoneNumber] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userData = await getUserInfo();
      setUser(userData);
      // Initialize editable values with user data
      setEditFirstName(userData.firstName);
      setEditLastName(userData.lastName);
      setEditEmail(userData.email);
      setEditPhoneNumber(userData.phoneNumber || '');
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    if (editing) {
      // Save changes
      if (user) {
        setUser({
          ...user,
          firstName: editFirstName,
          lastName: editLastName,
          email: editEmail,
          phoneNumber: editPhoneNumber,
        });
      }
    }
    setEditing(!editing);
  };

  const handleLogout = async () => {
    console.log('Logout pressed');
    try {
      await clearTokens();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleContactPress = () => {
    setShowContactModal(true);
  };

  const handleCloseContactModal = () => {
    setShowContactModal(false);
  };

  const handlePhoneCall = () => {
    const phoneNumber = '+212600000000'; // Replace with your contact number
    Linking.openURL(`tel:${phoneNumber}`);
    handleCloseContactModal();
  };

  const handleEmail = () => {
    const email = 'support@moroccoview.ma'; // Replace with your support email
    Linking.openURL(`mailto:${email}`);
    handleCloseContactModal();
  };

  const handleWhatsApp = () => {
    const phoneNumber = '+212600000000'; // Replace with your WhatsApp number
    Linking.openURL(`whatsapp://send?phone=${phoneNumber}&text=Hello, I need assistance with Morocco View app.`);
    handleCloseContactModal();
  };
  
  const handleNavigation = (routeName: string) => {
    // @ts-ignore - We're handling navigation in a generic way
    navigation.navigate(routeName);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#CE1126" />
        <Text style={styles.loadingText}>{i18n.t('account.loading')}</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{i18n.t('account.failedToLoad')}</Text>
        <Button 
          title={i18n.t('account.retry')} 
          onPress={fetchUserData}
          style={styles.retryButton}
        />
      </View>
    );
  }

  const defaultProfileImage = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQF02Jj8T2t7PdkytAw42HDuuSz7yXguKn8Lg&s";

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: user.profilePicture || defaultProfileImage }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editImageButton}>
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.welcomeText}>
            {i18n.t('account.welcome').replace('{name}', user.firstName)}
          </Text>
          
          <TouchableOpacity 
            style={[styles.editProfileButton, editing ? styles.saveProfileButton : {}]} 
            onPress={handleEditProfile}
            disabled={true}          // empêche toute interaction
          >
            <Text style={[styles.editProfileText, editing ? styles.saveProfileText : {}]}>
              {editing ? i18n.t('account.saveProfile') : i18n.t('account.editProfile')}
            </Text>
            <Ionicons 
              name={editing ? "checkmark-circle" : "create-outline"} 
              size={20} 
              color={editing ? "#fff" : "#CE1126"} 
              style={styles.editIcon} 
            />
          </TouchableOpacity>
        </View>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('account.personalInfo')}</Text>
          
          <View style={styles.infoField}>
            <View style={styles.fieldLabelContainer}>
              <Ionicons name="person-outline" size={20} color="#666" />
              <Text style={styles.fieldLabel}>{i18n.t('account.firstName')}</Text>
            </View>
            {editing ? (
              <TextInput
                style={styles.input}
                value={editFirstName}
                onChangeText={setEditFirstName}
                placeholder={i18n.t('account.enterFirstName')}
              />
            ) : (
              <Text style={styles.fieldValue}>{user.firstName}</Text>
            )}
          </View>
          
          <View style={styles.infoField}>
            <View style={styles.fieldLabelContainer}>
              <Ionicons name="person-outline" size={20} color="#666" />
              <Text style={styles.fieldLabel}>{i18n.t('account.lastName')}</Text>
            </View>
            {editing ? (
              <TextInput
                style={styles.input}
                value={editLastName}
                onChangeText={setEditLastName}
                placeholder={i18n.t('account.enterLastName')}
              />
            ) : (
              <Text style={styles.fieldValue}>{user.lastName}</Text>
            )}
          </View>
          
          <View style={styles.infoField}>
            <View style={styles.fieldLabelContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" />
              <Text style={styles.fieldLabel}>{i18n.t('account.email')}</Text>
            </View>
            {editing ? (
              <TextInput
                style={styles.input}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder={i18n.t('account.enterEmail')}
                keyboardType="email-address"
              />
            ) : (
              <Text style={styles.fieldValue}>{user.email}</Text>
            )}
          </View>
          
          <View style={styles.infoField}>
            <View style={styles.fieldLabelContainer}>
              <Ionicons name="call-outline" size={20} color="#666" />
              <Text style={styles.fieldLabel}>{i18n.t('account.phoneNumber')}</Text>
            </View>
            {editing ? (
              <TextInput
                style={styles.input}
                value={editPhoneNumber}
                onChangeText={setEditPhoneNumber}
                placeholder={i18n.t('account.enterPhoneNumber')}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.fieldValue}>
                {user.phoneNumber ? user.phoneNumber : i18n.t('account.notProvided')}
              </Text>
            )}
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('account.support')}</Text>
          
          <TouchableOpacity style={styles.supportItem} onPress={handleContactPress}>
            <View style={styles.supportItemLeft}>
              <MaterialIcons name="support-agent" size={24} color="#CE1126" />
              <Text style={styles.supportItemText}>{i18n.t('account.contactSupport')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
          
          {/* <TouchableOpacity style={styles.supportItem}>
            <View style={styles.supportItemLeft}>
              <Ionicons name="help-circle-outline" size={24} color="#CE1126" />
              <Text style={styles.supportItemText}>FAQ & Help Center</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.supportItem}>
            <View style={styles.supportItemLeft}>
              <Ionicons name="document-text-outline" size={24} color="#CE1126" />
              <Text style={styles.supportItemText}>Terms & Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity> */}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>{i18n.t('account.logout')}</Text>
        </TouchableOpacity>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>{i18n.t('account.version')}</Text>
        </View>
        
        {/* Add padding at the bottom to ensure content is not hidden behind the nav bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Contact Modal */}
      <Modal
        visible={showContactModal}
        transparent
        animationType="slide"
        onRequestClose={handleCloseContactModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{i18n.t('account.contactSupport')}</Text>
              <TouchableOpacity onPress={handleCloseContactModal}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalDescription}>
              {i18n.t('account.supportTeamHelp')}
            </Text>
            
            <View style={styles.contactOptions}>
              <TouchableOpacity style={styles.contactOption} onPress={handlePhoneCall}>
                <View style={[styles.contactIconContainer, { backgroundColor: '#E8F5F0' }]}>
                  <Ionicons name="call" size={28} color="#008060" />
                </View>
                <Text style={styles.contactOptionText}>{i18n.t('account.call')}</Text>
                <Text style={styles.contactOptionSubtext}>{i18n.t('account.talkToAgent')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.contactOption} onPress={handleEmail}>
                <View style={[styles.contactIconContainer, { backgroundColor: '#FFF3E0' }]}>
                  <Ionicons name="mail" size={28} color="#FF9800" />
                </View>
                <Text style={styles.contactOptionText}>{i18n.t('account.email')}</Text>
                <Text style={styles.contactOptionSubtext}>{i18n.t('account.emailSupport')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.contactOption} onPress={handleWhatsApp}>
                <View style={[styles.contactIconContainer, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="logo-whatsapp" size={28} color="#25D366" />
                </View>
                <Text style={styles.contactOptionText}>{i18n.t('account.whatsapp')}</Text>
                <Text style={styles.contactOptionSubtext}>{i18n.t('account.quickChatSupport')}</Text>
              </TouchableOpacity>
            </View>
            
            <Button 
              title={i18n.t('account.close')} 
              style={styles.closeButton}
              onPress={handleCloseContactModal}
            />
          </View>
        </View>
      </Modal>
      
      {/* Bottom Navigation Bar */}
      <BottomNavBar activeRoute="Account" onNavigate={handleNavigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFF7F7',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 25,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    marginHorizontal: 4,
    marginTop: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
  },
  editImageButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#CE1126',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginBottom: 16,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CE1126',
    backgroundColor: 'transparent',
  },
  saveProfileButton: {
    backgroundColor: '#CE1126',
    borderColor: '#CE1126',
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CE1126',
  },
  saveProfileText: {
    color: '#fff',
  },
  editIcon: {
    marginLeft: 6,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 4,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoField: {
    marginBottom: 16,
  },
  fieldLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  input: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  supportItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#CE1126',
    padding: 16,
    borderRadius: 20,
    marginHorizontal: 4,
    marginTop: 30,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  versionContainer: {
    alignItems: 'center',
    marginVertical: 10,
    marginBottom: 35,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
  bottomPadding: {
    height: 80,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  contactOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  contactOption: {
    alignItems: 'center',
    width: '30%',
  },
  contactIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  contactOptionSubtext: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 8,
    backgroundColor: '#CE1126',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF7F7',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF7F7',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#CE1126',
  },
});

export default AccountScreen; 