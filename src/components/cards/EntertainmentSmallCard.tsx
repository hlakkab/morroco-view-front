// create a small card for the entertainment list

import React, { FC } from 'react';
import { StyleSheet } from 'react-native';
import CardItem from './CardItem';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Entertainment {
	id: string;
	name: string;
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
	return (
		<CardItem
			imageUrl={entertainment.images?.[0]}
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
			svgImage={<Ionicons name="game-controller" size={32} color="#fff" />}
			isSaved={entertainment.saved}
		/>
	);
};

const styles = StyleSheet.create({
	cardContainer: {
		marginBottom: 10,
	}
});

export default EntertainmentSmallCard;
