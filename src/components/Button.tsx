import React from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, View, ActivityIndicator } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

const Button = ({ title, icon, style, loading, disabled, ...props }: ButtonProps) => {
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        style,
        (disabled || loading) && styles.disabled
      ]} 
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#fff" style={styles.icon} />
      ) : (
        <>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={styles.text}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#AE1913',
    paddingVertical: 16,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%', 
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
});

export default Button;