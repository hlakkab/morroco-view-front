/**
 * Mock Guides Data
 * 
 * This file contains sample guide data for testing the E-Guide feature
 * before the backend APIs are ready.
 * 
 * To switch between mock and real API:
 * 1. Open src/store/guideSlice.ts
 * 2. Change USE_MOCK_DATA from true to false
 * 
 * Features:
 * - 10 diverse guides across different Moroccan cities
 * - Realistic data with images, ratings, languages, specialties
 * - Covers all major tourist cities (Marrakech, Fez, Casablanca, etc.)
 * - Various specialties: History, Culture, Food, Adventure, Photography
 * - Multiple language combinations
 * - Mix of featured and regular guides
 */

import { Guide } from '../types/guide';

export const mockGuides: Guide[] = [
  {
    id: '1',
    name: 'Ahmed El Fassi',
    images: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800',
      'https://images.unsplash.com/photo-1522556189639-b150ed9c4330?w=800'
    ],
    city: 'Marrakech',
    region: 'Marrakech-Safi',
    coordinates: '31.6295,7.9811',
    rating: 4.9,
    reviewCount: 127,
    pricePerTour: 350,
    currency: 'MAD',
    isFeatured: true,
    saved: false,
    bio: 'With over 15 years of experience guiding travelers through the enchanting streets of Marrakech, I specialize in uncovering the hidden gems of the Medina, from secret souks to artisan workshops. My passion is sharing the rich history and vibrant culture of Morocco with visitors from around the world. I hold official certifications from the Moroccan Ministry of Tourism and speak multiple languages fluently.',
    languages: ['English', 'French', 'Arabic', 'Spanish'],
    specialties: ['History', 'Culture', 'Food & Cuisine'],
    certifications: ['Official Tourism Guide License', 'First Aid Certified', 'UNESCO Heritage Specialist'],
    experienceYears: 15,
    phoneNumber: '+212 600 123 456',
    email: 'ahmed.elfassi@example.com',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    startTime: '08:00',
    endTime: '20:00',
    mapId: 'https://maps.google.com/?q=31.6295,7.9811'
  },
  {
    id: '2',
    name: 'Fatima Zahra',
    images: [
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800'
    ],
    city: 'Fez',
    region: 'Fès-Meknès',
    coordinates: '34.0181,5.0078',
    rating: 4.8,
    reviewCount: 98,
    pricePerTour: 300,
    currency: 'MAD',
    isFeatured: true,
    saved: false,
    bio: 'Born and raised in the heart of Fez, I offer authentic tours of the world\'s largest living medieval city. My expertise includes the tanneries, traditional crafts, and the spiritual significance of our ancient mosques and madrasas. I love introducing visitors to local artisans and explaining the centuries-old techniques still used today.',
    languages: ['English', 'French', 'Arabic'],
    specialties: ['History', 'Culture', 'Adventure'],
    certifications: ['Licensed Tourism Guide', 'Cultural Heritage Expert'],
    experienceYears: 10,
    phoneNumber: '+212 600 234 567',
    email: 'fatima.zahra@example.com',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Sunday'],
    startTime: '09:00',
    endTime: '19:00',
    mapId: 'https://maps.google.com/?q=34.0181,5.0078'
  },
  {
    id: '3',
    name: 'Youssef Benjelloun',
    images: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800'
    ],
    city: 'Casablanca',
    region: 'Casablanca-Settat',
    coordinates: '33.5731,7.5898',
    rating: 4.7,
    reviewCount: 85,
    pricePerTour: 400,
    currency: 'MAD',
    isFeatured: false,
    saved: false,
    bio: 'As a modern Casablanca native, I bridge the gap between Morocco\'s contemporary urban life and its rich traditions. My tours showcase the stunning Hassan II Mosque, Art Deco architecture, and the vibrant food scene. I also offer day trips to nearby coastal towns and can arrange business-friendly tours for corporate travelers.',
    languages: ['English', 'French', 'Arabic', 'Spanish', 'German'],
    specialties: ['Culture', 'Food & Cuisine', 'Photography'],
    certifications: ['Professional Tour Guide License', 'Business Tourism Specialist'],
    experienceYears: 8,
    phoneNumber: '+212 600 345 678',
    email: 'youssef.b@example.com',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    startTime: '08:00',
    endTime: '21:00',
    mapId: 'https://maps.google.com/?q=33.5731,7.5898'
  },
  {
    id: '4',
    name: 'Omar Idrissi',
    images: [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800'
    ],
    city: 'Rabat',
    region: 'Rabat-Salé-Kénitra',
    coordinates: '34.0209,6.8416',
    rating: 4.9,
    reviewCount: 112,
    pricePerTour: 320,
    currency: 'MAD',
    isFeatured: true,
    saved: false,
    bio: 'Specializing in Morocco\'s capital city and its UNESCO World Heritage sites, I provide in-depth historical tours of the Kasbah of the Udayas, Hassan Tower, and the modern political quarter. With a background in archaeology, I bring ancient history to life with fascinating stories and archaeological insights.',
    languages: ['English', 'French', 'Arabic', 'Italian'],
    specialties: ['History', 'Culture'],
    certifications: ['National Tour Guide License', 'Archaeology Degree', 'UNESCO Heritage Guide'],
    experienceYears: 12,
    phoneNumber: '+212 600 456 789',
    email: 'omar.idrissi@example.com',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday', 'Sunday'],
    startTime: '09:00',
    endTime: '18:00',
    mapId: 'https://maps.google.com/?q=34.0209,6.8416'
  },
  {
    id: '5',
    name: 'Amina Berrada',
    images: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800'
    ],
    city: 'Agadir',
    region: 'Souss-Massa',
    coordinates: '30.4278,9.5981',
    rating: 4.6,
    reviewCount: 67,
    pricePerTour: 280,
    currency: 'MAD',
    isFeatured: false,
    saved: false,
    bio: 'Beach lover and adventure enthusiast! I specialize in eco-tourism and outdoor activities around Agadir. From surfing lessons to hiking in Paradise Valley, camel rides at sunset to discovering traditional Berber villages, I create unforgettable nature-based experiences. Perfect for families and active travelers.',
    languages: ['English', 'French', 'Arabic', 'Berber'],
    specialties: ['Adventure', 'Nature', 'Photography'],
    certifications: ['Licensed Guide', 'Surf Instructor', 'Eco-Tourism Specialist'],
    experienceYears: 6,
    phoneNumber: '+212 600 567 890',
    email: 'amina.berrada@example.com',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    startTime: '07:00',
    endTime: '20:00',
    mapId: 'https://maps.google.com/?q=30.4278,9.5981'
  },
  {
    id: '6',
    name: 'Hassan Tazi',
    images: [
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800',
      'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=800'
    ],
    city: 'Tangier',
    region: 'Tanger-Tétouan-Al Hoceïma',
    coordinates: '35.7595,5.8340',
    rating: 4.8,
    reviewCount: 94,
    pricePerTour: 310,
    currency: 'MAD',
    isFeatured: false,
    saved: false,
    bio: 'Gateway to Africa guide! Born in Tangier, I share the unique blend of European and African influences that make this port city special. My tours cover the historic medina, the caves of Hercules, Cape Spartel, and the artistic legacy left by famous writers and painters who called Tangier home.',
    languages: ['English', 'French', 'Arabic', 'Spanish'],
    specialties: ['History', 'Culture', 'Photography'],
    certifications: ['Professional Guide License', 'Art History Certificate'],
    experienceYears: 9,
    phoneNumber: '+212 600 678 901',
    email: 'hassan.tazi@example.com',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Friday', 'Saturday', 'Sunday'],
    startTime: '09:00',
    endTime: '19:00',
    mapId: 'https://maps.google.com/?q=35.7595,5.8340'
  },
  {
    id: '7',
    name: 'Laila Mansouri',
    images: [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800'
    ],
    city: 'Marrakech',
    region: 'Marrakech-Safi',
    coordinates: '31.6295,7.9811',
    rating: 5.0,
    reviewCount: 156,
    pricePerTour: 380,
    currency: 'MAD',
    isFeatured: true,
    saved: false,
    bio: 'Culinary expert and food tour specialist! I take you on gastronomic journeys through Marrakech\'s best food spots, from street food stalls to traditional riads. Learn to cook authentic tagines, visit spice markets, and discover the secrets of Moroccan cuisine. Also offer cooking classes and market tours.',
    languages: ['English', 'French', 'Arabic', 'Japanese'],
    specialties: ['Food & Cuisine', 'Culture'],
    certifications: ['Licensed Guide', 'Professional Chef Certificate', 'Food Safety Certified'],
    experienceYears: 11,
    phoneNumber: '+212 600 789 012',
    email: 'laila.mansouri@example.com',
    availableDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    startTime: '10:00',
    endTime: '22:00',
    mapId: 'https://maps.google.com/?q=31.6295,7.9811'
  },
  {
    id: '8',
    name: 'Karim Alaoui',
    images: [
      'https://images.unsplash.com/photo-1463453091185-61582044d556?w=800',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'
    ],
    city: 'Fez',
    region: 'Fès-Meknès',
    coordinates: '34.0181,5.0078',
    rating: 4.7,
    reviewCount: 78,
    pricePerTour: 290,
    currency: 'MAD',
    isFeatured: false,
    saved: false,
    bio: 'Photography guide specializing in capturing the essence of Fez. I know all the best spots for Instagram-worthy shots, from sunrise at Borj Nord to the colorful tanneries. I help you compose stunning photos while learning about the city\'s history and culture. Perfect for photography enthusiasts!',
    languages: ['English', 'French', 'Arabic', 'Chinese'],
    specialties: ['Photography', 'Culture', 'History'],
    certifications: ['Licensed Guide', 'Professional Photographer'],
    experienceYears: 7,
    phoneNumber: '+212 600 890 123',
    email: 'karim.alaoui@example.com',
    availableDays: ['Monday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    startTime: '06:00',
    endTime: '20:00',
    mapId: 'https://maps.google.com/?q=34.0181,5.0078'
  },
  {
    id: '9',
    name: 'Nadia Cherkaoui',
    images: [
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800',
      'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=800'
    ],
    city: 'Casablanca',
    region: 'Casablanca-Settat',
    coordinates: '33.5731,7.5898',
    rating: 4.9,
    reviewCount: 103,
    pricePerTour: 350,
    currency: 'MAD',
    isFeatured: false,
    saved: false,
    bio: 'Art and architecture specialist offering unique perspectives on Casablanca\'s Art Deco heritage and contemporary art scene. I conduct tours of galleries, street art, and architectural landmarks while explaining Morocco\'s artistic evolution. Ideal for culture enthusiasts and architecture lovers.',
    languages: ['English', 'French', 'Arabic'],
    specialties: ['Culture', 'History', 'Photography'],
    certifications: ['Official Guide License', 'Art History Master\'s Degree'],
    experienceYears: 13,
    phoneNumber: '+212 600 901 234',
    email: 'nadia.cherkaoui@example.com',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
    startTime: '10:00',
    endTime: '19:00',
    mapId: 'https://maps.google.com/?q=33.5731,7.5898'
  },
  {
    id: '10',
    name: 'Rachid Bennani',
    images: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800'
    ],
    city: 'Marrakech',
    region: 'Marrakech-Safi',
    coordinates: '31.6295,7.9811',
    rating: 4.6,
    reviewCount: 72,
    pricePerTour: 420,
    currency: 'MAD',
    isFeatured: false,
    saved: false,
    bio: 'Adventure guide offering Atlas Mountains excursions, desert trips to Merzouga, and multi-day trekking experiences. From camel trekking to 4x4 adventures, I organize unforgettable outdoor experiences. Perfect for thrill-seekers wanting to explore Morocco\'s diverse landscapes beyond the cities.',
    languages: ['English', 'French', 'Arabic', 'German'],
    specialties: ['Adventure', 'Nature', 'Photography'],
    certifications: ['Mountain Guide License', 'First Aid & Rescue Training', 'Desert Navigation Expert'],
    experienceYears: 14,
    phoneNumber: '+212 600 012 345',
    email: 'rachid.bennani@example.com',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    startTime: '06:00',
    endTime: '22:00',
    mapId: 'https://maps.google.com/?q=31.6295,7.9811'
  }
];

// Helper function to get guides by city
export const getGuidesByCity = (city: string): Guide[] => {
  if (!city || city.toLowerCase() === 'all') {
    return mockGuides;
  }
  
  return mockGuides.filter(guide => 
    guide.city.toLowerCase().includes(city.toLowerCase()) ||
    guide.region.toLowerCase().includes(city.toLowerCase())
  );
};

// Helper function to search guides
export const searchGuides = (query: string): Guide[] => {
  if (!query || query.trim() === '') {
    return mockGuides;
  }
  
  const normalizedQuery = query.toLowerCase();
  return mockGuides.filter(guide =>
    guide.name.toLowerCase().includes(normalizedQuery) ||
    guide.city.toLowerCase().includes(normalizedQuery) ||
    guide.region.toLowerCase().includes(normalizedQuery) ||
    guide.bio.toLowerCase().includes(normalizedQuery) ||
    guide.specialties.some(s => s.toLowerCase().includes(normalizedQuery)) ||
    guide.languages.some(l => l.toLowerCase().includes(normalizedQuery))
  );
};

