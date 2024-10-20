
export interface FavoriteCard_sql {
	name: string;
	user: string;
}

export interface BasicInfoCard_sql {
	name: string;
	type: string;
}

export interface FavoriteCard_res {
	name: string;
	type: string;
	isFavorite: boolean;
}
