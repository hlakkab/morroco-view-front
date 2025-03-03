import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, StyleSheet, Text } from 'react-native';
import { Card } from '../components/Card';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Details'>;

export default function DetailsContainer() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <Card>
      <Text style={styles.title}>Details Screen</Text>
      <Text style={styles.description}>This is a sample details screen using our Card component.</Text>
      <Button
        title="Go back to Home"
        onPress={() => navigation.goBack()}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
    color: '#666',
  },
}); 