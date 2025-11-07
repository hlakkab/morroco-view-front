// create a small card for the entertainment list

import React, { FC } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import CardItem from '../../components/cards/CardItem';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFirstImage } from '../../utils/useImages';
import { updateEntertainmentImage } from '../store/entertainmentSlice';

interface Entertainment {
	id: string;
	name: string;
	code?: string;
	images?: string[];
	address?: string;
	saved?: boolean;
	price?: number;
}

interface EntertainmentSmallCardProps {
	entertainment: Entertainment;
	handleSaveEntertainment: (item: Entertainment) => void;
	handleEntertainmentPress: (item: Entertainment) => void;
}

const EntertainmentSmallCard: FC<EntertainmentSmallCardProps> = ({ 
	entertainment, 
	handleSaveEntertainment, 
	handleEntertainmentPress 
}) => {
	// Get entertainment code/id for image fetching
	const entertainmentId = entertainment.code || entertainment.id;
	
	// Use hook to track image loading state
	const { imageUrl, loading } = useFirstImage(entertainmentId, entertainment.id, entertainment.images, updateEntertainmentImage);
	
	// Use fetched image or existing image
	const displayImage = imageUrl || (entertainment.images && entertainment.images.length > 0 ? entertainment.images[0] : undefined);
	const hasImage = !!displayImage;
	
	// Show loading indicator if image is being fetched
	const loadingPlaceholder = loading && !hasImage ? (
		<View style={styles.loadingContainer}>
			<ActivityIndicator size="small" color="#008060" />
		</View>
	) : undefined;

	return (
		<CardItem
			imageUrl={displayImage}
			title={entertainment.name}
			//subtitle={entertainment.address}
			tags={[
				{
					id: 'type',
					icon: <MaterialIcons name="local-activity" size={12} color="#008060" />,
					label: "Entertainment",
					style: { backgroundColor: '#E8F5F0', borderWidth: 1, borderColor: '#008060' },
					textStyle: { color: '#008060', fontWeight: '600' },
				},
			]}
			price={entertainment.price ? {
				value: entertainment.price,
				currency: 'MAD',
				prefix: 'From'
			} : undefined}
			actionIcon={
				<Ionicons
					name={entertainment.saved ? 'bookmark' : 'bookmark-outline'}
					size={20}
					color={entertainment.saved ? '#666' : '#000'}
				/>
			}
			onActionPress={() => handleSaveEntertainment(entertainment)}
			onCardPress={() => handleEntertainmentPress(entertainment)}
			containerStyle={styles.cardContainer}
			svgImage={!hasImage && !loading ? <Ionicons name="game-controller" size={32} color="#fff" /> : loadingPlaceholder}
			isSaved={entertainment.saved}
		/>
	);
};

const styles = StyleSheet.create({
	cardContainer: {
		marginBottom: 10,
	},
	loadingContainer: {
		width: 120,
		height: 100,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#F5F5F5',
		borderTopLeftRadius: 8,
		borderBottomLeftRadius: 8,
	},
});

export default EntertainmentSmallCard;
