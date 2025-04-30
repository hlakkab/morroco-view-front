import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export interface PaginationProps {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
                                                   totalItems,
                                                   itemsPerPage,
                                                   currentPage,
                                                   onPageChange,
                                               }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const getPages = (): (number | '...')[] => {
        const pages: (number | '...')[] = [];

        if (totalPages <= 3) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 2) {
                pages.push(1, 2, 3);
                if (totalPages > 3) pages.push('...');
            } else if (currentPage >= totalPages - 1) {
                if (totalPages > 3) pages.push('...');
                pages.push(totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push('...');
                pages.push(currentPage - 1, currentPage, currentPage + 1);
                pages.push('...');
            }
        }

        return pages;
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.arrow, styles.leftArrow, currentPage === 1 && styles.disabledArrow]}
                onPress={() => currentPage > 1 && onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <Text style={styles.arrowText}>{'<'}</Text>
            </TouchableOpacity>

            {getPages().map((page, idx) => (
                <TouchableOpacity
                    key={idx}
                    style={[styles.page, page === currentPage && styles.activePage]}
                    onPress={() => typeof page === 'number' && onPageChange(page)}
                    disabled={page === '...'}
                >
                    <Text style={page === currentPage ? styles.activeText : styles.text}>{page}</Text>
                </TouchableOpacity>
            ))}

            <TouchableOpacity
                style={[styles.arrow, styles.rightArrow, currentPage === totalPages && styles.disabledArrow]}
                onPress={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <Text style={styles.arrowText}>{'>'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignSelf: 'center',
        marginVertical: 10,
        alignItems: 'center',
    },
    // arrow: {
    //     padding: 10,
    // },
    arrowText: {
        fontSize: 18,
        color: '#E63946',
    },
    page: {
        paddingVertical: 2,      // même que les flèches
        paddingHorizontal: 8,   // valeur horizontale équilibrée
        marginHorizontal: 10,
        borderRadius: 5,
    },
    activePage: {
        backgroundColor: '#E63946',
    },
    text: {
        fontSize: 16,
        color: '#000',
    },
    activeText: {
        color: 'white',
        fontWeight: 'bold',
    },
    arrow: {
        paddingVertical: 3,
        paddingHorizontal: 16,
      //  backgroundColor: '#F1FAEE',
        backgroundColor: '#fff',
        marginHorizontal: 10,
        borderRadius: 8,

        // Ombre pour iOS
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,

        // Ombre pour Android
        elevation: 5,
    },

    leftArrow: {
       borderRadius: 8,
    },

    rightArrow: {
        borderRadius: 8,
    },

    disabledArrow: {
        opacity: 0.5,
    },
});

export default Pagination;