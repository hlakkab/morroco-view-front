import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import i18n from '../../translations/i18n';

interface RouteDisplayProps {
  pickupDirection: 'a2h' | 'h2a';
  selectedCity: string;
}

export const RouteDisplay: React.FC<RouteDisplayProps> = ({ pickupDirection, selectedCity }) => {
  return (
    <View style={styles.routeContainer}>
      {pickupDirection === 'a2h' ? (
        <>
          <View style={styles.routeItem}>
            <View style={styles.routeIconContainer}>
              <MaterialIcons name="flight" size={20} color="#fff" />
            </View>
            <Text style={styles.routeText}>{selectedCity} {i18n.t('pickup.airport')}</Text>
          </View>
          <View style={styles.routeLine}>
            <View style={styles.routeDash}></View>
            <View style={styles.routeDash}></View>
            <View style={styles.routeDash}></View>
            <View style={styles.routeDash}></View>
          </View>
          <View style={styles.routeItem}>
            <View style={[styles.routeIconContainer, styles.destinationIconContainer]}>
              <MaterialIcons name="hotel" size={20} color="#fff" />
            </View>
            <Text style={styles.routeText}>{i18n.t('pickup.hotel')} {i18n.t('pickup.in')} {selectedCity}</Text>
          </View>
        </>
      ) : (
        <>
          <View style={styles.routeItem}>
            <View style={[styles.routeIconContainer, styles.destinationIconContainer]}>
              <MaterialIcons name="hotel" size={20} color="#fff" />
            </View>
            <Text style={styles.routeText}>{i18n.t('pickup.hotel')} {i18n.t('pickup.in')} {selectedCity}</Text>
          </View>
          <View style={styles.routeLine}>
            <View style={styles.routeDash}></View>
            <View style={styles.routeDash}></View>
            <View style={styles.routeDash}></View>
            <View style={styles.routeDash}></View>
          </View>
          <View style={styles.routeItem}>
            <View style={styles.routeIconContainer}>
              <MaterialIcons name="flight" size={20} color="#fff" />
            </View>
            <Text style={styles.routeText}>{selectedCity} {i18n.t('pickup.airport')}</Text>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  routeContainer: {
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  routeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#CE1126',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  destinationIconContainer: {
    backgroundColor: '#008060',
  },
  routeLine: {
    height: 34,
    width: 2,
    marginLeft: 17,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  routeDash: {
    width: 2,
    height: 6,
    backgroundColor: '#ddd',
  },
  routeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
});

