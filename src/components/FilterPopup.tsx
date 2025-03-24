import React, {useEffect, useRef, useState} from 'react';
import {
    StyleSheet,
    View,
    Text,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ScrollView,
    Platform, Dimensions, Animated, PanResponder
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RestaurantType } from '../types/Restaurant';
import {maxWithOptions} from "date-fns/fp";
import ButtonFixe from "./ButtonFixe";
import CloseButton from "../assets/img/CloseButton.svg";

// Type générique pour les options de filtre
export type FilterOption = {
    id: string;
    label: string;
    selected: boolean;
    category: string;  // La catégorie à laquelle appartient cette option (ex: "city", "type", etc.)
    icon?: React.ReactNode;
};

interface FilterPopupProps {
    visible: boolean;
    onClose: () => void;
    filterOptions: FilterOption[];
    onApplyFilters: (selectedOptions: FilterOption[]) => void;
    title?: string;
}

const FilterPopup: React.FC<FilterPopupProps> = ({
                                                     visible,
                                                     onClose,
                                                     filterOptions,
                                                     onApplyFilters,
                                                     title = "Filtrer"
                                                 }) => {
    // État local pour gérer les options sélectionnées dans le popup
    const [localOptions, setLocalOptions] = useState<FilterOption[]>(filterOptions);

    // Créer une valeur animée pour le geste de glissement
    const pan = React.useRef(new Animated.ValueXY()).current;

    useEffect(() => {
        if (visible) {
            pan.setValue({ x: 0, y: 0 }); // Réinitialise la position
        }
    }, [visible]);


    // Créer un pan responder pour le "drag to dismiss"
    const panResponder = React.useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                // Permettre uniquement un mouvement vers le bas
                if (gestureState.dy > 0) {
                    Animated.event([null, { dy: pan.y }], { useNativeDriver: false })(_, gestureState);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 100) {
                    // Si glissé de plus de 100 unités vers le bas, fermer le modal
                    onClose();
                } else {
                    // Sinon, réinitialiser la position
                    Animated.spring(pan, {
                        toValue: { x: 0, y: 0 },
                        useNativeDriver: false
                    }).start();
                }
            }
        })
    ).current;

    // Regrouper les options par catégorie
    const categorizedOptions = localOptions.reduce((acc, option) => {
        if (!acc[option.category]) {
            acc[option.category] = [];
        }
        acc[option.category].push(option);
        return acc;
    }, {} as Record<string, FilterOption[]>);

    // Fonction pour sélectionner/désélectionner une option
    const toggleOption = (optionId: string) => {
        setLocalOptions(prevOptions =>
            prevOptions.map(option => {
                if (option.id === optionId) {
                    return { ...option, selected: !option.selected };
                }
                return option;
            })
        );
    };





    // Appliquer les filtres et fermer le popup
    const handleApply = () => {
        onApplyFilters(localOptions);
        onClose();
    };

    // Réinitialiser les filtres
    const handleReset = () => {
        setLocalOptions(filterOptions.map(option => ({ ...option, selected: false })));
    };

    // Empêcher la propagation du toucher pour éviter la fermeture du modal
    const handleContentPress = (e: any) => {
        e.stopPropagation();
    };

    // Traduction des catégories en français
    const getCategoryTitle = (category: string): string => {
        switch (category) {
            case 'city': return 'Per City';
            case 'type': return 'Per Type ';
            case 'price': return 'Per Price';
            case 'features': return 'Per Features';
            default: return category.charAt(0).toUpperCase() + category.slice(1);
        }
    };

    return (



        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                {/* Regroupe tout dans une seule vue */}
                <View style={{flex: 1}}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback onPress={handleContentPress}>
                        <Animated.View
                            style={[
                                styles.modalContent,
                                { transform: [{ translateY: pan.y }] }
                            ]}
                        >
                            {/* Add a drag handle that uses the panResponder */}
                            <View style={styles.dragHandleContainer} {...panResponder.panHandlers}>
                                <View style={styles.dragHandle} />
                            </View>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{title}</Text>

                                <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
                                    <Text style={styles.resetText}>Réinitialiser</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                    <CloseButton />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.filterContainer}>
                                {Object.entries(categorizedOptions).map(([category, options]) => (
                                    <View key={category} style={styles.categoryContainer}>
                                        <Text style={styles.categoryTitle}>{getCategoryTitle(category)}</Text>
                                        <View style={styles.optionsContainer}>
                                            {options.map(option => (
                                                <TouchableOpacity
                                                    key={option.id}
                                                    style={[
                                                        styles.optionButton,
                                                        option.selected ? styles.optionButtonSelected : {}
                                                    ]}
                                                    onPress={() => toggleOption(option.id)}
                                                >
                                                    <Text style={[
                                                        styles.optionText,
                                                        option.selected ? styles.optionTextSelected : {}
                                                    ]}>
                                                        {option.label}
                                                    </Text>
                                                    {option.selected && (
                                                        <Ionicons
                                                            name="checkmark"
                                                            size={18}
                                                            color="#FFF"
                                                            style={styles.checkmark}
                                                        />
                                                    )}
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>

                                {/*   <View style={styles.buttonContainer}>
                              <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                                    <Text style={styles.applyButtonText}>Appliquer</Text>
                                </TouchableOpacity>
                            </View>*/}

                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
                    <ButtonFixe title={'Appliquer'} onPress={handleApply} />
                </View>
            </TouchableWithoutFeedback>


        </Modal>
    );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF7F7',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        //maxHeight: '80%',
        height: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    closeButton: {
        padding: 4,
    },
    resetButton: {
        padding: 4,
    },
    resetText: {
        color: '#FF6B81',
        fontSize: 15,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    filterContainer: {
        padding: 16,
        maxHeight: '70%',
    },
    categoryContainer: {
        marginBottom: 20,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        marginBottom: 8,
    },
    optionButtonSelected: {
        backgroundColor: '#CE1126',
    },
    optionText: {
        fontSize: 14,
        color: '#333',
    },
    optionTextSelected: {
        color: '#FFFFFF',
    },
    checkmark: {
        marginLeft: 4,
    },
    buttonContainer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    applyButton: {
        backgroundColor: '#CE1126',
        borderRadius: 25,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    applyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    dragHandleContainer: {
        alignItems: 'center',
        paddingTop: 12,
        width: '100%',
    },
    dragHandle: {
        width: 100,
        height: 5,
        backgroundColor: '#D3D3D3',
        borderRadius: 2.5,
    },
});

export default FilterPopup;
// le coorrreeecte