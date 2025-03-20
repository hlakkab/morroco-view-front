import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Text, Image, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import ScreenHeader from '../components/ScreenHeader';
import ButtonFixe from '../components/ButtonFixe';
import { RootStackParamList } from '../types/navigation';
import AboutSection from '../components/AboutSection';
import LocationSection from '../components/LocationSection';
import SaveButton from '../components/SaveButtonPrf';
import { Entertainment, entertainmentHelpers } from '../types/Entertainment';
import ViatorService from '../service/ViatorService';

const { width } = Dimensions.get('window');

// Type pour les paramètres de route
type EntertainmentDetailRouteProp = RouteProp<RootStackParamList, 'EntertainmentDetail'>;

const EntertainmentDetailScreenVo: React.FC = () => {
    // Récupération des paramètres de route (productCode et title)
    const route = useRoute<EntertainmentDetailRouteProp>();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { productCode, title } = route.params;

    // Initialisation des états
    const [entertainment, setEntertainment] = useState<Entertainment | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const flatListRef = useRef<FlatList>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isSaved, setIsSaved] = useState(false);

    // Appel à l'API pour récupérer les données détaillées du produit
    useEffect(() => {
        const fetchDetail = async () => {
            if (!productCode) {
                setError('No product code provided');
                setLoading(false);
                return;
            }

            try {
                console.log(`Fetching details for product: ${productCode}`);
                const detailData = await ViatorService.getProductDetail(productCode);
                console.log('API Response:', JSON.stringify(detailData).substring(0, 200));

                if (!detailData) {
                    throw new Error('No data returned from API');
                }

                // Adapter les données au format Entertainment
                const adaptedData: Entertainment = {
                    id: detailData.productCode,
                    productCode: detailData.productCode,
                    title: detailData.title || title, // Utiliser le titre passé en paramètre si nécessaire
                    description: detailData.description || '',
                    location: detailData.location?.name || 'Morocco', // Utiliser la structure correcte pour la localisation
                    images: detailData.images || [],
                    pricing: {
                        summary: {
                            fromPrice: detailData.pricing?.summary?.fromPrice || 0,
                            fromPriceBeforeDiscount: detailData.pricing?.summary?.fromPriceBeforeDiscount || 0
                        }
                    },
                    reviews: detailData.reviews || { totalReviews: 0, combinedAverageRating: 0 },
                    fullStars: Math.floor(detailData.reviews?.combinedAverageRating || 0),
                    hasHalfStar: ((detailData.reviews?.combinedAverageRating || 0) % 1) >= 0.5,
                    mapUrl: detailData.productUrl || '',
                    itinerary: detailData.itinerary,
                    logistics: detailData.logistics,
                    ticketInfo: detailData.ticketInfo,
                    languageGuides: detailData.languageGuides,
                };

                console.log('Adapted data created successfully');
                setEntertainment(adaptedData);
                setLoading(false);
            } catch (err: any) {
                console.error('Error fetching entertainment details:', err);
                setError(err.message || 'Error fetching product detail');
                setLoading(false);
            }
        };

        fetchDetail();
    }, [productCode, title]);

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ScreenHeader title={title || 'Loading...'} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#000" />
                    <Text style={styles.loadingText}>Loading entertainment details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !entertainment) {
        return (
            <SafeAreaView style={styles.container}>
                <ScreenHeader title={title || 'Error'} />
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={50} color="red" />
                    <Text style={styles.errorText}>{error || 'Failed to load entertainment details'}</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Calcul du rating à partir de reviews
    const rating = entertainment.reviews.combinedAverageRating;
    const ratingCount = entertainment.reviews.totalReviews;

    // Construction du tableau d'URLs d'images
    const images: string[] =
        entertainment.images && entertainment.images.length > 0
            ? entertainment.images
                .map(img => {
                    if (!img.variants || img.variants.length === 0) return '';
                    const sortedVariants = [...img.variants].sort((a, b) => (b.width * b.height) - (a.width * a.height));
                    const idealVariant = sortedVariants.find(v => v.width >= 720 && v.width <= 1080) || sortedVariants[0];
                    return idealVariant?.url || '';
                })
                .filter(url => url !== '')
            : ['https://via.placeholder.com/300'];

    // Calcul de la durée (si renseignée dans l'itinéraire)
    let durationText = '';
    if (entertainment.itinerary && entertainment.itinerary.duration) {
        const minutes = entertainment.itinerary.duration.fixedDurationInMinutes ||
            entertainment.itinerary.duration.variableDurationFromMinutes;
        if (minutes) {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            if (hours > 0 && remainingMinutes > 0) {
                durationText = `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} min`;
            } else if (hours > 0) {
                durationText = `${hours} hour${hours > 1 ? 's' : ''}`;
            } else {
                durationText = `${minutes} minutes`;
            }
        }
    }

    const pickupOffered = entertainment.logistics?.travelerPickup?.allowCustomTravelerPickup ? 'Pickup offered' : '';
    const ticketType = entertainment.ticketInfo?.ticketTypes?.includes('MOBILE_ONLY') ? 'Mobile Ticket' : '';

    let guideLabel = '';
    if (entertainment.languageGuides && entertainment.languageGuides.length > 0) {
        const guideLangs = entertainment.languageGuides.filter(g => g.type === 'GUIDE');
        if (guideLangs.length > 0) {
            const primaryGuide = guideLangs.find(g => g.language === 'en') || guideLangs[0];
            const extraCount = guideLangs.length - 1;
            guideLabel = `In-person Guide\nIn ${primaryGuide.language === 'en' ? 'English' : primaryGuide.language}${extraCount > 0 ? ` & ${extraCount} more` : ''}`;
        }
    }

    // Fonction pour afficher les étoiles de rating
    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        return (
            <View style={styles.starContainer}>
                {Array.from({ length: fullStars }).map((_, index) => (
                    <FontAwesome key={`full-${index}`} name="star" size={20} color="#FFD700" />
                ))}
                {hasHalfStar && <FontAwesome name="star-half-empty" size={20} color="#FFD700" />}
                <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
        );
    };

    const handleSave = () => {
        setIsSaved(!isSaved);
    };

    const handleScroll = (event: any) => {
        const slideIndex = Math.floor(event.nativeEvent.contentOffset.x / width);
        setCurrentImageIndex(slideIndex);
    };

    const handleBook = () => {
        // Implémentation future pour la réservation
        console.log("Book Now pressed for:", entertainment.productCode);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <ScreenHeader title={entertainment.title} />
            </View>
            <ScrollView style={styles.scrollView}>
                <View style={styles.imageSection}>
                    <FlatList
                        ref={flatListRef}
                        data={images}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        keyExtractor={(_, index) => index.toString()}
                        renderItem={({ item }) => (
                            <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
                        )}
                    />
                    <SaveButton onPress={handleSave} isSaved={isSaved} />

                    {/* Indicateurs de pagination pour les images */}
                    {images.length > 1 && (
                        <View style={styles.paginationContainer}>
                            {images.map((_, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.paginationDot,
                                        { backgroundColor: currentImageIndex === index ? '#007AFF' : '#D8D8D8' }
                                    ]}
                                />
                            ))}
                        </View>
                    )}
                </View>

                <View style={styles.content}>
                    <View style={styles.ratingContainer}>
                        {renderStars(rating)}
                        <Text style={styles.reviewsText}>({ratingCount} reviews)</Text>
                    </View>

                    <Text style={styles.sectionTitle}>Specifications</Text>
                    <View style={styles.specificationsContainer}>
                        {durationText !== '' && (
                            <View style={styles.specItem}>
                                <Ionicons name="time-outline" size={20} color="#666" />
                                <Text style={styles.specText}>{durationText}</Text>
                            </View>
                        )}
                        {pickupOffered !== '' && (
                            <View style={styles.specItem}>
                                <Ionicons name="car-outline" size={20} color="#666" />
                                <Text style={styles.specText}>{pickupOffered}</Text>
                            </View>
                        )}
                        {ticketType !== '' && (
                            <View style={styles.specItem}>
                                <Ionicons name="ticket-outline" size={20} color="#666" />
                                <Text style={styles.specText}>{ticketType}</Text>
                            </View>
                        )}
                        {guideLabel !== '' && (
                            <View style={styles.specItem}>
                                <Ionicons name="person-outline" size={20} color="#666" />
                                <Text style={styles.specText}>{guideLabel}</Text>
                            </View>
                        )}
                       {/* <View style={styles.specItem}>
                            <Ionicons name="cash-outline" size={20} color="#666" />
                            <Text style={styles.specText}>
                                From ${entertainmentHelpers.getFormattedPrice(entertainment)}
                            </Text> 
                        </View> */}
                    </View>

                    <AboutSection text={entertainmentHelpers.cleanDescription(entertainment.description || 'No description available.')} />

                    <LocationSection address={entertainment.location} mapUrl={entertainment.mapUrl} />
                </View>
            </ScrollView>
            <ButtonFixe title="Book Now" onPress={handleBook} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF7F7'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    scrollView: {
        flex: 1
    },
    headerContainer: {
        paddingTop: 16,
        paddingHorizontal: 16,
    },
    imageSection: {
        position: 'relative',
        width: 370,
        alignSelf: 'center',
        alignItems: 'center',
        height: 240,
        backgroundColor: '#FFF7F7',
        padding: 1,
        borderRadius: 32,
        marginTop: 10,
    },
    image: {
        width: 368.1,
        height: 240,
        borderRadius: 32,
        alignSelf: 'center',
        marginRight:0.1
    },
    paginationContainer: {
        position: 'absolute',
        bottom: 10,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    content: {
        flex: 1,
        width: '100%',
        backgroundColor: '#fff',
        padding: 16,
        marginTop: 10,
        borderTopRightRadius: 32,
        borderTopLeftRadius: 32,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        marginLeft: 6
    },
    ratingText: {
        marginLeft: 4,
        fontSize: 16,
        fontWeight: '600',
        color: '#333'
    },
    reviewsText: {
        marginLeft: 4,
        fontSize: 16,
        fontWeight: '600',
        color: '#333'
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 10,
        marginLeft: 0,
        color: '#000'
    },
    specificationsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginLeft: 6,
        marginBottom: 6
    },
    specItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%',
        marginBottom: 8
    },
    specText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666'
    },
    starContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
        padding: 20
    },
});

export default EntertainmentDetailScreenVo;