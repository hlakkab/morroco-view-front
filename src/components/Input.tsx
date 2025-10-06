import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

interface InputProps extends TextInputProps {
  icon?: React.ReactNode;
}

const Input = ({ icon, style, ...props }: InputProps) => {
  return (
    <View style={[styles.container, style]}>
      <TextInput 
        style={styles.input} 
        placeholderTextColor="#666"
        {...props} 
      />
      {icon && <View style={styles.icon}>{icon}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 32,
    paddingHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#AE191344',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  icon: {
    marginLeft: 8,
    padding: 4,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
    paddingVertical: 6,
  },
});

export default Input; 