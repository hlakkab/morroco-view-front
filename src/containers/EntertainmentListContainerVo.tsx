import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import CardItem from '../components/cards/CardItem';
import { RootStackParamList } from '../types/navigation';
import { Entertainment } from '../types/Entertainment';
import Ionicons from '@expo/vector-icons/Ionicons';
import SaveButton from '../components/SaveButton';

interface EntertainmentListContainerProps {
    entertainments: Entertainment[];
}

const EntertainmentListContainerVo: React.FC<EntertainmentListContainerProps> = ({ entertainments }) => {
    const [savedEntertainments, setSavedEntertainments] = useState<Record<string, boolean>>({});
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const handleEntertainmentPress = (ent: Entertainment) => {
        navigation.navigate('EntertainmentDetail', {
            id: ent.id,
            rating: ent.rating,
            ratingCount: ent.ratingCount,
            fullStars: ent.fullStars,
            hasHalfStar: ent.hasHalfStar,
            title: ent.title,
            location: ent.location,
            price: ent.price,
            image: ent.image,
        });
    };

    const handleSaveEntertainment = (id: string) => {
        setSavedEntertainments(prev => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

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
        <View style={styles.container}>
            {entertainments.length > 0 ? (
                <FlatList
                    data={entertainments}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.CardEntertainmentContainer}>
                        <CardItem
                            imageUrl={item.image}
                            title={item.title}
                            subtitle={`From  $${item.price}`}
                            customStyles={{
                                mainTag: {
                                    marginTop: 10,
                                    backgroundColor: '#F6FAFF',
                                    borderWidth: 0,
                                    borderColor: '#FFD700',
                                    paddingHorizontal: 6,
                                    paddingVertical: 3,
                                    borderRadius: 16,
                                },
                                mainTagText: {
                                    left : 2,
                                    color: 'black',
                                    fontWeight: '700',
                                    fontSize: 14.5,
                                },  
                                container: {
                                    backgroundColor: 'white',
                                    borderRadius: 12,
                                    marginBottom: 16,
                                    overflow: 'hidden',
                                    elevation: 3,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 4,
                                    //padding: 16,
                                    flexDirection: 'column',
                                    paddingHorizontal: 0,
                                    paddingVertical: 0,

                                },
                                image: {
                                    width: '104%',
                                    height: 200,
                                    paddingBottom: 30,
                                    left: 3,
                                },
                                content: {
                                    padding: 16,
                                    paddingTop: 8,
                                    gap: 8,
                                    paddingBottom: 8,
                                },
                                title: {
                                    fontSize: 18,
                                    fontWeight: 'bold',
                                    marginBottom: 8,
                                    color: '#000',
                                },
                                subtitle: {
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    color: '#006400',
                                },
                            }}
                            tags={[
                                {
                                  id: 'rating',
                                  icon: renderStars(item.rating), // Ajout des étoiles + valeur du rating
                                  label: `(${item.ratingCount} reviews)`,
                                },
                              ]}
                              
                           
                            onCardPress={() => handleEntertainmentPress(item)}
                            containerStyle={{ marginBottom: 16 }}
                        />
                        <SaveButton
                            onPress={() => handleSaveEntertainment(item.id)}
                            isSaved={savedEntertainments[item.id]}
                        />
                        </View>
                    )}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <FontAwesome name="search" size={48} color="#ccc" />
                    <Text style={styles.emptyText}>No entertainments found.</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 16,
        textAlign: 'center',
    },
    starContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 6, // Espacement entre les étoiles et le texte
      },
      CardEntertainmentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        alignContent: 'center',
        alignSelf: 'center',
        justifyContent: 'space-between',
      },
});

export default EntertainmentListContainerVo;
