import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CopilotStep, walkthroughable } from 'react-native-copilot';
import i18n from '../../translations/i18n';

const WalkthroughableView = walkthroughable(View);

interface DirectionSelectorProps {
  pickupDirection: 'a2h' | 'h2a';
}

export const DirectionSelector: React.FC<DirectionSelectorProps> = ({ pickupDirection }) => {
  return (
    <CopilotStep
      text={i18n.t('copilot.selectedDirection')}
      order={1}
      name="directionSelector"
    >
      <WalkthroughableView style={styles.enhancedHighlight}>
        <View style={styles.directionSwitchWrapper}>
          <View style={styles.directionControls}>
            {pickupDirection === 'a2h' ? (
              // Airport to Hotel layout
              <>
                <View style={styles.endpointWithLabel}>
                  <View style={[styles.directionEndpoint, styles.activeEndpoint]}>
                    <MaterialIcons name="flight" size={16} color="#CE1126" />
                  </View>
                  <Text style={styles.endpointLabel}>{i18n.t('pickup.airport')}</Text>
                </View>

                <View style={styles.directionMiddle}>
                  <Ionicons name="arrow-forward" size={20} color="#666" />
                  <Text style={styles.toLabel}>{i18n.t('pickup.toDirection')}</Text>
                </View>

                <View style={styles.endpointWithLabel}>
                  <View style={styles.directionEndpoint}>
                    <MaterialIcons name="hotel" size={16} color="#008060" />
                  </View>
                  <Text style={styles.endpointLabel}>{i18n.t('pickup.hotel')}</Text>
                </View>
              </>
            ) : (
              // Hotel to Airport layout
              <>
                <View style={styles.endpointWithLabel}>
                  <View style={[styles.directionEndpoint, styles.activeEndpoint]}>
                    <MaterialIcons name="hotel" size={16} color="#008060" />
                  </View>
                  <Text style={styles.endpointLabel}>{i18n.t('pickup.hotel')}</Text>
                </View>

                <View style={styles.directionMiddle}>
                  <Ionicons name="arrow-forward" size={20} color="#666" />
                  <Text style={styles.toLabel}>{i18n.t('pickup.toDirection')}</Text>
                </View>

                <View style={styles.endpointWithLabel}>
                  <View style={styles.directionEndpoint}>
                    <MaterialIcons name="flight" size={16} color="#CE1126" />
                  </View>
                  <Text style={styles.endpointLabel}>{i18n.t('pickup.airport')}</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </WalkthroughableView>
    </CopilotStep>
  );
};

const styles = StyleSheet.create({
  enhancedHighlight: {
    width: '100%',
    borderRadius: 8,
    overflow: 'visible',
    backgroundColor: 'transparent',
    padding: 2,
    marginBottom: 0,
    zIndex: 100,
  },
  directionSwitchWrapper: {
    marginBottom: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
  },
  directionControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  endpointWithLabel: {
    alignItems: 'center',
    width: 70,
  },
  directionEndpoint: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#fff',
    marginBottom: 4,
  },
  activeEndpoint: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  directionMiddle: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  endpointLabel: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  toLabel: {
    fontSize: 13,
    color: '#666',
  },
});

