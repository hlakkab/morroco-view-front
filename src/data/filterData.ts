import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FilterCategory, FilterOption } from '../components/FilterPopup';
import i18n from '../translations/i18n';
import { ArtisanType } from '../types/Artisan';
import { MonumentType } from '../types/Monument';

// Cities data
export const cities = [
    { id: 'casablanca', label: 'Casablanca' },
    { id: 'rabat', label: 'Rabat' },
    { id: 'marrakech', label: 'Marrakech' },
    { id: 'fez', label: 'Fez' },
    { id: 'tangier', label: 'Tangier' },
    { id: 'agadir', label: 'Agadir' },
    { id: 'oujda', label: 'Oujda' },
    { id: 'kenitra', label: 'Kenitra' },
    { id: 'tetouan', label: 'Tetouan' },
    { id: 'safi', label: 'Safi' },
];

// Match cities data (only for matches)
export const matchCities = [
    { id: 'casablanca', label: 'Casablanca' },
    { id: 'marrakech', label: 'Marrakech' },
    { id: 'fez', label: 'Fez' },
    { id: 'tangier', label: 'Tangier' },
    { id: 'agadir', label: 'Agadir' },
    { id: 'rabat', label: 'Rabat' }
];

// Stadiums data
export const stadiums = [
    { id: 'Mohammed V Stadium', label: 'Mohammed V Stadium' },
    { id: 'Prince Moulay Abdellah Stadium', label: 'Prince Moulay Abdellah Stadium' },
    { id: 'Marrakech Stadium', label: 'Marrakech Stadium' },
    { id: 'Fez Sports Complex', label: 'Fez Sports Complex' },
    { id: 'Ibn Battouta Stadium', label: 'Ibn Battouta Stadium' },
    { id: 'Adrar Stadium', label: 'Adrar Stadium' },
    { id: 'Oujda Honor Stadium', label: 'Oujda Honor Stadium' },
    { id: 'Kenitra Municipal Stadium', label: 'Kenitra Municipal Stadium' },
    { id: 'Saniat Rmel Stadium', label: 'Saniat Rmel Stadium' },
    { id: 'El Massira Stadium', label: 'El Massira Stadium' },
];

// Pickup types data
export const pickupTypes = [
    { id: 'private', label: 'Private Pickup' },
    { id: 'shared', label: 'Shared Pickup' }
];

// Broker types data
export const brokerTypes = [
    { id: 'currency_exchange', label: 'Currency Exchange' },
    { id: 'money_transfer', label: 'Money Transfer' },
    { id: 'crypto_exchange', label: 'Crypto Exchange' },
    { id: 'banking', label: 'Banking Services' }
];

// Monument types data
export const monumentTypes = [
    { id: MonumentType.Historical, label: 'Historical' },
    { id: MonumentType.Religious, label: 'Religious' },
    { id: MonumentType.Cultural, label: 'Cultural' },
    { id: MonumentType.Architectural, label: 'Architectural' },
    { id: MonumentType.Modern, label: 'Modern' },
    { id: MonumentType.Archaeological, label: 'Archaeological' }
];

// Artisan types data
export const artisanTypes = [
    { id: ArtisanType.Leather, label: 'Leather' },
    { id: ArtisanType.Pottery, label: 'Pottery' },
    { id: ArtisanType.Carpets, label: 'Carpets' },
    { id: ArtisanType.Metalwork, label: 'Metalwork' },
    { id: ArtisanType.Woodwork, label: 'Woodwork' },
    { id: ArtisanType.Textiles, label: 'Textiles' }
];

/**
 * Helper function to normalize strings for comparison
 * Converts to lowercase and removes accents
 */
export const normalizeString = (str: string = ''): string => {
    return str.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
};

/**
 * Creates filter options for match filtering (cities and stadiums)
 */
export const createFilterOptions = () => {
    const cityOptions = matchCities.map(city => ({
        id: normalizeString(city.id),
        label: city.label,
        selected: false,
        category: 'city'
    }));

    const stadiumOptions = stadiums.map(stadium => ({
        id: normalizeString(stadium.id),
        label: stadium.label,
        selected: false,
        category: 'stadium'
    }));

    return [...cityOptions, ...stadiumOptions];
};

/**
 * Creates filter options for pickup types
 */
export const createPickupFilterOptions = (): FilterOption[] => {
    return pickupTypes.map(type => ({
        id: normalizeString(type.id),
        label: type.label,
        selected: false,
        category: 'pickup_type'
    }));
};

/**
 * Creates filter options for brokers
 */
export const createBrokerFilterOptions = (): FilterOption[] => {
    const cityOptions = cities.map(city => ({
        id: normalizeString(city.id),
        label: city.label,
        selected: false,
        category: 'broker_city'
    }));

    const typeOptions = brokerTypes.map(type => ({
        id: normalizeString(type.id),
        label: type.label,
        selected: false,
        category: 'broker_type'
    }));

    return [...cityOptions, ...typeOptions];
};

/**
 * Creates filter options for monuments
 */
export const createMonumentFilterOptions = (): FilterOption[] => {
    const cityOptions = cities.map(city => ({
        id: normalizeString(city.id),
        label: city.label,
        selected: false,
        category: 'monument_city'
    }));

    const typeOptions = monumentTypes.map(type => ({
        id: normalizeString(type.id as string),
        label: type.label,
        selected: false,
        category: 'monument_type'
    }));

    return [...cityOptions, ...typeOptions];
};

/**
 * Creates filter options for artisans
 */
export const createArtisanFilterOptions = (): FilterOption[] => {
    const cityOptions = cities.map(city => ({
        id: normalizeString(city.id),
        label: city.label,
        selected: false,
        category: 'artisan_city'
    }));

    const typeOptions = artisanTypes.map(type => ({
        id: normalizeString(type.id as string),
        label: type.label,
        selected: false,
        category: 'artisan_type'
    }));

    return [...cityOptions, ...typeOptions];
};

/**
 * Filter categories for matches - Using getters to ensure translations are fresh
 */
export const getMatchFilterCategories = (): Record<string, FilterCategory> => ({
    city: { 
        key: 'city', 
        label: i18n.t('filters.byCity')
    },
    stadium: { 
        key: 'stadium', 
        label: i18n.t('filters.byStadium')
    }
});

/**
 * Filter categories for pickups - Using getters to ensure translations are fresh
 */
export const getPickupFilterCategories = (): Record<string, FilterCategory> => ({
    pickup_type: { 
        key: 'pickup_type', 
        label: i18n.t('filters.byType')
    }
});

/**
 * Filter categories for brokers - Using getters to ensure translations are fresh
 */
export const getBrokerFilterCategories = (): Record<string, FilterCategory> => ({
    broker_city: {
        key: 'broker_city',
        label: i18n.t('filters.byCity')
    },
    broker_type: {
        key: 'broker_type',
        label: i18n.t('filters.byType')
    }
});

/**
 * Filter categories for monuments - Using getters to ensure translations are fresh
 */
export const getMonumentFilterCategories = (): Record<string, FilterCategory> => ({
    monument_city: {
        key: 'monument_city',
        label: i18n.t('filters.byCity')
    },
    monument_type: {
        key: 'monument_type',
        label: i18n.t('filters.byType')
    }
});

/**
 * Filter categories for artisans - Using getters to ensure translations are fresh
 */
export const getArtisanFilterCategories = (): Record<string, FilterCategory> => ({
    artisan_city: {
        key: 'artisan_city',
        label: i18n.t('filters.byCity')
    },
    artisan_type: {
        key: 'artisan_type',
        label: i18n.t('filters.byType')
    }
});

// For backward compatibility, keep the old references but they should be deprecated
export const matchFilterCategories = getMatchFilterCategories();
export const pickupFilterCategories = getPickupFilterCategories();
export const brokerFilterCategories = getBrokerFilterCategories();
export const monumentFilterCategories = getMonumentFilterCategories();
export const artisanFilterCategories = getArtisanFilterCategories(); 