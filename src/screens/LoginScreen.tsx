import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import GoogleIcon from '../assets/img/icons8-google.svg';
import LogoSvg from '../assets/img/morroco-view-logo.svg';
import Button from '../components/Button';
import Input from '../components/Input';
import { login } from '../service';


const LoginScreen = () => {
  const navigation = useNavigation();

  const [email, setEmail] = useState('mohcine.sahtani@gmail.com');
  const [password, setPassword] = useState('mohcine@sahtani2001');

  const handleLogin = () => {
    login(email, password)
      .then( _ => {
        navigation.navigate('Home' as never)
      })
      .catch(error => {
        console.error('Login failed:', error);
      });
  };

  const handleGoogleAuth = () => {
    // Implement Google authentication logic here
    console.log('Google authentication');
  };

  return (
    <LinearGradient
      colors={['#AE191300', '#AE191344', '#F18D8F']}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <LogoSvg width={80} height={80} />
          <Text style={styles.accessText}>Access my account</Text>
        </View>
        <Text style={styles.connectText}>Connect with</Text>
        <Button
          title="Google"
          onPress={handleGoogleAuth}
          style={styles.googleButton}
          icon={<GoogleIcon width={24} height={24} />}
        />
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.divider} />
        </View>
        <Text style={styles.title}>Please enter your login</Text>
        <Input placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} />
        <Input placeholder="Password" secureTextEntry style={styles.input} value={password} onChangeText={setPassword} />
        <Button title="Login" onPress={handleLogin} style={styles.button} />
        <Text style={styles.link}>
          Forgot your password? <Text style={styles.linkText}>Recover</Text>
        </Text>
        <Text style={styles.link}>
          Need an account? <Text style={styles.linkText}>Register</Text>
        </Text>
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
    marginBottom: 10,
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
});

export default LoginScreen; 