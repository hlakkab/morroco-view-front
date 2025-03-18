import React, { useState, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Text, Image, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import ScreenHeader from '../components/ScreenHeader';
import ButtonFixe from '../components/ButtonFixe';
import { RootStackParamList } from '../types/navigation';
import { Entertainment } from '../types/Entertainment';
import AboutSection from '../components/AboutSection';
import LocationSection from '../components/LocationSection';
import SaveButton from '../components/SaveButtonPrf';

const { width } = Dimensions.get('window');

interface RouteParams extends Entertainment { }

const EntertainmentDetailScreenVo: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute();
    const params = route.params as RouteParams;

    const [isSaved, setIsSaved] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleSave = () => {
        setIsSaved(!isSaved);
    };

    const handleScroll = (event: any) => {
        const slideIndex = Math.floor(event.nativeEvent.contentOffset.x / width);
        setCurrentImageIndex(slideIndex);
    };

    const handleBook = () => {
        console.log("Book Now pressed");
    };

    // Utilise les images fournies ou, à défaut, l'image principale
    const images: string[] =
        (params.images && params.images.length > 0 ? params.images : [params.image]) as string[];


    /** Fonction qui génère les étoiles **/
    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating); // Nombre d'étoiles pleines
        const hasHalfStar = rating % 1 >= 0.5; // Vérifie si une demi-étoile est nécessaire

        return (
            <View style={styles.starContainer}>
                {/* Affichage des étoiles pleines */}
                {Array.from({ length: fullStars }).map((_, index) => (
                    <FontAwesome key={`full-${index}`} name="star" size={20} color="#FFD700" />
                ))}

                {/* Affichage d'une demi-étoile si nécessaire */}
                {hasHalfStar && <FontAwesome name="star-half-empty" size={20} color="#FFD700" />}

                {/* Affichage de la valeur du rating à côté des étoiles */}
                <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
        );
    };




    return (
        <SafeAreaView style={styles.container}>
            <ScreenHeader title={params.title} />
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
                            <Image
                                source={{ uri: item }}
                                style={styles.image}
                                resizeMode="cover"
                            />
                        )}
                    />

                    <SaveButton />

                    <View style={styles.paginationContainer}>
                        <View style={styles.pagination}>
                            {images.map((_, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.paginationDot,
                                        index === currentImageIndex && styles.activePaginationDot
                                    ]}
                                />
                            ))}
                        </View>
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={styles.ratingContainer}>
                        {renderStars(params.rating)}
                        <Text style={styles.ratingText}>({params.ratingCount} reviews)</Text>
                    </View>


                    <Text style={styles.sectionTitle}>Specifications</Text>

                    <View style={styles.specificationsContainer}>                       
                        <View style={styles.specItem}>
                            <Ionicons name="cash-outline" size={20} color="#666" />
                            <Text style={styles.specText}>From ${parseFloat(params.price).toFixed(2)}</Text>
                        </View>
                    </View>
                    <AboutSection text={params.description || 'No description available.'} />
                    <LocationSection address={params.location} mapUrl={params.mapUrl} />

                </View>
            </ScrollView>
            <ButtonFixe title="Book Now" onPress={handleBook} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF7F7',
    },
    scrollView: {
        flex: 1,
    },
    imageSection: {
        position: 'relative',
        width: 370,
        alignSelf: 'center',
        alignItems: 'center',
        //  alignContent: 'center',
        height: 240,
        backgroundColor: 'FFF7F7',
        padding: 1,
        borderRadius: 32,
    },
    image: {
        width: 369,
        height: 240,
        borderRadius: 32,
        alignSelf: 'center',
    },
    paginationContainer: {
        position: 'absolute',
        bottom: 16,
        width: '100%',
        alignItems: 'center',
    },
    pagination: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.5)',
        marginHorizontal: 4,
    },
    activePaginationDot: {
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        width: '100%',
        backgroundColor: '#fff',
        padding: 16,
        paddingBlockEnd: '10%',
        marginTop: 10,
        borderTopRightRadius: 32,
        borderTopLeftRadius: 32,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        marginLeft: 6,
    },
    ratingText: {
        marginLeft: 4,
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
        marginLeft: 6,
        color: '#000',
    },
    specificationsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginLeft: 6,
    },
    specItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%',
        //marginBottom: 1,
    },
    specText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
    },
    starContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

});

export default EntertainmentDetailScreenVo;
