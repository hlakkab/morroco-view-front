import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TextWithMore from './TextWithMore';

interface AboutSectionProps {
  title?: string;
  text: string;
  style?: any;
}

const AboutSection: React.FC<AboutSectionProps> = ({ title, text, style }) => {
  return (
    <View style={styles.aboutSection}>
      <Text style={styles.title}>{title}</Text>
      <TextWithMore text={text} style={[styles.aboutText, style]} />
    </View>
  );
};

const styles = StyleSheet.create({
  aboutSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: '#000',
  },
  aboutText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
});

export default AboutSection;