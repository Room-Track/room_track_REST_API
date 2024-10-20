import type { BasicInfoCard_sql, FavoriteCard_res } from '../types/card';

export const format_to_favorites = (
	card: BasicInfoCard_sql
): FavoriteCard_res => {
	return {
		name: card.name,
		type: card.type,
		isFavorite: true,
	};
};
