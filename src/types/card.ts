export interface FavoriteCard_sql {
	name: string;
	user: string;
}

export interface BasicInfoCard_sql {
	name: string;
	type: string;
	building: string;
	floor: number;
}

export interface BuildingInfoCard_sql {
	name: string;
	lat: string;
	lng: string;
	inside: boolean;
	bot_floor: number;
	top_floor: number;
}

export interface FavoriteCard_res {
	name: string;
	type: string;
	isFavorite: boolean;
}
