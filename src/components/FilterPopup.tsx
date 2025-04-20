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
import { useLanguage } from '../contexts/LanguageContext';
import i18n from '../translations/i18n';
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
    title = i18n.t('common.filter'),
    categories = {
        city: { key: 'city', label: i18n.t('filters.byCity'), icon: <Ionicons name="location" size={20} color="#CE1126" /> },
        stadium: { key: 'stadium', label: i18n.t('filters.byStadium'), icon: <Ionicons name="football" size={20} color="#CE1126" /> },
        type: { key: 'type', label: i18n.t('filters.byType'), icon: <Ionicons name="options" size={20} color="#CE1126" /> },
        price: { key: 'price', label: i18n.t('filters.byPrice'), icon: <Ionicons name="cash" size={20} color="#CE1126" /> },
        features: { key: 'features', label: i18n.t('filters.byFeatures'), icon: <Ionicons name="list" size={20} color="#CE1126" /> }
    }
}) => {
    // Local state for managing selected options in the popup
    const [localOptions, setLocalOptions] = useState<FilterOption[]>(filterOptions);
    const { currentLanguage } = useLanguage();

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
                                <View style={styles.headerSection}>
                                    <View style={styles.modalHeader} {...panResponder.panHandlers}>
                                        <View style={styles.titleContainer}>
                                            <Ionicons name="filter" size={22} color="#CE1126" style={styles.titleIcon} />
                                            <Text style={styles.modalTitle}>{title}</Text>
                                        </View>
                                        <View style={styles.headerControls}>
                                            <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
                                                <Ionicons name="refresh-outline" size={14} color="#CE1126" style={styles.resetIcon} />
                                                <Text style={styles.resetText}>{i18n.t('common.reset')}</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                                <CloseButton />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View style={styles.headerDivider} />
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
                    <ButtonFixe title={i18n.t('common.apply')} onPress={handleApply} />
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
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '85%',
    },
    headerSection: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingVertical: 18,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        paddingRight: 8,
    },
    titleIcon: {
        marginRight: 6,
        flexShrink: 0,
    },
    headerControls: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 0,
    },
    closeButton: {
        marginLeft: 6,
    },
    resetButton: {
        backgroundColor: '#FCEBEC',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    resetIcon: {
        marginRight: 4,
    },
    resetText: {
        color: '#CE1126',
        fontSize: 14,
        fontWeight: '600',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        flexShrink: 1,
    },
    headerDivider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        width: '100%',
    },
    filterContainer: {
        padding: 20,
        maxHeight: '70%',
    },
    categoryContainer: {
        marginBottom: 24,
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
        width: 40,
        height: 5,
        backgroundColor: '#E0E0E0',
        borderRadius: 2.5,
    },
});

export default FilterPopup;