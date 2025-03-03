import { StyleSheet, View } from 'react-native';
import DetailsContainer from '../containers/DetailsContainer';

export default function DetailsScreen() {
  return (
    <View style={styles.container}>
      <DetailsContainer />
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