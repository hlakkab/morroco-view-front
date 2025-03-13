import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

// Import your SVG icons - replace these paths with your actual icon paths
import HomeIcon from '../assets/navbarIcons/home-icon.svg';
import BookmarkIcon from '../assets/navbarIcons/bookmark-icon.svg';
import TicketsIcon from '../assets/navbarIcons/tickets-icon.svg';
import ToursIcon from '../assets/navbarIcons/tours-icon.svg';
import AccountIcon from '../assets/navbarIcons/account-icon.svg';

const { width } = Dimensions.get('window');

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onPress: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive = false, onPress }) => {
  // Clone the icon element and pass the active state to it
  const iconWithActiveState = React.cloneElement(icon as React.ReactElement, {
    // fill: isActive ? '#AE1913' : '#fff',
    // stroke: isActive ? '#AE1913' : '#fff',
    // color: isActive ? '#AE1913' : '#fff',
  });

  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <View style={styles.iconContainer}>
        {iconWithActiveState}
      </View>
      <Text style={[styles.navLabel, isActive && styles.activeLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

interface BottomNavBarProps {
  activeRoute: string;
  onNavigate: (routeName: string) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeRoute, onNavigate }) => {
  return (
    <View style={styles.container}>
      <NavItem 
        icon={<HomeIcon width={24} height={24} 
        fill={activeRoute === 'Home' ? '#AE1913' : '#666'} 
        stroke={activeRoute === 'Home' ? '#AE1913' : '#666'} 
        color={activeRoute === 'Home' ? '#AE1913' : '#666'} />}
        label="Home"
        isActive={activeRoute === 'Home'}
        onPress={() => onNavigate('Home')}
      />
      <NavItem 
        icon={<BookmarkIcon width={24} height={24} 
        fill={activeRoute === 'Bookmark' ? '#AE1913' : '#fff'}
        stroke={activeRoute === 'Bookmark' ? '#AE1913' : '#fff'}
        color={activeRoute === 'Bookmark' ? '#AE1913' : '#fff'} />}
        label="Bookmark"
        isActive={activeRoute === 'Bookmark'}
        onPress={() => onNavigate('Bookmark')}
      />
      <NavItem 
        icon={<TicketsIcon width={24} height={24} 
        fill={activeRoute === 'Tickets' ? '#AE1913' : '#fff'}
        stroke={activeRoute === 'Tickets' ? '#AE1913' : '#fff'}
        color={activeRoute === 'Tickets' ? '#AE1913' : '#fff'} />}
        label="Tickets"
        isActive={activeRoute === 'Tickets'}
        onPress={() => onNavigate('Tickets')}
      />
      <NavItem 
        icon={<ToursIcon width={24} height={24} 
        fill={activeRoute === 'Tours' ? '#AE1913' : '#fff'}
        stroke={activeRoute === 'Tours' ? '#AE1913' : '#fff'}
        color={activeRoute === 'Tours' ? '#AE1913' : '#fff'} />}
        label="Tours"
        isActive={activeRoute === 'Tours'}
        onPress={() => onNavigate('Tours')}
      />
      <NavItem 
        icon={<AccountIcon width={24} height={24} 
        fill={activeRoute === 'Account' ? '#AE1913' : '#fff'}
        stroke={activeRoute === 'Account' ? '#AE1913' : '#fff'}
        color={activeRoute === 'Account' ? '#AE1913' : '#fff'} />}
        label="Account"
        isActive={activeRoute === 'Account'}
        onPress={() => onNavigate('Account')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    width: (width - 40) / 5,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  navLabel: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
  },
  activeLabel: {
    color: '#AE1913',
    fontWeight: '500',
  },
});

export default BottomNavBar;