import { Artisan, ArtisanType } from '../types/Artisan';

export const mockArtisans: Artisan[] = [
  {
    id: '1',
    tag: '🧵 Artisan Souk',
    name: 'Souk Semmarine',
    description: 'One of the largest and most famous souks in Marrakech, offering a wide range of Moroccan crafts. The souk is a maze of small alleys filled with shops selling textiles, leather goods, jewelry, and other traditional crafts.',
    address: 'Souk Semmarine, Marrakech Medina',
    coordinates: '31.6295,-7.9811',
    images: [
      'https://images.unsplash.com/photo-1580413837567-999e9ea2a063',
      'https://images.unsplash.com/photo-1590246815117-be54ce2a0350'
    ],
    visitingHours: '09:00-19:00',
    type: ArtisanType.Textiles,
    mapId: 'souk_semmarine',
    saved: false,
    website: 'https://visitmarrakech.com/souk-semmarine',
    startTime: '09:00',
    endTime: '19:00',
    city: 'marrakech',
    specialties: ['Berber carpets', 'Silk scarves', 'Embroidered fabrics'],
    isFeatured: true,
    about: 'Souk Semmarine is the heart of Marrakech\'s famous markets, dating back to the 11th century. Located in the northern part of the medina, it\'s a bustling maze of narrow alleyways lined with shops selling everything from traditional Berber carpets and textiles to modern souvenirs. The souk is known for its vibrant atmosphere, skilled artisans, and the opportunity to see traditional craftsmanship firsthand.'
  },
  {
    id: '2',
    tag: '🧵 Artisan Souk',
    name: 'Souk el Attarine',
    description: 'Famous for its spices and perfumes, this aromatic souk also offers a variety of traditional Moroccan crafts and antiques.',
    address: 'Souk el Attarine, Fez Medina',
    coordinates: '34.0633,-5.0022',
    images: [
      'https://images.unsplash.com/photo-1590852584420-a917a61a42a5',
      'https://images.unsplash.com/photo-1563291589-4e9a1757428d'
    ],
    visitingHours: '10:00-18:00',
    type: ArtisanType.Pottery,
    mapId: 'souk_attarine',
    saved: false,
    startTime: '10:00',
    endTime: '18:00',
    city: 'fes',
    specialties: ['Ceramic plates', 'Tajine pots', 'Decorative pottery'],
    about: 'Souk el Attarine (Perfume or Spice Souk) is one of the most famous markets in Fez\'s ancient medina. While originally known for its spices and perfumes, it has evolved to include a wide range of handicrafts, particularly featuring traditional Moroccan pottery. The souk is renowned for its intricate ceramics decorated with geometric patterns and vibrant colors that reflect the rich artistic heritage of Moroccan craftsmanship.'
  },
  {
    id: '3',
    tag: '🧵 Artisan Souk',
    name: 'Souk Chouari',
    description: 'Renowned for its skilled woodworkers, this souk specializes in cedar wood products, from furniture to intricate carvings.',
    address: 'Souk Chouari, Marrakech Medina',
    coordinates: '31.6284,-7.9892',
    images: [
      'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72',
      'https://images.unsplash.com/photo-1590418606746-018840f9cd0f'
    ],
    visitingHours: '09:30-18:30',
    type: ArtisanType.Woodwork,
    mapId: 'souk_chouari',
    saved: true,
    startTime: '09:30',
    endTime: '18:30',
    city: 'marrakech',
    specialties: ['Cedar furniture', 'Wooden boxes', 'Carved panels'],
    about: 'Souk Chouari is a traditional woodworking market in Marrakech where master craftsmen create beautiful pieces from cedar and other fine woods. Visitors can watch artisans carving intricate designs, inlaying wood with mother-of-pearl, or constructing traditional furniture. The souk fills the air with the pleasant aroma of cedar and offers a glimpse into centuries-old woodworking traditions that have been passed down through generations.'
  },
  {
    id: '4',
    tag: '🧵 Artisan Souk',
    name: 'Souk El Fekka',
    description: 'A bustling textile market where you can find a vast array of fabrics, traditional Moroccan clothing, and carpets.',
    address: 'Souk El Fekka, Medina, Tangier',
    coordinates: '35.7857,-5.8134',
    images: [
      'https://images.unsplash.com/photo-1535372467890-9fc862a991a5',
      'https://images.unsplash.com/photo-1535371645356-3bc0499397bc'
    ],
    visitingHours: '10:00-19:30',
    type: ArtisanType.Textiles,
    mapId: 'souk_fekka',
    saved: false,
    startTime: '10:00',
    endTime: '19:30',
    city: 'tangier',
    specialties: ['Hand-woven blankets', 'Traditional djellabas', 'Silk textiles'],
    about: 'Souk El Fekka is a vibrant textile market in Tangier\'s medina where colorful fabrics and garments create a visual feast. The souk is filled with shops selling handwoven textiles, traditional Moroccan clothing like kaftans and djellabas, and a variety of fabric accessories. Skilled tailors can be seen working on custom garments, maintaining the traditional craftsmanship that has made Moroccan textiles famous worldwide.'
  },
  {
    id: '5',
    tag: '🧵 Artisan Souk',
    name: 'Souk Nejjarine',
    description: 'Famous for its fine leather goods and a beautiful old foundouk (caravanserai) that now houses the Museum of Wooden Arts & Crafts.',
    address: 'Place Seffarine, Fez Medina',
    coordinates: '34.0651,-4.9762',
    images: [
      'https://images.unsplash.com/photo-1534430224470-5453979ae6ff',
      'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae'
    ],
    visitingHours: '09:00-18:00',
    type: ArtisanType.Leather,
    mapId: 'souk_nejjarine',
    saved: false,
    startTime: '09:00',
    endTime: '18:00',
    city: 'fes',
    specialties: ['Leather bags', 'Leather pouffes', 'Traditional shoes'],
    isFeatured: true,
    about: 'Souk Nejjarine is a historic carpenter\'s souk in Fez, centered around a restored 18th-century foundouk (caravanserai) that now houses the Museum of Wooden Arts & Crafts. The area has evolved to include many leather artisans, making it a prime destination for handcrafted leather goods. Visitors can observe the entire process of leather crafting and purchase high-quality items directly from the makers.'
  },
  {
    id: '6',
    tag: '🧵 Artisan Souk',
    name: 'Souk des Bijoutiers',
    description: 'The jewelers\' souk, where skilled craftsmen create and sell traditional Moroccan jewelry in silver and gold.',
    address: 'Souk des Bijoutiers, Rabat Medina',
    coordinates: '34.0247,-6.8347',
    images: [
      'https://images.unsplash.com/photo-1539613399083-5d1a1c9f779e',
      'https://images.unsplash.com/photo-1573148893371-25492146cb95'
    ],
    visitingHours: '10:30-19:00',
    type: ArtisanType.Metalwork,
    mapId: 'souk_bijoutiers',
    saved: false,
    startTime: '10:30',
    endTime: '19:00',
    city: 'rabat',
    specialties: ['Silver jewelry', 'Berber designs', 'Gold filigree work'],
    about: 'Souk des Bijoutiers is the jewelers\' quarter in Rabat\'s medina, where master craftsmen continue centuries-old traditions of Moroccan jewelry making. Visitors can watch artisans working with silver and gold, creating intricate pieces often inspired by Berber designs and Islamic geometric patterns. The souk offers everything from everyday silver jewelry to elaborate gold pieces for special occasions, all showcasing the remarkable skill of Moroccan metalwork.'
  },
  {
    id: '7',
    tag: '🧵 Artisan Souk',
    name: 'Ensemble Artisanal',
    description: 'A government-supported crafts center where artisans work and sell authentic handmade products at fixed prices.',
    address: 'Avenue Lalla Yacout, Casablanca',
    coordinates: '33.5992,-7.6128',
    images: [
      'https://images.unsplash.com/photo-1489274495757-95c7c837b101',
      'https://images.unsplash.com/photo-1557531365-e8b22d93dbd0'
    ],
    visitingHours: '09:00-18:00',
    type: ArtisanType.Carpets,
    mapId: 'ensemble_artisanal',
    saved: false,
    startTime: '09:00',
    endTime: '18:00',
    city: 'casablanca',
    specialties: ['Hand-knotted rugs', 'Berber carpets', 'Kilim weaving'],
    isFeatured: true,
    about: 'Ensemble Artisanal in Casablanca is a government-supported crafts center designed to preserve traditional Moroccan arts and crafts while providing fair wages to artisans. Unlike the traditional souks, it offers fixed prices and authentic, high-quality products in a more organized setting. Visitors can watch artisans at work and purchase a wide range of handicrafts, with a particular focus on Morocco\'s famous carpet-making traditions.'
  },
  {
    id: '8',
    tag: '🧵 Artisan Souk',
    name: 'Souk Zrabi',
    description: 'Agadir\'s carpet souk, rebuilt after the 1960 earthquake, offering a wide variety of traditional Moroccan rugs and carpets.',
    address: 'Rue Souk, Agadir',
    coordinates: '30.4278,-9.6058',
    images: [
      'https://images.unsplash.com/photo-1581378579295-53bdfa3b6d3e',
      'https://images.unsplash.com/photo-1590095893397-ea5b9bc1b718'
    ],
    visitingHours: '10:00-20:00',
    type: ArtisanType.Carpets,
    mapId: 'souk_zrabi',
    saved: false,
    startTime: '10:00',
    endTime: '20:00',
    city: 'agadir',
    specialties: ['Amazigh carpets', 'Modern designs', 'Traditional weaving'],
    about: 'Souk Zrabi is the specialized carpet market in Agadir, known for its impressive selection of traditional Moroccan rugs. The souk was rebuilt and modernized after the 1960 earthquake that devastated much of the city. Today, it offers a more organized shopping experience than the ancient medinas, while still preserving the tradition of carpet making. Visitors can find both authentic tribal designs and contemporary interpretations of classic Moroccan patterns.'
  }
];

export default mockArtisans; 