import { StyleSheet, View } from 'react-native';
import HomeContainer from '../containers/HomeContainer';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <HomeContainer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
}); 