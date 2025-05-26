import { AntDesign, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BackButton from './BackButton';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  showTour?: boolean;             
  onTourPress?: () => void;       
  showReset?: boolean;
  onResetPress?: () => void;
  showOnboarding?: boolean;       // new prop
  onOnboardingPress?: () => void; // new prop
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  onBack,
  showTour = false,
  onTourPress,
  showReset = false,
  onResetPress,
  showOnboarding = false,
  onOnboardingPress,
}) => {
  return (
    <View style={styles.header}>
      {/* Bouton retour */}
      {onBack ? (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <AntDesign name="left" size={24} color="black" />
        </TouchableOpacity>
      ) : (
        <BackButton />
      )}

      {/* Titre, s'étire et wrap si trop long */}
      <Text
        style={styles.headerTitle}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {title}
      </Text>

      {/* Boutons à droite */}
      <View style={styles.rightButtons}>
        {/* Bouton Reset (en dev uniquement) */}
        {showReset && onResetPress && (
          <TouchableOpacity style={styles.resetButton} onPress={onResetPress}>
            <Ionicons name="refresh-outline" size={20} color="#CE1126" />
          </TouchableOpacity>
        )}
        
        {/* Bouton Onboarding */}
        {showOnboarding && onOnboardingPress && (
          <TouchableOpacity style={styles.onboardingButton} onPress={onOnboardingPress}>
            <Ionicons name="book-outline" size={20} color="#FFF" />
          </TouchableOpacity>
        )}
        
        {/* Bouton Tour Guide */}
        {showTour && onTourPress && (
          <TouchableOpacity style={styles.tourButton} onPress={onTourPress}>
            <Ionicons name="information-circle-outline" size={20} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
    //paddingLeft: 15,
    justifyContent: 'center',
  },
 
  backButton: {
    width: 42,
    height: 42,
    backgroundColor: 'white', 
    borderRadius: 42 / 2, 
    borderWidth: 2, 
    borderColor: '#D3D3D3', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    paddingHorizontal:6,
    marginLeft: 6,
    marginRight: 25,
    fontFamily: 'Raleway', 
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: 0,
    color: '#000000',
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resetButton: {
    backgroundColor: '#FCEBEC',
    borderRadius: 25,
    paddingVertical: 5,
    paddingHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  onboardingButton: {
    backgroundColor: '#008060',
    borderRadius: 25,
    paddingVertical: 5,
    paddingHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tourButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 25,
    paddingVertical: 5,
    paddingHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default ScreenHeader;