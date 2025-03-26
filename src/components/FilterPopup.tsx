import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    PanResponder,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import CloseButton from "../assets/img/CloseButton.svg";
import ButtonFixe from "./ButtonFixe";

// Generic type for filter options
export type FilterOption = {
    id: string;
    label: string;
    selected: boolean;
    category: string;
    icon?: React.ReactNode;
};

// Category type with icon support
export type FilterCategory = {
    key: string;
    label: string;
    icon?: React.ReactNode;
};

interface FilterPopupProps {
    visible: boolean;
    onClose: () => void;
    filterOptions: FilterOption[];
    onApplyFilters: (selectedOptions: FilterOption[]) => void;
    title?: string;
    categories?: {
        [key: string]: FilterCategory;  // Maps category keys to display names and icons
    };
}

const FilterPopup: React.FC<FilterPopupProps> = ({
    visible,
    onClose,
    filterOptions,
    onApplyFilters,
    title = "Filter",
    categories = {
        city: { key: 'city', label: 'By City', icon: <Ionicons name="location" size={20} color="#CE1126" /> },
        stadium: { key: 'stadium', label: 'By Stadium', icon: <Ionicons name="football" size={20} color="#CE1126" /> },
        type: { key: 'type', label: 'By Type', icon: <Ionicons name="options" size={20} color="#CE1126" /> },
        price: { key: 'price', label: 'By Price', icon: <Ionicons name="cash" size={20} color="#CE1126" /> },
        features: { key: 'features', label: 'By Features', icon: <Ionicons name="list" size={20} color="#CE1126" /> }
    }
}) => {
    // Local state for managing selected options in the popup
    const [localOptions, setLocalOptions] = useState<FilterOption[]>(filterOptions);

    // Create an animated value for swipe gesture
    const pan = React.useRef(new Animated.ValueXY()).current;

    useEffect(() => {
        if (visible) {
            pan.setValue({ x: 0, y: 0 }); // Reset position
            setLocalOptions(filterOptions); // Reset options when popup opens
        }
    }, [visible, filterOptions]);

    // Create a pan responder for "drag to dismiss"
    const panResponder = React.useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    Animated.event([null, { dy: pan.y }], { useNativeDriver: false })(_, gestureState);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 100) {
                    onClose();
                } else {
                    Animated.spring(pan, {
                        toValue: { x: 0, y: 0 },
                        useNativeDriver: false
                    }).start();
                }
            }
        })
    ).current;

    // Group options by category
    const categorizedOptions = localOptions.reduce((acc, option) => {
        if (!acc[option.category]) {
            acc[option.category] = [];
        }
        acc[option.category].push(option);
        return acc;
    }, {} as Record<string, FilterOption[]>);

    // Function to select/deselect an option
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

    // Apply filters and close popup
    const handleApply = () => {
        onApplyFilters(localOptions);
        onClose();
    };

    // Reset filters
    const handleReset = () => {
        setLocalOptions(filterOptions.map(option => ({ ...option, selected: false })));
    };

    // Prevent touch propagation to avoid closing the modal
    const handleContentPress = (e: any) => {
        e.stopPropagation();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={{flex: 1}}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={handleContentPress}>
                            <Animated.View
                                style={[
                                    styles.modalContent,
                                    { transform: [{ translateY: pan.y }] }
                                ]}
                            >
                                <View style={styles.dragHandleContainer} {...panResponder.panHandlers}>
                                    <View style={styles.dragHandle} />
                                </View>
                                <View style={styles.modalHeader} {...panResponder.panHandlers}>
                                    <Text style={styles.modalTitle}>{title}</Text>
                                    <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
                                        <Text style={styles.resetText}>Reset</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                        <CloseButton />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView style={styles.filterContainer}>
                                    {Object.entries(categorizedOptions).map(([category, options]) => (
                                        <View key={category} style={styles.categoryContainer}>
                                            <View style={styles.categoryHeaderContainer}>
                                                {categories[category as keyof typeof categories]?.icon}
                                                <Text style={styles.categoryTitle}>
                                                    {categories[category as keyof typeof categories]?.label || category}
                                                </Text>
                                            </View>
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
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </View>
                    <ButtonFixe title={'Apply'} onPress={handleApply} />
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
        height: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
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
    categoryHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginLeft: 8,
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
    dragHandleContainer: {
        alignItems: 'center',
        paddingTop: 12,
        width: '100%',
        backgroundColor: '#FFFFFF',
    },
    dragHandle: {
        width: 100,
        height: 5,
        backgroundColor: '#D3D3D3',
        borderRadius: 2.5,
    },
});

export default FilterPopup;