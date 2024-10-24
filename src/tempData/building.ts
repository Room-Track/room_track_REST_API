import type { BuildingInfoCard_sql } from '../types/card';

export const temp_buildings_data: Array<BuildingInfoCard_sql> = [
	{
		name: 'M',
		lat: '-1',
		lng: '1',
		inside: true,
		bot_floor: 1,
		top_floor: 4,
	},
	{
		name: 'P',
		lat: '-2',
		lng: '2',
		inside: false,
		bot_floor: -1,
		top_floor: 4,
	},
];
