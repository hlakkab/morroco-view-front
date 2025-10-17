import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface TicketPurchaseStatusProps {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error?: string | null;
}

const TicketPurchaseStatus: React.FC<TicketPurchaseStatusProps> = ({ status, error }) => {
  if (status === 'idle') {
    return null;
  }

  return (
    <View style={styles.container}>
      {status === 'loading' && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#AE1913" />
          <Text style={styles.loadingText}>Processing your purchase...</Text>
        </View>
      )}
      
      {status === 'succeeded' && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>Ticket purchased successfully!</Text>
        </View>
      )}
      
      {status === 'failed' && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Failed to purchase ticket'}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginVertical: 10,
    borderRadius: 8,
    width: '100%',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6FAFF',
    padding: 10,
    borderRadius: 8,
  },
  loadingText: {
    marginLeft: 10,
    color: '#333',
    fontSize: 14,
  },
  successContainer: {
    backgroundColor: '#E6F4EA',
    padding: 10,
    borderRadius: 8,
  },
  successText: {
    color: '#137333',
    fontSize: 14,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#FEEAE6',
    padding: 10,
    borderRadius: 8,
  },
  errorText: {
    color: '#AE1913',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default TicketPurchaseStatus; 