import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useMemo } from 'react';
import { Alert, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import GoogleIcon from '../assets/img/icons8-google.svg';
import LogoSvg from '../assets/img/morroco-view-logo.svg';
import Button from '../components/Button';
import Input from '../components/Input';
import i18n from '../translations/i18n';
import { Ionicons } from '@expo/vector-icons';
import { register } from '../service';

const RegisterScreen = () => {
  const navigation = useNavigation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordCriteria, setShowPasswordCriteria] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);
  
  const passwordCriteria = {
    minLength: password.length >= 6,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);
  const isPasswordMatch = password === confirmPassword && password.length > 0;
  
  const isFormValid = useMemo(() => {
    return (
      firstName.length > 0 &&
      lastName.length > 0 &&
      isEmailValid &&
      isPasswordValid &&
      isPasswordMatch
    );
  }, [firstName, lastName, isEmailValid, isPasswordValid, isPasswordMatch]);

  const handleRegister = async () => {
    if (!isFormValid) {
      Alert.alert(i18n.t('register.registrationFailed'));
      return;
    }

    try {
      await register({
        firstName,
        lastName,
        email,
        password
      });
      
      Alert.alert(
        i18n.t('register.success'),
        i18n.t('register.registrationSuccess'),
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login' as never)
          }
        ]
      );
    } catch (error: any) {
      Alert.alert(
        i18n.t('register.registrationFailed'),
        error.message || i18n.t('register.registrationError')
      );
    }
  };

  const handleGoogleAuth = () => {
    // Implement Google authentication logic here
    console.log('Google authentication');
  };

  const PasswordCriteriaList = () => (
    <View style={styles.criteriaContainer}>
      <Text style={styles.criteriaTitle}>Password must contain:</Text>
      <View style={styles.criteriaItem}>
        <Ionicons
          name={passwordCriteria.minLength ? 'checkmark-circle' : 'ellipse-outline'}
          size={16}
          color={passwordCriteria.minLength ? '#4CAF50' : '#666'}
        />
        <Text style={styles.criteriaText}>At least 6 characters</Text>
      </View>
      <View style={styles.criteriaItem}>
        <Ionicons
          name={passwordCriteria.hasUpperCase ? 'checkmark-circle' : 'ellipse-outline'}
          size={16}
          color={passwordCriteria.hasUpperCase ? '#4CAF50' : '#666'}
        />
        <Text style={styles.criteriaText}>One uppercase letter</Text>
      </View>
      <View style={styles.criteriaItem}>
        <Ionicons
          name={passwordCriteria.hasLowerCase ? 'checkmark-circle' : 'ellipse-outline'}
          size={16}
          color={passwordCriteria.hasLowerCase ? '#4CAF50' : '#666'}
        />
        <Text style={styles.criteriaText}>One lowercase letter</Text>
      </View>
      <View style={styles.criteriaItem}>
        <Ionicons
          name={passwordCriteria.hasNumber ? 'checkmark-circle' : 'ellipse-outline'}
          size={16}
          color={passwordCriteria.hasNumber ? '#4CAF50' : '#666'}
        />
        <Text style={styles.criteriaText}>One number</Text>
      </View>
      <View style={styles.criteriaItem}>
        <Ionicons
          name={passwordCriteria.hasSpecialChar ? 'checkmark-circle' : 'ellipse-outline'}
          size={16}
          color={passwordCriteria.hasSpecialChar ? '#4CAF50' : '#666'}
        />
        <Text style={styles.criteriaText}>One special character</Text>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#AE191333', '#AE191344', '#F18D8F']}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <LogoSvg width={80} height={80} />
          <Text style={styles.accessText}>{i18n.t('register.createAccount')}</Text>
        </View>
        {/* <Text style={styles.connectText}>{i18n.t('register.connectWith')}</Text>
        <Button
          title="Google"
          onPress={handleGoogleAuth}
          style={styles.googleButton}
          icon={<GoogleIcon width={24} height={24} />}
        />
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.orText}>{i18n.t('register.or')}</Text>
          <View style={styles.divider} />
        </View> */}
        <Text style={styles.title}>{i18n.t('register.enterDetails')}</Text>
        <Input 
          placeholder={i18n.t('register.firstName')} 
          style={styles.input} 
          value={firstName} 
          onChangeText={setFirstName} 
        />
        <Input 
          placeholder={i18n.t('register.lastName')} 
          style={styles.input} 
          value={lastName} 
          onChangeText={setLastName} 
        />
        <Input 
          placeholder={i18n.t('register.email')} 
          style={[styles.input, !isEmailValid && email.length > 0 && styles.inputError]} 
          value={email} 
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={styles.passwordContainer}>
          <Input 
            placeholder={i18n.t('register.password')} 
            secureTextEntry={!showPassword}
            style={[styles.input, !isPasswordValid && password.length > 0 && styles.inputError]} 
            value={password} 
            onChangeText={(text) => {
              setPassword(text);
              setShowPasswordCriteria(true);
            }}
            onFocus={() => setShowPasswordCriteria(true)}
            onBlur={() => setShowPasswordCriteria(false)}
            icon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            }
          />
          {showPasswordCriteria && <PasswordCriteriaList />}
        </View>
        <Input 
          placeholder={i18n.t('register.confirmPassword')} 
          secureTextEntry={!showPassword}
          style={[styles.input, !isPasswordMatch && confirmPassword.length > 0 && styles.inputError]} 
          value={confirmPassword} 
          onChangeText={setConfirmPassword}
        />
        <Button 
          title={i18n.t('register.registerButton')} 
          onPress={handleRegister} 
          style={[styles.button, !isFormValid && styles.buttonDisabled]} 
          disabled={!isFormValid}
        />
        <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
          <Text style={styles.link}>
            {i18n.t('register.alreadyHaveAccount')} <Text style={styles.linkText}>{i18n.t('register.login')}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  accessText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 10,
  },
  connectText: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 10,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    width: '100%',
    maxWidth: 300,
    borderWidth: 1,
    borderColor: '#AE1913',
    backgroundColor: '#AE191344',
    borderRadius: 25,
    paddingVertical: 12,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  orText: {
    marginHorizontal: 10,
    color: '#FFF',
  },
  title: {
    fontSize: 18,
    color: '#FFF',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    maxWidth: 340,
    marginBottom: 5,
  },
  button: {
    marginTop: 20,
    width: '100%',
    maxWidth: 340,
  },
  link: {
    marginTop: 10,
    color: '#FFF',
  },
  linkText: {
    color: '#AE1913',
    fontWeight: 'bold',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  passwordContainer: {
    width: '100%',
    maxWidth: 340,
  },
  criteriaContainer: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  criteriaTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  criteriaText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
});

export default RegisterScreen; 