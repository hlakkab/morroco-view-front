import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import GoogleIcon from '../../assets/img/icons8-google.svg';
import LogoSvg from '../../assets/img/morroco-view-logo.svg';
import Button from '../../components/Button';
import Input from '../../components/Input';
import i18n from '../../translations/i18n';
import { Ionicons } from '@expo/vector-icons';
import { useLogin } from '../hooks/useLogin';
import { styles } from '../styles/LoginScreen.styles';

const LoginScreen = () => {
  const navigation = useNavigation();
  
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    handleLogin,
    handleGoogleAuth,
  } = useLogin();

  const onLoginSuccess = () => {
    navigation.navigate('Home' as never);
  };

  return (
    <LinearGradient
      colors={['#AE191300', '#AE191344', '#F18D8F']}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <LogoSvg width={80} height={80} />
          <Text style={styles.accessText}>{i18n.t('login.accessAccount')}</Text>
        </View>
        
        <TouchableOpacity 
          onPress={() => handleGoogleAuth(onLoginSuccess)}
          style={styles.googleButton}
        >
          <GoogleIcon width={24} height={24} />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>
        
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.orText}>{i18n.t('login.or')}</Text>
          <View style={styles.divider} />
        </View>
        
        <Text style={styles.title}>{i18n.t('login.enterCredentials')}</Text>
        <Input placeholder={i18n.t('login.email')} style={styles.input} value={email} onChangeText={setEmail} />
        <Input 
          placeholder={i18n.t('login.password')} 
          secureTextEntry={!showPassword}
          style={styles.input} 
          value={password} 
          onChangeText={setPassword}
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
        <Button title={i18n.t('login.loginButton')} onPress={() => handleLogin(onLoginSuccess)} style={styles.button} />
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword' as never)}>
          <Text style={styles.link}>
            {i18n.t('login.forgotPassword')} <Text style={styles.linkText}>{i18n.t('login.recover')}</Text>
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
          <Text style={styles.link}>
            {i18n.t('login.needAccount')} <Text style={styles.linkText}>{i18n.t('login.register')}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default LoginScreen; 