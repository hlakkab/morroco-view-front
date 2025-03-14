import React from 'react';
import {TouchableOpacity, Text, StyleSheet, View, ViewStyle, TextStyle, TouchableOpacityProps, ActivityIndicator} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
  iconStyle?: ViewStyle;
}

const ButtonFixe: React.FC<ButtonProps> = ({
  title,
  icon,
  loading,
  disabled,
  containerStyle,
  buttonStyle,
  textStyle,
  iconStyle,
  ...rest
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        style={[
          styles.button,
          buttonStyle,
          (disabled || loading) && styles.disabledButton
        ]}
        disabled={disabled || loading}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator color="#fff" style={styles.icon} />
        ) : (
          <>
            {icon && <View style={[styles.icon, iconStyle]}>{icon}</View>}
            {title && <Text style={[styles.text, textStyle]}>{title}</Text>}
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: -15,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    width: 415,
    height: 85,
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFF7F7',
  },
  button: {
    marginTop: 12,
    width: 340,
    height: 53,
    borderRadius: 32,
    backgroundColor: '#AE1913',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 20px 0px #AE191366',
  },
  text: {
   color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.5,
  },
  icon: {
    marginRight: 8,
  },
});


export default ButtonFixe;
